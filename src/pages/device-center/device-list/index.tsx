import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, message, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { deleteDevice, getQueryByDevicePage } from '@/services/device';
import type { TreeProps } from 'antd/es/tree';
import SpaceTree from '@/components/SpaceTree';
import styles from './style.less';
import EditModelForm from './edit';
import { history } from 'umi';
import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import UpdateSort from './edit/updateSort';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import ActionGroup from '@/components/ActionGroup';

const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [spaceId, setSpaceId] = useState<string>();
  const [editModalVisit, setEditModalVisit] = useState<boolean>(false);
  const [sortModalVisit, setSortModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();

  const reload = () => {
    actionRef.current?.reload();
  };
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setSpaceId((info.node as any).spaceType === 'PROJECT' ? null : (info.node as any).id);
    (actionRef.current as any).reset();
    console.log('selected', selectedKeys, info);
  };
  const deleteRow = (id: string) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除设备？',
      centered: true,
      onOk: async () => {
        const res = await deleteDevice(id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('删除成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => [
        <Tooltip key="detail" placement="topLeft" title={record.name}>
          <a
            type="link"
            onClick={() => {
              history.push(`/device-center/details/${record.id}`);
            }}
          >
            {`${record.name}`}
          </a>
        </Tooltip>,
      ],
    },
    {
      title: '设备ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
      // formItemProps: {
      //   rules: [{ required: true, pattern: /^[0-9]+$/, message: '格式不对，只能输入数字' }],
      // }
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      ellipsis: true,
      // search: false,
    },
    // {
    //   title: 'IP',
    //   hideInTable: true,
    //   renderFormItem: () => {
    //     return (
    //       <div className={styles.inputClass}>
    //         <Form.Item name="a">
    //           <Input bordered={false} />
    //         </Form.Item>
    //         .
    //         <Form.Item name="b">
    //           <Input bordered={false} />
    //         </Form.Item>
    //         .
    //         <Form.Item name="c">
    //           <Input bordered={false} />
    //         </Form.Item>
    //         .
    //         <Form.Item name="d">
    //           <Input bordered={false} />
    //         </Form.Item>
    //       </div>
    //     );
    //   },
    // },
    {
      title: '网络状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'Error',
        },
      },
    },
    {
      title: '认证状态',
      dataIndex: 'authenticationStatus',
      ellipsis: true,
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '已认证',
          status: 'Success',
        },
        2: {
          text: '认证异常',
          status: 'Error',
        },
      },
    },
    {
      title: '认证状态',
      dataIndex: 'authenticationStatus',
      ellipsis: true,
      hideInSearch: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '已认证',
          status: 'Success',
        },
        2: {
          text: (
            <>
              <Tooltip title="设备未正常关联空间节点">
                认证异常 <InfoCircleOutlined />
              </Tooltip>
            </>
          ),
          status: 'Error',
        },
        // 3: {
        //   text: (
        //     <>
        //       <Tooltip title="设备在空间节点下的设备号不唯一">
        //         认证异常 <InfoCircleOutlined />
        //       </Tooltip>
        //     </>
        //   ),
        //   status: 'Error',
        // },
      },
    },
    {
      title: '授权应用',
      dataIndex: 'systemName',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      width: 100,
      key: 'option',
      search: false,
      fixed: 'right',
      render: (_, record) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              // {
              //   key: 'details',
              //   text: '详情',
              //   accessKey: 'masdata_queryDeviceDetail',
              //   onClick() {
              //     history.push(`/device-center/details/${record.id}`);
              //   },
              // },
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'masdata_handleException',
                onClick() {
                  setEditData(record);
                  setEditModalVisit(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'masdata_deleteDevice',
                hidden: !!record.status,
                onClick() {
                  deleteRow(record.id);
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
    const msg = await getQueryByDevicePage({
      ...params,
      projectId: project?.bid,
      spaceId: spaceId,
      showSubordinates: true,
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
    <PageContainer header={{ title: null }} className={styles.cardStyle}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px', height: 'calc(100vh - 103px)', overflowY: 'scroll' }}>
            <SpaceTree onSelect={onSelect} />
          </div>
        </Pane>
        <Pane>
          <ProTable<devicesListType>
            columns={columns}
            actionRef={actionRef}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            columnsState={{
              defaultValue: {
                // 配置初始值；如果配置了持久化，仅第一次生效（没有缓存的第一次），后续都按缓存处理。
                id: {
                  show: false, // 该字段（年龄列）不显示在表格列中
                },
                sn: {
                  show: false,
                },
              },
            }}
            request={getByPage}
            rowKey="id"
            search={{
              labelWidth: 100,
              // defaultColsNumber: 6,
            }}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            pagination={{
              showSizeChanger: true,
            }}
          />
        </Pane>
      </SplitPane>
      {/* <AddModelForm modalVisit={addModalVisit} onOpenChange={setAddModalVisit} /> */}
      <EditModelForm
        data={editData}
        onSubmit={reload}
        modalVisit={editModalVisit}
        onOpenChange={setEditModalVisit}
      />
      <UpdateSort
        data={editData}
        onSubmit={reload}
        modalVisit={sortModalVisit}
        onOpenChange={setSortModalVisit}
      />
    </PageContainer>
  );
};
