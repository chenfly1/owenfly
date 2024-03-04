import React, { useState } from 'react';
import { Row, Col } from 'antd';
import styles from './style.less';
import {
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

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
          name="title"
          fieldProps={{
            maxLength: 200,
          }}
          placeholder="请输入标题"
        />
      </Col>
      <Col span={24}>
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
      <Col span={24}>
        <ProFormCheckbox label="是否跳转" name="redirectStatus" disabled />
      </Col>
      <Col span={24}>
        <ProFormRadio.Group
          label="链接类型"
          disabled={true}
          name="type"
          options={[
            { label: 'H5', value: 'H5' },
            { label: '小程序', value: 'wechat_mini_program' },
          ]}
        />
      </Col>
      <Col span={24}>
        <ProFormText
          label="跳转链接"
          name="redirectUrl"
          disabled={true}
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
