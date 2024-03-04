import { PageContainer } from '@ant-design/pro-layout';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { getNoticeLog, noticeTest } from '@/services/notice';
import dayjs from 'dayjs';
import DataMasking from '@/components/DataMasking';
import { Button, Modal, Space, message } from 'antd';
import { ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { useRef } from 'react';

export default () => {
  const actionRef = useRef<ActionType>();
  /** 获取消息列表 */
  const getList = async (params: any) => {
    params.pageNo = params.current;
    const res = await getNoticeLog(params);
    return {
      data: res?.data?.items || [],
      success: res?.code === 'SUCCESS' ? true : false,
      total: res?.data?.page?.totalItems,
    };
  };
  const sendStatusEnum = {
    0: '未发送',
    1: '发送成功',
    2: '发送失败',
  };
  const columns: ProColumns<NoticeLogType>[] = [
    {
      title: '消息ID',
      dataIndex: 'msgBid',
      order: 6,
      hideInTable: true,
    },
    {
      title: '模板名称',
      dataIndex: 'templateName',
      order: 5,
      hideInTable: true,
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      order: 4,
      valueEnum: {
        0: '未发送',
        1: '发送成功',
        2: '发送失败',
      },
      hideInTable: true,
    },
    {
      title: '渠道类型',
      dataIndex: 'channelType',
      order: 3,
      valueEnum: {
        WECHAT_OFFICIAL_ACCOUNT: '微信服务号',
        MINI_MAIL: '小程序站内',
        WEB_MAIL: 'web站内信',
        SMS: '短信',
      },
      hideInTable: true,
    },
    {
      title: '发送时间',
      dataIndex: 'sendTime',
      valueType: 'dateRange',
      order: 2,
      hideInTable: true,
      search: {
        transform: (item) => {
          return {
            sendStartTime: dayjs(item[0]).valueOf(),
            sendEndTime: dayjs(item[1]).valueOf(),
          };
        },
      },
    },
    {
      title: '读取状态',
      dataIndex: 'readStatus',
      order: 1,
      valueType: 'select',
      valueEnum: {
        0: '未读取',
        1: '已读取',
      },
      hideInTable: true,
    },

    {
      title: '消息ID',
      dataIndex: 'bid',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '模板名称',
      dataIndex: 'templateName',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '渠道类型',
      dataIndex: 'channelType',
      valueType: 'select',
      valueEnum: {
        WECHAT_OFFICIAL_ACCOUNT: '微信服务号',
        MINI_MAIL: '小程序站内',
        WEB_MAIL: 'web站内信',
        SMS: '短信',
      },
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '接收用户ID',
      dataIndex: 'receiveUserBid',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '手机号',
      dataIndex: 'receivePhone',
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.receivePhone} />],
    },
    {
      title: '消息来源',
      dataIndex: 'msgSource',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      ellipsis: true,
      valueType: 'select',
      valueEnum: sendStatusEnum,
      hideInSearch: true,
      render: (_, row: any) => {
        const sendStatus = row.sendStatus;
        const resendType = row.resendType;
        const text = (Object.entries(sendStatusEnum).find((item) => {
          return item[0] == sendStatus;
        }) || [])[1];
        const reSendBtn = (
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '是否重新发送?',
                icon: <ExclamationCircleFilled />,
                centered: true,
                onOk: async () => {
                  const res = await noticeTest({
                    templateBid: row.templateBid,
                    receiver: row.receivePhone,
                    jsonParams: row.templateParamjson,
                    channelBid: row.channelBid,
                  });
                  if (res.code === 'SUCCESS') {
                    message.success('发送成功');
                    actionRef?.current?.reload();
                    return true;
                  }
                  return false;
                },
              });
            }}
          />
        );
        if (sendStatus == 2 && resendType === 'manual') {
          return (
            <Space>
              <div style={{ width: '60px' }}>{text}</div>
              {reSendBtn}
            </Space>
          );
        } else {
          return <div style={{ width: '60px' }}>{text}</div>;
        }
      },
    },
    {
      title: '发送时间',
      dataIndex: 'sendTime',
      valueType: 'dateTime',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '读取状态',
      dataIndex: 'readStatus',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        0: '未读取',
        1: '已读取',
      },
      hideInSearch: true,
    },
    {
      title: '读取时间',
      dataIndex: 'readTime',
      valueType: 'dateTime',
      ellipsis: true,
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer header={{ title: null }}>
      <ProTable<NoticeLogType>
        columns={columns}
        form={{ colon: false }}
        tableAlertRender={false}
        cardBordered
        request={getList}
        pagination={{
          showSizeChanger: true,
        }}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 78 }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
