import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Add from './add';
import styles from './style.less';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { deleteAnnouncement, getAnnouncementByPage } from '@/services/door';
import { Access, useAccess } from 'umi';
import ActionGroup from '@/components/ActionGroup';
import Method from '@/utils/Method';

const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [viewData, setViewData] = useState<any>();
  const access = useAccess();
  const reload = () => {
    actionRef.current?.reload();
  };
  const deleteRow = (id: number) => {
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      title: '删除后无法找回，确定是否删除',
      centered: true,
      onOk: async () => {
        const res = await deleteAnnouncement(id);
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
  const columns: ProColumns<AnnouncementType>[] = [
    {
      title: '公告ID',
      dataIndex: 'id',
      ellipsis: true,
      search: false,
    },
    {
      title: '公告名称',
      dataIndex: 'name',
      ellipsis: true,
      search: false,
    },
    // {
    //   title: '有效时间',
    //   dataIndex: 'validityTime',
    //   width: 340,
    //   ellipsis: true,
    //   search: false,
    //   // render: (_, record) => [
    //   //   <span key="pushTime">
    //   //     {record.authStart && record.authEnd ? `${record.authStart}-${record.authEnd}` : '-'}
    //   //   </span>,
    //   // ],
    // },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      search: false,
      valueType: 'select',
      valueEnum: {
        0: {
          text: '未推送',
          status: 'error',
        },
        1: {
          text: '未推送',
          status: 'error',
        },
        2: {
          text: '已推送',
          status: 'success',
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
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            startTime: value[0] + ' 00:00:00',
            endTime: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
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
                key: 'view',
                text: '查看',
                accessKey: 'alitaDoor_queryAnnouncement',
                onClick() {
                  setViewData(record);
                  setModalVisit(true);
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'alitaDoor_deleteAnnouncement',
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

  const toolBarRender = () => {
    return [
      <Access key="add" accessible={access.functionAccess('alitaDoor_editAnnouncement1')}>
        <Button
          onClick={() => {
            setViewData({});
            setModalVisit(true);
          }}
          icon={<PlusOutlined />}
          type="primary"
        >
          新建
        </Button>
      </Access>,
    ];
  };

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getAnnouncementByPage({
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
      <ProTable<AnnouncementType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={toolBarRender}
      />
      <Add modalVisit={modalVisit} data={viewData} onSubmit={reload} onOpenChange={setModalVisit} />
    </PageContainer>
  );
};
