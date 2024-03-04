import React from 'react';
import { Row, Col } from 'antd';
import { ProFormCheckbox, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

type IProps = {
  formRef: any;
  categoryBid?: string;
};

const WebMessage: React.FC<IProps> = () => {
  return (
    <Row>
      <Col span={8}>
        <ProFormText
          label="标题"
          disabled
          name="title"
          fieldProps={{
            maxLength: 200,
            // addonBefore: 'https://'
          }}
          placeholder="请输入标题"
        />
      </Col>
      <Col span={8}>
        <ProFormText
          label="简述"
          disabled
          fieldProps={{
            maxLength: 200,
          }}
          name="simpleDesc"
          placeholder="请输入简述"
        />
      </Col>
      <Col span={24}>
        <ProFormTextArea
          label="消息内容"
          name="content"
          disabled
          placeholder="请编辑消息内容"
          fieldProps={{
            rows: 4,
          }}
        />
      </Col>
      <Col span={24}>
        <ProFormCheckbox label="是否跳转" name="redirectStatus" disabled />
      </Col>
      <Col span={24}>
        <ProFormText
          label="跳转链接"
          name="redirectUrl"
          disabled
          width="md"
          fieldProps={{
            maxLength: 300,
            addonBefore: 'https://',
          }}
          placeholder="请输入地址"
        />
      </Col>
    </Row>
  );
};

export default WebMessage;
