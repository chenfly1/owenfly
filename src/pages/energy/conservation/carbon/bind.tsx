import DrawerForm from '@/components/DrawerForm';
import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import MeterTree, { MeterTreeFormProps } from '../../meterTree';
import { ModalFormRef } from '@/components/ModalForm';
import { createRef, useRef } from 'react';
import {
  bindMeterWithCarbonIncicator,
  getMeterWithCarbonIndicator,
  unbindMeterWithCarbonIncicator,
} from '@/services/energy';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { meterTypeEnum } from '../../config';

const BindMeter = MeterTree({
  title: '绑定仪表',
  params: {
    insType: meterTypeEnum.electric,
  },
});

export interface CarbinBindMeterFormProps {
  id: number;
}
const Content = (props: { source?: CarbinBindMeterFormProps }) => {
  const bindRef = createRef<ModalFormRef<MeterTreeFormProps>>();
  const tableRef = useRef<ActionType>();
  const columns: ProColumns<CarbonIndicatorBindMeterType>[] = [
    {
      title: '仪表编号',
      key: 'syncId',
      dataIndex: 'syncId',
      hideInSearch: true,
    },
    {
      title: '仪表名称',
      key: 'cnName',
      dataIndex: 'cnName',
      hideInSearch: true,
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      hideInSearch: true,
    },
    {
      title: '计量位置',
      key: 'meterSpaceFullName',
      dataIndex: 'meterSpaceFullName',
      hideInSearch: true,
    },
    {
      title: '安装位置',
      key: 'installationSpaceName',
      dataIndex: 'installationSpaceName',
      hideInSearch: true,
    },
    {
      title: '绑定时间',
      key: 'bindingTime',
      dataIndex: 'bindingTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'options',
      dataIndex: 'options',
      hideInSearch: true,
      render: (_, row: CarbonIndicatorBindMeterType) => {
        return (
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                icon: <ExclamationCircleFilled />,
                title: `确定删除 ${row.cnName} 指标吗？`,
                centered: true,
                onOk: async () => {
                  const res = await unbindMeterWithCarbonIncicator(props.source!.id, {
                    insIds: [row.id],
                  });
                  tableRef.current?.reloadAndRest?.();
                  return res;
                },
              });
            }}
          >
            解绑
          </Button>
        );
      },
    },
  ];

  /** 获取指标列表 */
  const getList = async ({ id, current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getMeterWithCarbonIndicator(id, options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  return (
    <>
      <ProTable<CarbonIndicatorBindMeterType, { id?: number }>
        style={{ width: '100%' }}
        className="pro--no-padding"
        columns={columns}
        search={false}
        options={false}
        actionRef={tableRef}
        params={{ id: props.source?.id }}
        request={getList}
        form={{ colon: false }}
        rowKey="id"
        headerTitle={
          <Button
            type="primary"
            className="mb-5"
            onClick={() => {
              bindRef.current?.open();
            }}
          >
            新增
          </Button>
        }
      />
      <BindMeter
        ref={bindRef}
        submit={async (values) => {
          try {
            if (!values?.leafValues?.length) {
              message.warning('请勾选仪表数据');
              return false;
            }
            await bindMeterWithCarbonIncicator(props.source!.id, {
              insIds: values.leafValues,
            });
            tableRef?.current?.reloadAndRest?.();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
    </>
  );
};

export default DrawerForm<CarbinBindMeterFormProps>(Content, {
  width: 800,
  title: '绑定仪表',
  confirm: true,
});
