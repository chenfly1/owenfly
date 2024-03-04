import React, { useState } from 'react';
import { Row, Col } from 'antd';
import styles from './style.less';
import {
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import EditMessage from './editMessage';

type IProps = {
  formRef: any;
  onSubmit: (values: any) => void;
  categoryBid?: string;
};

const WebMessage: React.FC<IProps> = ({ formRef, onSubmit, categoryBid }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<Record<string, any>>();
  const editMessageSubmit = (values: any) => {
    formRef.current.setFieldsValue({
      content: values.content,
    });
    onSubmit(values);
  };

  return (
    <Row>
      <Col span={8}>
        <ProFormText
          label="标题"
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
          fieldProps={{
            maxLength: 200,
          }}
          name="simpleDesc"
          placeholder="请输入简述"
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
          <a
            onClick={() => {
              const form = formRef.current.getFieldsValue();
              setData({ ...form, categoryBid });
              setOpen(true);
            }}
          >
            编辑消息内容
          </a>
        </ProFormItem>
      </Col>
      <Col span={24}>
        <ProFormCheckbox label="是否跳转" name="redirectStatus" />
      </Col>
      <Col span={24}>
        <ProFormDependency name={['redirectStatus']}>
          {({ redirectStatus }) => {
            return (
              <ProFormText
                label="跳转链接"
                name="redirectUrl"
                disabled={!redirectStatus}
                width="md"
                fieldProps={{
                  maxLength: 300,
                  addonBefore: 'https://',
                }}
                placeholder="请输入地址"
              />
            );
          }}
        </ProFormDependency>
      </Col>
      <EditMessage open={open} onOpenChange={setOpen} data={data} onSubmit={editMessageSubmit} />
    </Row>
  );
};

export default WebMessage;
