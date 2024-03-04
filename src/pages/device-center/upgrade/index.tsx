import { Button, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef } from 'react';
import { history } from 'umi';
import { useInitState } from '@/hooks/useInitState';
import { DeviceState } from '@/models/useDevice';
import moment from 'moment';
import { getProductUpgradeTask, removeProductTask, upgradeProductTask } from '@/services/device';
import { StateEnum, StateMap, UpgradeResEnum } from './config';

export default () => {
  const tableRef = useRef<ActionType>();
  const { productMap } = useInitState<DeviceState>('useDevice', ['productMap']);
  const columns: ProColumns<ProductUpgradeTaskItemType>[] = [
    {
      order: 0,
      title: '所属产品',
      key: 'productName',
      dataIndex: 'productName',
      valueType: 'select',
      valueEnum: productMap.value,
      formItemProps: { name: 'productId' },
      fieldProps: { loading: productMap.loading },
    },
    {
      title: '升级版本目标',
      key: 'targetVersion',
      dataIndex: 'targetVersion',
      order: -1,
    },
    {
      title: '升级时间',
      key: 'upgradeTime',
      dataIndex: 'upgradeTime',
      order: -2,
      valueType: 'dateRange',
      render: (_, row) => {
        return row.upgradeTime ?? '';
      },
      search: {
        transform: (value) => {
          return {
            upgradeTimeStart: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            upgradeTimeEnd: moment(value[1])
              .add(1, 'day')
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },
    },
    {
      title: '任务状态',
      key: 'state',
      dataIndex: 'state',
      valueEnum: StateMap,
      order: -3,
    },
    {
      title: '任务成功率',
      key: 'successRate',
      dataIndex: 'successRate',
      hideInSearch: true,
    },
    {
      title: '任务创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      formItemProps: {
        label: '创建时间',
      },
      order: -4,
      valueType: 'dateRange',
      render: (_, row) => {
        return row.gmtCreated ?? '';
      },
      search: {
        transform: (value) => {
          return {
            gmtCreatedStart: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            gmtCreatedEnd: moment(value[1])
              .add(1, 'day')
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'detail',
                text: '详情',
                onClick() {
                  history.push({
                    pathname: `/super-admin/device-center/device-upgrade/detail/${row.id}`,
                  });
                },
              },
              {
                key: 're-upgrade',
                text: '重新升级',
                hidden: row.state !== StateEnum.done || row.upgradeResult !== UpgradeResEnum.fail,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定重新升级此项任务吗？`,
                    centered: true,
                    onOk: async () => {
                      try {
                        await upgradeProductTask(row.id);
                        tableRef.current?.reloadAndRest?.();
                        return true;
                      } catch (err) {
                        return false;
                      }
                    },
                  });
                },
              },
              {
                key: 'remove',
                text: '删除',
                danger: true,
                hidden: row.state !== StateEnum.apply,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除此项任务吗？`,
                    centered: true,
                    onOk: async () => {
                      try {
                        await removeProductTask(row.id);
                        tableRef.current?.reloadAndRest?.();
                        return true;
                      } catch (err) {
                        return false;
                      }
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  /** 获取任务列表 */
  const getList = async ({ current, ...params }: ParamsType) => {
    const options = { ...params, pageNo: current };
    const res = await getProductUpgradeTask(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<ProductUpgradeTaskItemType>
        actionRef={tableRef}
        columns={columns}
        form={{ colon: false, labelWidth: 90 }}
        tableAlertRender={false}
        pagination={{ showSizeChanger: true }}
        request={getList}
        headerTitle={''}
        cardBordered
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              history.push({
                pathname: '/super-admin/device-center/device-upgrade/create',
              });
            }}
          >
            创建任务
          </Button>,
        ]}
      />
    </PageContainer>
  );
};
