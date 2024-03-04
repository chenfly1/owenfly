import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { deleteDeviceType, getDeviceTypePage } from '@/services/device';
import AddModelForm from './add';
import { Access, useAccess } from 'umi';
import styles from './style.less';
import ActionGroup from '@/components/ActionGroup';
import classNames from 'classnames';

const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();
  const access = useAccess();
  const reload = () => {
    actionRef.current?.reload();
  };
  const deleteDevices = (id: string) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '删除设备类型后，设备将无法通过类型批量授权给应用',
      centered: true,
      onOk: async () => {
        const res = await deleteDeviceType(id);
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
  const columns: ProColumns<devicesType>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '设备类型名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) =>
        record.inlay
          ? [
              <div key="12">
                <Tooltip placement="topLeft" title={record.name}>
                  <div className={classNames('text-ellipsis', styles.nameSty)}>{record.name}</div>
                </Tooltip>
                <Tag color="default">平台内置</Tag>
              </div>,
            ]
          : [
              <div key="13">
                <Tooltip placement="topLeft" title={record.name}>
                  <div className={classNames('text-ellipsis', styles.nameSty)}>{record.name}</div>
                </Tooltip>
                <Tag color="processing">自定义</Tag>
              </div>,
            ],
    },
    {
      title: '备注名',
      dataIndex: 'alias',
      ellipsis: true,
      search: false,
    },
    {
      title: '授权应用',
      dataIndex: 'systemName',
      ellipsis: true,
      search: false,
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
                accessKey: 'masdata_updateDeviceType',
                onClick() {
                  setEditData(record);
                  setAddModalVisit(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'masdata_deleteDeviceType',
                hidden: record.inlay,
                onClick() {
                  deleteDevices(record.id as any);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const toolBarRender = () => {
    return [
      <Access key="button" accessible={access.functionAccess('masdata_createDeviceType')}>
        <Button
          onClick={() => {
            setEditData({});
            setAddModalVisit(true);
          }}
          icon={<PlusOutlined />}
          type="primary"
        >
          自定义类型
        </Button>
      </Access>,
    ];
  };

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getDeviceTypePage({
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
      <ProTable<devicesType>
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
        toolBarRender={toolBarRender}
      />
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />
    </PageContainer>
  );
};
