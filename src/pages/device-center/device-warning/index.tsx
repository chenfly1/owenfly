import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, message, Tooltip, Switch } from 'antd';
import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { deviceAlarmOnline, queryDeviceAlarmPage } from '@/services/device';
import { history } from 'umi';
import styles from './style.less';
import ActionGroup from '@/components/ActionGroup';

const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const onStateChange = (checked: boolean, row: Record<string, any>) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: `${checked ? '确定启用“设备离线告警”？' : '确定停用“设备离线告警”？'}`,
      centered: true,
      onOk: async () => {
        const res = await deviceAlarmOnline({ id: row.id, status: row.status === 0 ? 1 : 0 });
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '告警名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => [
        <Tooltip key="detail" placement="topLeft" title={record.name}>
          <a
            type="link"
            onClick={() => {
              history.push(`/device-center/device-warning/edit/${record.id}?pageType=view`);
            }}
          >
            {`${record.name}`}
          </a>
        </Tooltip>,
      ],
    },
    {
      title: '告警编号',
      dataIndex: 'id',
      fieldProps: {
        maxLength: 19,
      },
      ellipsis: true,
    },
    {
      title: '最近执行',
      dataIndex: 'lastRun',
      ellipsis: true,
      search: false,
    },
    {
      title: '启用状态',
      dataIndex: 'status',
      hideInSearch: true,
      ellipsis: true,
      render: (_, row) => {
        return (
          <Switch
            checked={row.status === 1}
            onChange={(checked) => {
              onStateChange(checked, row);
            }}
          />
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaMasdata_deviceAlarm.edit',
                onClick() {
                  history.push(`/device-center/device-warning/edit/${record.id}?pageType=edit`);
                },
              },
              {
                key: 'record',
                text: '日志',
                // accessKey: 'alitaMasdata_deviceAlarmLog.query',
                onClick() {
                  history.push(`/device-center/device-warning/device-warning-log`);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await queryDeviceAlarmPage({
      ...params,
      pageNo: params.current,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <ProTable<Record<string, any>>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={getByPage}
        rowKey="id"
        cardBordered
        search={
          {
            labelWidth: 90,
            labelAlign: 'left',
          } as any
        }
        form={{
          colon: false,
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};
