import { createRef, useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import moment from 'moment';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable, ProColumns, ParamsType, ActionType } from '@ant-design/pro-components';
import { getNoticeList, getNoticeTypes, batchReadNotice, readNotice } from '@/services/notice';
import { NoticeStatus, NoticeStatusMap } from '@/components/NoticeBox/config';
import NoticeDetail, { DetailRef } from '@/components/NoticeBox/NoticeDetail';
import { NoticeBoxType } from '@/components/NoticeBox/config';
import ActionGroup from '@/components/ActionGroup';

const DEFAULT_OPTION = {
  text: '全部',
  key: '__default__',
};

const DEFAULT_OPTION_ITEM = { label: DEFAULT_OPTION.text, value: DEFAULT_OPTION.key };

export default () => {
  const [source, setSource] = useState([] as NoticeItemType[]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<{ batchRead: boolean }>({ batchRead: false });
  const [noticeTypeMap, setNoticeTypeMap] = useState<Record<string, string>>({
    [DEFAULT_OPTION.key]: DEFAULT_OPTION.text,
  });
  const actionRef = useRef<ActionType>();
  const detailRef = createRef<DetailRef>();
  const { updateSource } = useModel('useNotice');
  // 获取项目列表
  const { initialState } = useModel('@@initialState');
  const projects = (initialState?.projectList || []).reduce((prev, curr) => {
    prev[curr.bid] = curr.name;
    return prev;
  }, {});

  /** 设置消息已读 */
  const updateStatus = async (id: string | string[]) => {
    if (typeof id === 'string') {
      await readNotice(id).then((res) => {
        if (res?.code === 'SUCCESS') {
          setSource((prev) => {
            const match = prev.find((item) => item.id === id);
            if (match) match.status = NoticeStatus.Read;
            return prev;
          });
        }
      });
    } else {
      await batchReadNotice(id).then((res) => {
        if (res?.code === 'SUCCESS') {
          actionRef.current?.reload();
          actionRef.current?.clearSelected?.();
        }
      });
    }
    updateSource(NoticeBoxType.notice);
  };

  /** 获取消息列表 */
  const getList = async ({ current, ...params }: ParamsType) => {
    const options = Object.keys(params).reduce(
      (prev, curr) => {
        return params[curr] === DEFAULT_OPTION.key ? prev : { ...prev, [curr]: params[curr] };
      },
      { pageNo: current },
    );
    const res = await getNoticeList(options);
    setSource(res?.data?.items || []);
    return {
      data: res?.data?.items || [],
      success: res?.code === 'SUCCESS' ? true : false,
      total: res?.data?.page?.totalItems,
    };
  };

  /** 标记已读操作 */
  const batchRead = async () => {
    setLoading((prev) => ({ ...prev, batchRead: true }));
    await updateStatus(selectedRowKeys as string[]);
    setLoading((prev) => ({ ...prev, batchRead: false }));
  };

  const columns: ProColumns<NoticeItemType>[] = [
    {
      title: '标题',
      key: 'title',
      dataIndex: 'title',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '消息类型',
      key: 'type',
      dataIndex: 'type',
      ellipsis: true,
      order: 3,
      initialValue: DEFAULT_OPTION.key,
      fieldProps: {
        allowClear: false,
        showSearch: true,
      },
      render: (_, row: NoticeItemType) => noticeTypeMap[row.type] || '',
      valueEnum: noticeTypeMap,
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      order: 1,
      initialValue: DEFAULT_OPTION.key,
      fieldProps: {
        allowClear: false,
      },
      render(_, row: NoticeItemType) {
        return NoticeStatusMap[row.status] || '';
      },
      request: () =>
        Promise.resolve([
          DEFAULT_OPTION_ITEM,
          { label: '未读', value: NoticeStatus.Unread },
          { label: '已读', value: NoticeStatus.Read },
        ]),
    },
    {
      title: '所属项目',
      key: 'projectBid',
      dataIndex: 'projectBid',
      ellipsis: true,
      initialValue: DEFAULT_OPTION.key,
      order: 4,
      valueEnum: {
        [DEFAULT_OPTION.key]: DEFAULT_OPTION.text,
        ...projects,
      },
      fieldProps: {
        allowClear: false,
      },
      render: (_, item) => <>{projects[item.projectBid] || ''}</>,
    },
    {
      title: '上报时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      hideInSearch: true,
      fieldProps: {
        allowClear: true,
      },
    },
    {
      title: '上报时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
      search: {
        transform: (value) => {
          return {
            createTimeStart: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            createTimeEnd: moment(value[1])
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
      width: 100,
      render: (_, item) => {
        return (
          <a
            key="check"
            onClick={() => {
              detailRef.current?.checkNotice(item);
              if (item.status === NoticeStatus.Unread) {
                updateStatus(item.id);
              }
            }}
          >
            查看详情
          </a>
        );
      },
    },
  ];

  useEffect(() => {
    getNoticeTypes().then((res) => {
      if (res?.code === 'SUCCESS') {
        const types = (res?.data || []).reduce(
          (prev, curr) => ({
            ...prev,
            [curr.code]: curr.name,
          }),
          {
            [DEFAULT_OPTION.key]: DEFAULT_OPTION.text,
          },
        );
        setNoticeTypeMap(types);
      }
    });
  }, []);

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<NoticeItemType>
        columns={columns}
        form={{ colon: false }}
        actionRef={actionRef}
        dataSource={source}
        tableAlertRender={false}
        rowSelection={{
          type: 'checkbox',
          alwaysShowAlert: false,
          selectedRowKeys,
          getCheckboxProps: (record) => {
            if (record.status === NoticeStatus.Read) return { disabled: true };
            return {};
          },
          onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        cardBordered
        request={getList}
        pagination={{
          showSizeChanger: true,
        }}
        rowKey="id"
        search={{ labelWidth: 78 }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            selection={{ count: selectedRowKeys.length }}
            actions={[
              {
                key: 'reads',
                text: '标记已读',
                onClick: batchRead,
                loading: loading.batchRead,
              },
            ]}
          />
        }
      />
      <NoticeDetail ref={detailRef} />
    </PageContainer>
  );
};
