import FileUpload from '@/components/FileUpload';
import { application } from '@/components/FileUpload/business';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ProForm,
  ProFormGroup,
  ProFormRadio,
  ProFormItem,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form } from 'antd';

import { useRef, useState } from 'react';
import type { configWxType, pProps } from './data';

const ConfigWx: React.FC<pProps> = (props) => {
  const { data } = props;
  const billRef = useRef<ProFormInstance>();
  const [form] = Form.useForm<configWxType>();
  const [, setP12FileId] = useState('');
  const [, setCertFileId] = useState('');
  const [, setPrivateFileId] = useState('');
  const [disable, setDisable] = useState(true);
  const [useVerion, setUseVersion] = useState('');
  form.setFieldsValue({ ...data });

  const onEditBtn = async () => {
    if (disable) {
      setDisable(false);
    } else {
      // 保存
      billRef.current?.validateFields().then((valid) => {
        if (valid) {
          const param = billRef.current?.getFieldFormatValueObject!();
          console.log(param);
        }
      });
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'self-start', justifyContent: 'space-between' }}>
      <ProForm
        key="4"
        formRef={billRef}
        form={form}
        disabled={disable}
        style={{ width: '100%' }}
        validateTrigger="onBlur"
        submitter={false}
      >
        {/* 微信 */}
        <ProFormGroup>
          <ProFormText
            name="merchantNo"
            width="md"
            label="微信支付商户号"
            rules={[{ required: true, message: '这是必填项' }]}
          />
          <ProFormText
            name="appId"
            width="md"
            label="应用App ID"
            rules={[{ required: true, message: '这是必填项' }]}
          />
          <ProFormText
            name="appSecret"
            width="md"
            label="应用App secret"
            rules={[{ required: true, message: '这是必填项' }]}
          />
          <ProFormText
            name="authUrl"
            width="md"
            label="oauth2地址（置空将使用官方）"
            rules={[{ required: true, message: '这是必填项' }]}
          />
        </ProFormGroup>

        <ProFormRadio.Group
          name="version"
          label="微信支付版本"
          rules={[{ required: true, message: '这是必填项' }]}
          options={[
            { value: 'v2', label: 'V2' },
            { value: 'v3', label: 'V3' },
          ]}
          fieldProps={{
            onChange: (val) => {
              setUseVersion(val.target.value);
            },
          }}
        />
        <ProFormTextArea
          hidden={useVerion == 'v3'}
          name="v2key"
          label="APIv2密钥"
          rules={[{ required: true, message: '这是必填项' }]}
        />
        <ProFormTextArea
          name="v3key"
          label="APIv3密钥（V3接口必填）"
          rules={[{ required: true, message: '这是必填项' }]}
        />
        <ProFormTextArea
          name="serialNo"
          label="序列号（V3接口必填）"
          rules={[{ required: true, message: '这是必填项' }]}
        />
        <ProFormItem
          name="p12"
          label="API证书（apiclient_cert.p12）"
          rules={[{ required: true, message: '这是必填项' }]}
        >
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".p12"
            onUploadSuccess={(objectIdCd: string) => {
              setP12FileId(objectIdCd);
            }}
            onRemove={() => {
              setP12FileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>
        <ProFormItem
          name="cert12"
          label="证书文件（apiclient_cert.pem）"
          rules={[{ required: true, message: '这是必填项' }]}
        >
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".pem"
            onUploadSuccess={(objectIdCd: string) => {
              setCertFileId(objectIdCd);
            }}
            onRemove={() => {
              setCertFileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>

        <ProFormItem
          name="privatekey"
          label="私钥文件（apiclient_key.pem）"
          rules={[{ required: true, message: '这是必填项' }]}
        >
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".pem"
            onUploadSuccess={(objectIdCd: string) => {
              setPrivateFileId(objectIdCd);
            }}
            onRemove={() => {
              setPrivateFileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>
        <ProFormSwitch
          label="状态"
          disabled
          fieldProps={{
            checked: true,
          }}
        />
      </ProForm>

      <Button type="primary" onClick={onEditBtn}>
        {disable ? '编辑' : '保存'}
      </Button>
    </div>
  );
};

export default ConfigWx;
