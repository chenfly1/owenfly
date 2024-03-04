import FileUpload from '@/components/FileUpload';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { batchCreateSpaceV2, createSpace, updateSpace } from '@/services/space';
import { Method } from '@/utils';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { FooterToolbar, ProForm, ProFormRadio, ProFormSwitch } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Button, message, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type Props = {
  treeNode: any;
  onSubmit: () => void;
  onCancel: () => void;
};

const RenameForm: React.FC<Props> = ({ treeNode, onSubmit, onCancel }) => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));

  const onFinish = async (formData: any) => {
    const params = {
      id: treeNode.id,
      spaceType: treeNode.spaceType,
      name: formData.name,
      parentId: treeNode.parentId,
      projectBid: project.bid,
    };
    const msg = await updateSpace(params);
    if (msg.code === 'SUCCESS') {
      message.success('编辑成功');
      onSubmit();
    }
  };

  const reset = () => {
    formRef?.current?.resetFields();
    formRef?.current?.setFieldsValue({
      name: treeNode.rowName,
    });
  };

  useEffect(() => {
    reset();
  }, [treeNode]);

  return (
    <ProForm
      onFinish={onFinish}
      formRef={formRef}
      layout={'horizontal'}
      labelCol={{ span: 3 }}
      submitter={{
        render: () => (
          <FooterToolbar>
            <Button
              onClick={() => {
                onCancel();
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              确定
            </Button>
          </FooterToolbar>
        ),
      }}
    >
      <ProFormText
        rules={[
          {
            required: true,
          },
        ]}
        name="name"
        label={`重命名`}
        placeholder="请输入"
      />
    </ProForm>
  );
};

export default RenameForm;
