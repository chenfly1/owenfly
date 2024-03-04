import React, { useEffect, useRef, useState } from 'react';
import {
  DrawerForm,
  ProFormDependency,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { history } from 'umi';
import {
  addNoticeChannel,
  detailNoticeChannel,
  getNoticeTypeList,
  updateNoticeChannel,
} from '@/services/notice';
import { message } from 'antd';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>('新建渠道');
  const id = data?.bid;

  useEffect(() => {
    formRef?.current?.resetFields();
    setTitle('新建渠道');
    if (open && id) {
      setTitle('编辑渠道');
      detailNoticeChannel({ id }).then((res) => {
        formRef.current?.setFieldsValue({
          ...res.data,
        });
      });
    }
  }, [open]);

  const getChannelTypeList = async () => {
    const res = await getNoticeTypeList();
    return res.data.map((item: any) => ({
      label: item.channelTypeDesc,
      value: item.channelType,
    }));
  };

  // 提交
  const onFinish = async (values: any) => {
    let res: any;
    if (!id) {
      // 新增
      res = await addNoticeChannel(values);
    } else {
      res = await updateNoticeChannel({ bid: id, ...values });
    }
    if (res.code === 'SUCCESS') {
      message.success('提交成功');
      onSubmit();
      return true;
    }
    return false;
  };

  return (
    <DrawerForm
      labelCol={{ flex: '105px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      labelAlign="left"
      title={title}
      open={open}
      colon={false}
      onFinish={onFinish}
      onReset={() => history.goBack()}
    >
      <h3 style={{ fontWeight: 'bold' }}>基础内容</h3>
      <ProFormText
        label="账号名称"
        disabled={id}
        name="channelName"
        rules={[
          {
            required: true,
            message: '请输入账号名称',
          },
        ]}
      />
      <ProFormRadio.Group
        name="channelType"
        colon={true}
        label="渠道类型"
        rules={[
          {
            required: true,
            message: '请选择',
          },
        ]}
        request={getChannelTypeList}
        fieldProps={{
          onChange: (val) => {
            formRef?.current?.setFieldValue('thirdpartyChannel', null);
          },
        }}
      />
      <h3 style={{ fontWeight: 'bold' }}>参数配置</h3>
      <ProFormDependency name={['channelType']}>
        {({ channelType }) => {
          if (channelType === 'SMS') {
            return (
              <ProFormSelect
                labelCol={{ flex: '105px' }}
                labelAlign="left"
                label="模板渠道"
                name="thirdpartyChannel"
                placeholder="请选择"
                options={[
                  {
                    label: '阿里云',
                    value: 'ALIYUN_SMS',
                  },
                  {
                    label: '腾讯云',
                    value: 'TENCENTCLOUD_SMS',
                  },
                ]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            );
          }
          return null;
        }}
      </ProFormDependency>
      <ProFormDependency name={['thirdpartyChannel']}>
        {({ thirdpartyChannel }) => {
          if (thirdpartyChannel === 'ALIYUN_SMS') {
            return (
              <>
                <ProFormText name="appId" label="AccessKeyId" placeholder={'请输入AccessKeyId'} />
                <ProFormText
                  name="appSecret"
                  label="AccessKeySecret"
                  placeholder={'请输入AccessKeySecret'}
                />
                <ProFormText name="smsSecret" label="EndPoint" placeholder={'请输入EndPoint'} />
              </>
            );
          } else if (thirdpartyChannel === 'TENCENTCLOUD_SMS') {
            return (
              <>
                <ProFormText name="appId" label="App ID" placeholder={'请输入App ID'} />
                <ProFormText
                  name="appSecret"
                  label="accessKeyId"
                  placeholder={'请输入App Secret'}
                />
                <ProFormText name="key" label="accessKeySecret" placeholder={'请输入Key'} />
                <ProFormText name="smsSecret" label="region" placeholder={'请输入短信密钥'} />
              </>
            );
          } else {
            return (
              <>
                <ProFormText name="appId" label="App ID" placeholder={'请输入App ID'} />
                <ProFormText name="appSecret" label="App Secret" placeholder={'请输入App Secret'} />
                <ProFormText name="key" label="Key" placeholder={'请输入Key'} />
                <ProFormText name="smsSecret" label="短信密钥" placeholder={'请输入短信密钥'} />
              </>
            );
          }
        }}
      </ProFormDependency>
    </DrawerForm>
  );
};

export default Add;
