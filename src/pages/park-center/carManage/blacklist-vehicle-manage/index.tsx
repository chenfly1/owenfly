import {
  ExclamationCircleFilled,
  PlusOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
// import type { MenuProps } from 'antd';
import { Button, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
// import Add from './add';
import styles from './style.less';
import { Access, useAccess, history } from 'umi';
import Add from './add';
import { blackCarQueryByPage, removeBlackCar } from '@/services/park';
import { exportExcel } from '../../utils/constant';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [modalData, setModalData] = useState<BlackListType>();
  const access = useAccess();

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await blackCarQueryByPage(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems || 0,
    };
  };

  // 删除行数据
  const deleteRow = async (row: BlackListType) => {
    try {
      const res = await removeBlackCar({ id: row.id });
      if (res.code === 'SUCCESS') {
        message.success('删除成功！');
        actionRef.current?.reload();
        return true;
      }
      return false;
    } catch (err) {
      message.error('请求失败，请重试！');
      return false;
    }
  };

  const columns: ProColumns<BlackListType>[] = [
    {
      title: '车场名称',
      dataIndex: 'parkName',
      order: 2,
      ellipsis: true,
    },
    {
      title: '车牌号码',
      dataIndex: 'plate',
      order: 1,
      ellipsis: true,
    },
    {
      title: '车主姓名',
      dataIndex: 'ownerName',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '拉黑原因',
      dataIndex: 'remark',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        const del = (
          <Access key="3" accessible={access.functionAccess('alitaParking_deleteBlackListVehicle')}>
            <a
              className={styles.errorText}
              onClick={() => {
                Modal.confirm({
                  centered: true,
                  icon: <ExclamationCircleFilled />,
                  title: '确定删除黑名单吗？',
                  content: '删除后该车辆可以正常通行',
                  onOk: async () => {
                    return deleteRow(row);
                  },
                });
              }}
            >
              删除
            </a>
          </Access>
        );
        return <Space>{del}</Space>;
      },
    },
  ];
  const exportClick = () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/black_list', '黑名单管理', params, 'GET');
  };
  const onSubmit = () => {
    setDrawerVisit(false);
    actionRef.current?.reload();
  };
  return (
    <PageContainer
      header={{
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<BlackListType>
        columns={columns}
        actionRef={actionRef}
        form={{
          colon: false,
        }}
        formRef={formRef}
        cardBordered
        request={queryList}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="relId"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        headerTitle={
          <Space>
            <Access
              key="2"
              accessible={access.functionAccess('alitaParking_queryBlackListVehicle')}
            >
              <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Access
            key="button"
            accessible={access.functionAccess('alitaParking_createBlackListVehicle')}
          >
            <Button
              onClick={() => {
                setDrawerVisit(true);
                setModalData({});
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新增黑名单车辆
            </Button>
          </Access>,
        ]}
      />

      <Add
        open={drawerVisit}
        onOpenChange={setDrawerVisit}
        onSubmit={onSubmit}
        data={modalData}
        readonly={false}
      />
    </PageContainer>
  );
};
