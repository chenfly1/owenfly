import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { ProFormItem, ProFormTextArea } from '@ant-design/pro-components';
import styles from './style.less';

type IProps = {
  formRef: any;
  categoryBid?: string;
};

const NoteMessage: React.FC<IProps> = ({ formRef, categoryBid }) => {
  return (
    <Row>
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
    </Row>
  );
};

export default NoteMessage;
