import FileUpload from '@/components/FileUpload';
import { application } from '@/components/FileUpload/business';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ProForm,
  ProFormCheckbox,
  ProFormItem,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Radio } from 'antd';

import { useRef, useState } from 'react';
import type { pProps } from './data';

const ConfigZfb: React.FC<pProps> = (props) => {
  const { data } = props;
  const billRef = useRef<ProFormInstance>();
  const [, setAppPublicFileId] = useState('');
  const [, setPublicFileId] = useState('');
  const [, setRootFileId] = useState('');
  const [disable, setDisable] = useState(true);
  billRef.current?.setFieldsValue({ ...data });

  const onEditBtn = () => {
    if (disable) {
      setDisable(false);
    } else {
      // 保存

      // 保存成功
      setDisable(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'self-start', justifyContent: 'space-between' }}>
      <ProForm
        key="4"
        formRef={billRef}
        disabled={disable}
        submitter={false}
        validateTrigger="onBlur"
      >
        {/* 支付宝 */}
        <ProFormItem name="environment" label="环境配置" required>
          <Radio.Group>
            <Radio value="local">沙箱环境</Radio>
            <Radio value="product">生产环境</Radio>
          </Radio.Group>
        </ProFormItem>
        <ProFormText name="appId" label="应用App ID" required />
        <ProFormText name="appPrivateKey" label="应用私钥" required />
        <ProFormText name="zfbPublicKey" label="支付宝公钥（不使用证书时必填）" />
        <ProFormItem name="signWay" label="接口签名方式（推荐使用RSA2）" required>
          <Radio.Group>
            <Radio value="RSA">RSA</Radio>
            <Radio value="product">生产环境</Radio>
          </Radio.Group>
        </ProFormItem>
        <ProFormItem name="publicKey" label="公钥证书">
          <Radio.Group>
            <Radio value="use">使用证书（请使用RSA2私钥）</Radio>
            <Radio value="nouse">不使用证书时</Radio>
          </Radio.Group>
        </ProFormItem>
        <ProFormItem name="appPublicFile" label="应用公钥证书（.crt格式）" required>
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".crt"
            onUploadSuccess={(objectIdCd: string) => {
              setAppPublicFileId(objectIdCd);
            }}
            onRemove={() => {
              setAppPublicFileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>
        <ProFormItem name="zfbPublicFile" label="应用私钥" required>
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".crt"
            onUploadSuccess={(objectIdCd: string) => {
              setPublicFileId(objectIdCd);
            }}
            onRemove={() => {
              setPublicFileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>
        <ProFormItem name="zfbRootFile" label="支付宝根证书（.crt格式）" required>
          <FileUpload
            business={application}
            buttonText="上传文件"
            accept=".crt"
            onUploadSuccess={(objectIdCd: string) => {
              setRootFileId(objectIdCd);
            }}
            onRemove={() => {
              setRootFileId('');
            }}
            listType="text"
            maxCount={1}
            showUploadList={false}
          />
        </ProFormItem>
        <ProFormCheckbox.Group options={['']} />
        <ProFormSwitch
          disabled
          label="状态"
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

export default ConfigZfb;
