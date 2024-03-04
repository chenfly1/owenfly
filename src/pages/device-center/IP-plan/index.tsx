import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Modal, message } from 'antd';
import { useRef, useState } from 'react';
import styles from './style.less';
import { useAccess, history } from 'umi';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import AddModelForm from './add';
import SpaceTree from '@/components/SpaceTree';
import type { TreeProps } from 'antd/es/tree';
import { exportExcel } from '@/pages/park-center/utils/constant';
import { deviceBusiness } from '@/components/FileUpload/business';
import { deleteIpSpace, queryIpSpacePage } from '@/services/device';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const treeRef = useRef();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [spaceId, setSpaceId] = useState<string>();
  const [editData, setEditData] = useState<any>();
  const [editModalVisit, setEditModalVisit] = useState<boolean>(false);

  const reload = () => {
    actionRef.current?.reload();
  };
  const queryList = async (params: any) => {
    if (!spaceId)
      return {
        data: [],
        success: true,
        total: 0,
      };
    params.pageNo = params.current;
    params.spaceId = spaceId;
    const res = await queryIpSpacePage(params);
    return {
      data: res.data.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page.totalItems,
    };
  };

  const treeLoadComplate = (data: any) => {
    setSpaceId(data && data[0].id);
    console.log(data && data[0].id);
    const timer = setTimeout(() => {
      (actionRef.current as any).reset();
      clearTimeout(timer);
    }, 0);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log(selectedKeys);
    console.log(info);
    const key = selectedKeys.length ? (selectedKeys[0] as string) : '';
    if (key) {
      setSpaceId(key);
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: 'IP',
      dataIndex: 'ip',
      ellipsis: true,
    },
    {
      title: '位置描述',
      dataIndex: 'spaceName',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            gmtCreatedStart: value[0] + ' 00:00:00',
            gmtCreatedEnd: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      search: false,
      render: (text, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaMasdata_saveIpSpaceEdit',
                onClick() {
                  setEditData(row);
                  setEditModalVisit(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'alitaMasdata_deleteIpSpace',
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除IP${row.ip}吗`,
                    cancelText: '取消',
                    okText: '确定',
                    centered: true,
                    onOk: async () => {
                      const res = await deleteIpSpace(row.id);
                      if (res.code === 'SUCCESS') {
                        reload();
                        message.success(res.message);
                      } else {
                        message.error(res.message);
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

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 1000000;
    params.spaceId = spaceId;
    params.projectId = project?.bid;
    params.excel = 'export';
    exportExcel('/base/auth/mng/ipSpace/page', 'IP位置规划', params, 'GET');
  };

  const headerTitle = () => {
    return (
      <ActionGroup
        scene="tableHeader"
        limit={3}
        actions={[
          {
            key: 'batchImport',
            text: '批量导入',
            accessKey: 'alitaMasdata_importIpSpace',
            onClick: () => {
              history.push({
                pathname: `/device-center/IP-plan/batch-import`,
                query: {
                  businessId: deviceBusiness.id,
                  businessType: '1',
                  path: deviceBusiness.path,
                  projectBid: project?.bid,
                },
              });
            },
          },
          // {
          //   key: 'export',
          //   text: '导出',
          //   icon: <VerticalAlignBottomOutlined />,
          //   accessKey: 'alitaMasdata_queryIpSpace',
          //   onClick: exportClick,
          // },
        ]}
      />
    );
  };
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px', height: 'calc(100vh - 103px)', overflowY: 'scroll' }}>
            <SpaceTree
              ref={treeRef}
              treeLoadComplate={treeLoadComplate}
              cardProps={{ bodyStyle: { padding: '0' } }}
              onSelectChange={onSelect}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<Record<string, any>>
            className={styles.tableStyle}
            columns={columns}
            actionRef={actionRef}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            headerTitle={headerTitle()}
            request={queryList}
            pagination={{
              showSizeChanger: true,
            }}
            rowKey="id"
            search={{
              labelWidth: 68,
            }}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
            toolBarRender={() => [
              <ActionGroup
                scene="tableToolBar"
                key="tableToolBar"
                limit={3}
                actions={[
                  {
                    key: 'add',
                    text: '新建',
                    accessKey: 'alitaMasdata_saveIpSpace',
                    icon: <PlusOutlined />,
                    type: 'primary',
                    onClick: () => {
                      setEditModalVisit(true);
                      setEditData({});
                    },
                  },
                ]}
              />,
            ]}
          />
        </Pane>
      </SplitPane>
      <AddModelForm
        data={editData}
        onSubmit={reload}
        modalVisit={editModalVisit}
        onOpenChange={setEditModalVisit}
      />
    </PageContainer>
  );
};
