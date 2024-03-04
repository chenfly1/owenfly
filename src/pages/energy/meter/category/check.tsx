import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import DrawerForm from '@/components/DrawerForm';
import { Button, Modal, Space, message } from 'antd';
import { createRef, useEffect, useRef, useState } from 'react';
import { bindMeterCategory, getMeterList, unbindMeterCategory } from '@/services/energy';
import MeterTree from '../../meterTree';
import { ExclamationCircleFilled } from '@ant-design/icons';

const RelateForm = MeterTree({
  title: '关联分项',
  params: {
    insTagId: -1, // 标记筛查为无关联分项的表
  },
});

export type CheckCategoryFormProps = Pick<CategoryItemType, 'id' | 'cnName'>;
export default DrawerForm<CheckCategoryFormProps>(
  ({ source }) => {
    const [params, setParams] = useState<{ insTagId: string }>();
    const relateRef = createRef<any>();
    const tableRef = useRef<ActionType>();
    const columns: ProColumns<MeterItemType>[] = [
      {
        title: '仪表表号',
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
        title: '计量位置',
        key: 'meterSpaceFullName',
        dataIndex: 'meterSpaceFullName',
        hideInSearch: true,
      },
      {
        title: '关联时间',
        key: 'updateInsTagTime',
        dataIndex: 'updateInsTagTime',
        hideInSearch: true,
      },
      {
        title: '关联人',
        key: 'tagUpdater',
        dataIndex: 'tagUpdater',
        hideInSearch: true,
      },
      {
        title: '操作',
        key: 'options',
        dataIndex: 'options',
        hideInSearch: true,
        width: 100,
        render: (_, row) => {
          return (
            <>
              <Button
                danger
                type="link"
                onClick={async () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定解除仪表 ${row.cnName} 的分项关联吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await unbindMeterCategory(params!.insTagId, {
                        insIds: [row.id],
                      });
                      tableRef.current?.reloadAndRest?.();
                      return res;
                    },
                  });
                }}
              >
                解除关联
              </Button>
            </>
          );
        },
      },
    ];

    /** 获取关联仪表 */
    const getList = async ({ current, ...rest }: ParamsType) => {
      const options = { ...rest, pageNo: current };
      const res = await getMeterList(options);
      return {
        data: res?.items || [],
        success: res?.items ? true : false,
        total: res?.page?.totalItems,
      };
    };

    useEffect(() => {
      if (source?.id !== undefined) {
        setParams({ insTagId: `${source.id}` });
      }
    }, [source]);

    return (
      <>
        <ProTable<MeterItemType, { insTagId: string }>
          className="pro--no-padding"
          style={{ width: '100%' }}
          actionRef={tableRef}
          form={{ colon: false }}
          headerTitle={
            <Space>
              <Button className="p-0" type="text">
                分项名称：{source?.cnName}
              </Button>
              <Button
                key="relate"
                type="primary"
                onClick={() => {
                  relateRef.current?.open();
                }}
              >
                关联
              </Button>
            </Space>
          }
          toolbar={{
            className: 'pro--no-padding',
            style: {
              marginBottom: 16,
            },
          }}
          search={false}
          options={false}
          columns={columns}
          params={params}
          request={getList}
          pagination={{ showSizeChanger: true, pageSize: 10 }}
        />
        <RelateForm
          ref={relateRef}
          submit={async (values) => {
            try {
              if (source?.id) {
                if (!values?.leafValues?.length) {
                  message.warning('请勾选仪表数据');
                  return false;
                }
                await bindMeterCategory(`${source.id}`, {
                  insIds: values.leafValues || [],
                });
                tableRef?.current?.reloadAndRest?.();
                return true;
              }
              return false;
            } catch (err) {
              return false;
            }
          }}
        />
      </>
    );
  },
  {
    width: 800,
    title: '查看分项关联仪表',
    confirm: true,
  },
);
