import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { queryDeviceAlarmLogPage } from '@/services/device';
import { Access, useAccess, history } from 'umi';
import styles from './style.less';
import ActionGroup from '@/components/ActionGroup';
import ProjectSelect from '@/components/ProjectSelect';
import storageSy from '@/utils/Setting/storageSy';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectBid, setProjectBid] = useState<string>(project ? project.bid : '');
  const access = useAccess();
  const reload = () => {
    actionRef.current?.reload();
  };

  const handleChange = (bid: string) => {
    setProjectBid(bid);
    actionRef.current?.reload();
  };
  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInTable: true,
      renderFormItem: () => {
        return <ProjectSelect allowClear={false} name="projectId" handleChange={handleChange} />;
      },
    },
    {
      title: '告警日志编号',
      dataIndex: 'id',
      fieldProps: {
        maxLength: 19,
      },
      ellipsis: true,
    },
    {
      title: '告警编号',
      dataIndex: 'alarmId',
      ellipsis: true,
      search: false,
    },
    {
      title: '告警名称',
      dataIndex: 'name',
      ellipsis: true,
      search: false,
    },
    {
      title: '触发时间',
      dataIndex: 'time',
      ellipsis: true,
      search: false,
    },
    {
      title: '触发时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            timeStart: value[0] + ' 00:00:00',
            timeEnd: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '执行结果',
      dataIndex: 'execResult',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '全部成功',
          status: 'Success',
        },
        2: {
          text: '部分成功',
          status: 'Success',
        },
        0: {
          text: '全部失败',
          status: 'Error',
        },
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
                text: '详情',
                onClick() {
                  history.push(`/device-center/device-warning/edit/${record.id}?pageType=logView`);
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
    const msg = await queryDeviceAlarmLogPage({
      ...params,
      projectId: projectBid,
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
    <PageContainer
      header={{
        title: '设备告警日志',
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<Record<string, any>>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={getByPage}
        className={styles.cardStyle}
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
