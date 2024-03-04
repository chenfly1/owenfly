import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';

import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Access, useParams, history, useAccess } from 'umi';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';

const { confirm } = Modal;
import Connect from './connect';
import DetailsModelForm from './details';
import {
  getTopicDetails,
  onlineArticle,
  queryArticlePage,
  relateArticle,
} from '@/services/content';
import { getProjectAllList } from '@/services/mda';
import ActionGroup from '@/components/ActionGroup';
import styles from './style.less';

export default () => {
  const actionRef = useRef<ActionType>();
  const params: { id: string } = useParams();
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const [detailsModalVisit, setDetailsModalVisit] = useState<boolean>(false);
  const [topicStatus, setTopicStatus] = useState<boolean>(false);
  const [title, settitle] = useState<string>();
  const [topicProject, setTopicProject] = useState<string>();
  const [topicProjectBids, setTopicProjectBids] = useState<string[]>();
  const [editData, setEditData] = useState<any>();
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };
  console.log(params.id);
  useEffect(() => {
    const getTopicDetail = async () => {
      getTopicDetails(params.id as any).then(async (res) => {
        if (res.code === 'SUCCESS') {
          setTopicStatus(res.data.status ? true : false);
          setTopicProject(res.data.projectNames);
          settitle(res.data.title);
          setTopicProjectBids(res.data.projectBids);
        }
      });
    };
    getTopicDetail();
  }, [params.id]);

  const correlation = (row: ArticleContentPageType) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确认是否需要解除关联',
      // content: (
      // ),
      centered: true,
      onOk: async () => {
        const res = await relateArticle({
          id: row.id,
          topicId: params.id,
          relate: 0,
        });
        if (res.code === 'SUCCESS') {
          actionRef?.current?.reload();
          message.success('操作成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const activeHandle = async (row: ArticleContentPageType) => {
    const res = await onlineArticle({ id: row.id, status: row.status ? 0 : 1 });
    if (res.code === 'SUCCESS') {
      actionRef.current?.reload();
      message.success('操作成功');
    }
  };

  const columns: ProColumns<ArticleContentPageType>[] = [
    {
      title: '内容编号',
      dataIndex: 'code',
      width: 130,
      order: 4,

      ellipsis: true,
    },
    {
      title: '内容类型',
      dataIndex: 'type',
      width: 130,

      ellipsis: true,
      search: false,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '社区文章',
        },
        2: {
          text: '工作文章',
        },
      },
    },
    {
      title: '内容/标题',
      dataIndex: 'title',
      width: 260,

      search: false,
      ellipsis: true,
    },
    {
      title: '作者名称',
      dataIndex: 'authorName',
      order: 2,
      hideInTable: true,
    },
    {
      title: '内容关键词',
      dataIndex: 'title',
      order: 2,
      hideInTable: true,
    },
    {
      title: '创建人账号',
      dataIndex: 'creatorAccount',
      width: 160,

      order: 3,
      ellipsis: true,
    },
    {
      title: '创建人姓名',
      dataIndex: 'creator',
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '发布时间',
      dataIndex: 'postTime',
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
      width: 160,

      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,

      ellipsis: true,
      search: false,
      valueType: 'select',
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
      fixed: 'right',
      key: 'option',
      width: 200,
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '查看详情',
                accessKey: 'alitaContent_queryArticle',
                onClick() {
                  setEditData(record);
                  setDetailsModalVisit(true);
                },
              },
              {
                key: 'down',
                text: '下线',
                accessKey: 'alitaContent_onlineArticle',
                hidden: !record.status,
                danger: true,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'up',
                text: '上线',
                accessKey: 'alitaContent_onlineArticle',
                hidden: !!record.status,
                onClick() {
                  activeHandle(record);
                },
              },
              {
                key: 'relate',
                text: '解除关联',
                accessKey: 'alitaContent_relateTopicContent_B',
                danger: true,
                onClick() {
                  correlation(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const getByPage = async (param: Record<string, any>) => {
    const msg = await queryArticlePage({
      ...param,
      type: 1,
      pageNo: param.current,
      topicId: params.id,
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
        title: `话题：${title}`,
        // title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProTable<ArticleContentPageType>
        columns={columns}
        className={styles.cardStyle}
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
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          topicStatus ? (
            <Access key="add" accessible={access.functionAccess('alitaContent_relateTopicContent')}>
              <Button
                key="button"
                onClick={() => {
                  setAddModalVisit(true);
                }}
                icon={<PlusOutlined />}
                type="primary"
              >
                关联内容
              </Button>
            </Access>
          ) : null,
        ]}
      />
      <Connect
        modalVisit={addModalVisit}
        onSubmit={reload}
        topicId={params.id}
        topicProjectBids={topicProjectBids}
        topicProject={topicProject || ''}
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
