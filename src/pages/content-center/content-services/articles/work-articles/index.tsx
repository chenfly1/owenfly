import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';

import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import { CheckCircleFilled, PlusOutlined } from '@ant-design/icons';
import AddModelForm from './add';

import DetailsModelForm from './details';
import styles from './style.less';
import { onlineArticle, queryArticlePage } from '@/services/content';
import { getProjectAllList } from '@/services/mda';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [detailsModalVisit, setDetailsModalVisit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };

  const activeHandle = async (row: ArticleContentPageType) => {
    const res = await onlineArticle({ id: row.id, status: row.status ? 0 : 1 });
    if (res.code === 'SUCCESS') {
      actionRef.current?.reload();
      if (!row.status) {
        Modal.confirm({
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          title: `文章已上线！`,
          content: '是否立即去配置营销计划？配置营销计划才可以在小程序展示给用户',
          centered: true,
          okText: '立即配置',
          cancelText: '取消',
          onOk: async () => {
            history.push('/content-center/marketing-management/staff-marketing');
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        return;
      }
      message.success('操作成功');
    }
  };

  const columns: ProColumns<ArticleContentPageType>[] = [
    {
      title: '文章编号',
      dataIndex: 'code',
      width: 150,
      order: 4,
      ellipsis: true,
    },
    {
      title: '文章标题',
      dataIndex: 'title',
      width: 240,
      order: 1,
      ellipsis: true,
    },
    {
      title: '创建人账号',
      dataIndex: 'creatorAccount',
      width: 140,
      order: 3,
      ellipsis: true,
    },
    {
      title: '创建人姓名',
      dataIndex: 'creator',
      width: 160,
      order: 2,
      ellipsis: true,
    },
    {
      title: '作者编号',
      dataIndex: 'authorCode',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '作者名称',
      dataIndex: 'authorName',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      width: 160,
      search: false,
      ellipsis: true,
    },
    {
      title: '最近修改时间',
      dataIndex: 'modifyTime',
      width: 160,
      search: false,
      ellipsis: true,
    },
    {
      title: '关联项目',
      dataIndex: 'projectBid',
      filters: false,
      ellipsis: true,
      order: 0,
      valueType: 'select',
      hideInTable: true,
      request: async () => {
        const res = await getProjectAllList();
        console.log(res);
        return (res.data.items as any).map((i: any) => ({
          value: i.bid,
          label: i.name,
        }));
      },
    },
    {
      title: '关联项目',
      dataIndex: 'projectNames',
      width: 200,
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      width: 120,
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '下线',
          status: 'Error',
        },
      },
    },
    {
      title: '阅读量',
      dataIndex: 'readCount',
      width: 120,
      search: false,
      ellipsis: true,
    },
    {
      title: '点赞量',
      dataIndex: 'likeCount',
      width: 120,
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      width: 200,
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'cat',
                text: '查看内容',
                accessKey: 'alitaContent_queryArticle',
                onClick() {
                  setEditData(record);
                  setDetailsModalVisit(true);
                },
              },
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'alitaContent_editArticle',
                onClick() {
                  setEditData(record);
                  setAddModalVisit(true);
                },
              },
              {
                key: 'down',
                text: '下线',
                accessKey: 'alitaContent_onlineArticle',
                hidden: !record.hasText || !record.status,
                danger: true,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'up',
                text: '上线',
                accessKey: 'alitaContent_onlineArticle',
                hidden: !record.hasText || !!record.status,
                onClick() {
                  activeHandle(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    const msg = await queryArticlePage({
      ...params,
      type: 2,
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
    <PageContainer header={{ title: null }}>
      <ProTable<ArticleContentPageType>
        columns={columns}
        className={styles.tableStyle}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={
          {
            labelWidth: 85,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaContent_addArticle')}>
            <Button
              key="button"
              onClick={() => {
                setEditData({});
                setAddModalVisit(true);
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建工作文章
            </Button>
          </Access>,
        ]}
      />
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />
      <DetailsModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={detailsModalVisit}
        onOpenChange={setDetailsModalVisit}
      />
    </PageContainer>
  );
};
