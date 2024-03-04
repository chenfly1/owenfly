import ActionGroup from '@/components/ActionGroup';
import { getApplyFlow, getDoneFlow, getTodoFlow } from '@/services/flow';
import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Tabs, TabsProps } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef } from 'react';
import { history } from 'umi';

export default () => {
  const tableRef = useRef<ActionType>();
  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      key: 'index',
      dataIndex: 'index',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '状态',
      key: 'processStatusName',
      dataIndex: 'processStatusName',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '标题',
      key: 'formName',
      dataIndex: 'formName',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '提交人',
      key: 'starterUserName',
      dataIndex: 'starterUserName',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '提交时间',
      key: 'startTime',
      dataIndex: 'startTime',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
  ];

  /** 获取仪表列表 */
  const getList =
    (req: (params: any) => Promise<any>) =>
    async ({ current, ...rest }: ParamsType) => {
      const res = await req({
        ...rest,
        pageNo: current,
      });
      return {
        data: (res?.items || []).map((item: FlowInstanceItemType, index: number) => ({
          ...item,
          index: index + 1,
        })),
        success: res?.items ? true : false,
        total: res?.page?.totalItems,
      };
    };

  const items: TabsProps['items'] = [
    {
      key: 'create',
      label: '我的发起',
      children: (
        <ProTable<any>
          cardBordered
          actionRef={tableRef}
          search={false}
          toolBarRender={false}
          columns={columns.concat({
            title: '操作',
            dataIndex: 'option',
            key: 'option',
            fixed: 'right',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
            render: (_, row) => {
              return (
                <ActionGroup
                  limit={2}
                  actions={[
                    {
                      key: 'handle',
                      text: '查看',
                      onClick() {
                        history.push({
                          pathname: '/flow-center/demo/content',
                          query: {
                            id: row.processInstanceId,
                            modelKey: row.processDefinitionKey,
                            type: 'check',
                          },
                        });
                      },
                    },
                  ]}
                />
              );
            },
          })}
          rowKey={'id'}
          tableAlertRender={false}
          request={getList(getApplyFlow)}
          scroll={{ x: true }}
          pagination={{ showSizeChanger: true }}
          // toolBarRender={() => [
          //   <Button
          //     key="export"
          //     type="primary"
          //     onClick={() => {
          //       history.push({
          //         pathname: '/flow-center/demo/content',
          //         query: {
          //           modelKey: 'qingjiaceshi100_1690271331185',
          //           type: 'create',
          //         },
          //       });
          //     }}
          //   >
          //     发起流程
          //   </Button>,
          // ]}
        />
      ),
    },
    {
      key: 'todo',
      label: `我的待办`,
      children: (
        <ProTable<any>
          cardBordered
          actionRef={tableRef}
          search={false}
          toolBarRender={false}
          columns={columns.concat({
            title: '操作',
            dataIndex: 'option',
            key: 'option',
            fixed: 'right',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
            render: (_, row) => {
              return (
                <ActionGroup
                  limit={2}
                  actions={[
                    {
                      key: 'handle',
                      text: '处理',
                      onClick() {
                        history.push({
                          pathname: '/flow-center/demo/content',
                          query: {
                            id: row.processInstanceId,
                            modelKey: row.processDefinitionKey,
                            taskId: row.taskId,
                            nodeName: row.taskDefKey,
                            type: 'handle',
                          },
                        });
                      },
                    },
                  ]}
                />
              );
            },
          })}
          rowKey={'id'}
          tableAlertRender={false}
          request={getList(getTodoFlow)}
          scroll={{ x: true }}
          pagination={{ showSizeChanger: true }}
        />
      ),
    },
    {
      key: 'done',
      label: `我的已办`,
      children: (
        <ProTable<any>
          cardBordered
          actionRef={tableRef}
          search={false}
          toolBarRender={false}
          columns={columns.concat({
            title: '操作',
            dataIndex: 'option',
            key: 'option',
            fixed: 'right',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
            render: (_, row) => {
              return (
                <ActionGroup
                  limit={2}
                  actions={[
                    {
                      key: 'handle',
                      text: '查看',
                      onClick() {
                        history.push({
                          pathname: '/flow-center/demo/content',
                          query: {
                            id: row.processInstanceId,
                            modelKey: row.processDefinitionKey,
                            type: 'check',
                          },
                        });
                      },
                    },
                  ]}
                />
              );
            },
          })}
          rowKey={'id'}
          tableAlertRender={false}
          request={getList(getDoneFlow)}
          scroll={{ x: true }}
          pagination={{ showSizeChanger: true }}
        />
      ),
    },
  ];
  return (
    <PageContainer
      style={{
        padding: '0px 20px',
      }}
      header={{
        title: '流程操作实例',
        style: {
          padding: '20px 0px 10px',
        },
      }}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </PageContainer>
  );
};
