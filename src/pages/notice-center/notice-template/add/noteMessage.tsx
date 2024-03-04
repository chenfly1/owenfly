import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { ProFormItem, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import styles from './style.less';
import { getListSmsTemplate, getNoticeChannelList2 } from '@/services/notice';

type IProps = {
  formRef: any;
  onSubmit: (values: any) => void;
  categoryBid?: string;
};

const NoteMessage: React.FC<IProps> = ({ formRef }) => {
  const [sysTemList, setSysTemList] = useState<Record<string, any>[]>([]);

  const getNotTempList = async (e: any) => {
    const thirdpartyChannel = sysTemList.find(
      (item) => item.bid === e.channelBid2,
    )?.thirdpartyChannel;
    const res = await getListSmsTemplate({ thirdpartyChannel: thirdpartyChannel });
    return (res.data || []).map((item: any) => ({
      ...item,
      label: item.templateName,
      value: item.templateInfoBid,
    }));
  };

  const getTempSysList = async () => {
    const res = await getNoticeChannelList2({
      pageNo: 1,
      pageSize: 1000,
      channelType: 'SMS',
    });
    setSysTemList(res.data);
    return res.data.map((item: any) => {
      return {
        label: item.channelName,
        value: item.bid,
      };
    });
  };

  return (
    <Row>
      <Col span={8}>
        <ProFormSelect
          label="渠道名称(账号)"
          key="channelBid2"
          name="channelBid2"
          placeholder="请选择"
          request={getTempSysList}
        />
      </Col>
      <Col span={8}>
        <ProFormSelect
          label="短信模板名称"
          name="smsTemplateBId"
          dependencies={['channelBid2']}
          placeholder="请选择"
          request={getNotTempList}
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            labelInValue: true,
            onChange: (row) => {
              formRef.current.setFieldsValue({
                content: row?.templateContent,
              });
            },
          }}
        />
      </Col>
      <Col span={16}>
        <ProFormItem className={styles.formItem} label="消息内容">
          <ProFormTextArea
            name="content"
            disabled
            placeholder="请编辑消息内容"
            fieldProps={{
              rows: 4,
            }}
          />
        </ProFormItem>
      </Col>
    </Row>
  );
};

export default NoteMessage;
