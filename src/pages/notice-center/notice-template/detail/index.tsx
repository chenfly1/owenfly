import React, { useEffect, useRef, useState } from 'react';
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { history } from 'umi';
import { detailNoticeChannel, getNoticeChannelList, getNoticeTempDetail } from '@/services/notice';
import { message } from 'antd';
import TestModal from './testModal';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>('新建渠道');
  const [testOpen, setTestOpen] = useState<boolean>(false);
  const [testData, setTestData] = useState<Record<string, any>>({});

  const id = data?.bid;

  useEffect(() => {
    formRef?.current?.resetFields();
    setTitle('查看详情');
    if (open && id) {
      getNoticeTempDetail({ id }).then((res) => {
        formRef.current?.setFieldsValue({
          ...res.data,
        });
      });
    }
  }, [open]);

  const getChannelList = async () => {
    const res = await getNoticeChannelList({
      pageNo: 1,
      pageSize: 100,
    });

    return res.data.items.map((item: any) => {
      return {
        label: item.channelName,
        value: item.bid,
      };
    });
  };

  return (
    <>
      <DrawerForm
        // labelCol={{ flex: '80px' }}
        formRef={formRef}
        layout="vertical"
        onOpenChange={onOpenChange}
        width={550}
        labelAlign="left"
        title={title}
        open={open}
        colon={false}
        submitter={false}
        onReset={() => history.goBack()}
      >
        <ProFormText
          label="模板名称"
          name="templateName"
          disabled
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
        />
        <ProFormSelect
          name="channelBid"
          label="渠道名称（账号）"
          disabled
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
          request={getChannelList}
        />
        <ProFormTextArea
          style={{ marginBlockEnd: 0 }}
          name="content"
          label="消息内容"
          rules={[
            {
              required: true,
            },
          ]}
          disabled
        />
        <a
          onClick={() => {
            setTestData(data);
            setTestOpen(true);
          }}
        >
          测试内容
        </a>
      </DrawerForm>
      <TestModal open={testOpen} onOpenChange={setTestOpen} onSubmit={() => {}} data={testData} />
    </>
  );
};

export default Add;
