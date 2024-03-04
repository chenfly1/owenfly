import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import {
  ProFormItem,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-components';
import styles from './style.less';
import { getNoticeChannelList2, webChartTempList } from '@/services/notice';

type IProps = {
  formRef: any;
};

const WechatSevice: React.FC<IProps> = ({ formRef }) => {
  const [webTempList, setWebTempList] = useState<WebChartTempType[]>([]);

  const getWebTempList = async () => {
    const res = await webChartTempList();
    setWebTempList(res.data || []);
    return (res.data || []).map((item: any) => {
      return {
        label: item.title,
        value: item.templateId,
      };
    });
  };
  const getTempSysList = async () => {
    const res = await getNoticeChannelList2({
      pageNo: 1,
      pageSize: 1000,
      channelType: 'WECHAT_OFFICIAL_ACCOUNT',
    });

    return res.data.map((item: any) => {
      return {
        label: item.channelName,
        value: item.bid,
      };
    });
  };
  useEffect(() => {}, []);

  return (
    <>
      <Row>
        <Col span={8}>
          <ProFormSelect
            label="渠道名称(账号)"
            key="channelBid1"
            name="channelBid"
            placeholder="请选择"
            request={getTempSysList}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            label="微信模板名称"
            name="wechatTemplateId"
            placeholder="请选择"
            request={getWebTempList}
            fieldProps={{
              onChange: (id) => {
                const row = webTempList.find((item) => item.templateId === id);
                formRef.current.setFieldsValue({
                  title: row?.title,
                  wechatPrimaryIndustry: row?.primaryIndustry,
                  wechatDeputyIndustry: row?.deputyIndustry,
                  content: row?.content,
                });
              },
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <ProFormText label="标题" name="title" disabled />
        </Col>
        <Col span={8}>
          <ProFormText
            label="所属类目"
            disabled
            fieldProps={{
              maxLength: 200,
            }}
            name="wechatDeputyIndustry"
          />
        </Col>
        <Col span={16}>
          <ProFormTextArea
            className={styles.formItem}
            disabled
            label="场景说明"
            name="wechatPrimaryIndustry"
          />
        </Col>
      </Row>
      <Row>
        <Col span={16}>
          <ProFormTextArea
            label="详细信息"
            name="content"
            disabled
            fieldProps={{
              rows: 4,
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default WechatSevice;
