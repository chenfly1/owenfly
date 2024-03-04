import React, { useEffect, useRef, useState } from 'react';
import { DrawerForm, ProFormText, ProFormItem } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import OssImage from '@/components/OssImage';
import { feedbackBusiness } from '@/components/FileUpload/business';
import { history } from 'umi';
import PropertyModal from './property-modal';
import { getFeedbackDetail } from '@/services/auth';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const View: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const formRef = useRef<ProFormInstance>();
  const [propertyShowModal, setPropertyShowModal] = useState<boolean>(false);

  useEffect(() => {
    formRef?.current?.resetFields();
    if (open && data?.id) {
      getFeedbackDetail(data.id).then((res) => {
        formRef.current?.setFieldsValue({
          ...res.data,
        });
      });
    }
  }, [open]);

  const propertyShow = () => {
    setPropertyShowModal(true);
  };

  return (
    <DrawerForm
      labelCol={{ flex: '80px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      labelAlign="left"
      title="查看详情"
      open={open}
      readonly
      submitter={{
        searchConfig: {
          resetText: '返回',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      onReset={() => history.goBack()}
    >
      <ProFormText name="userName" label="用户昵称" />
      <ProFormText name="userPhone" label="用户手机号">
        {data?.userPhone || '-'} <a onClick={propertyShow}> 查看关联产权信息</a>
      </ProFormText>
      <ProFormText name="gmtCreated" label="反馈时间" />
      <ProFormText name="text" label="反馈内容" />
      <ProFormItem shouldUpdate label="图片">
        {(form: any) => {
          console.log('form?.getFieldValue(picture)', form?.getFieldValue('objectIds'));
          const objectIds = form?.getFieldValue('objectIds');
          return objectIds && objectIds.length
            ? objectIds.map((objectId: string) => (
                <OssImage
                  key="objectId"
                  style={{ width: '80px', height: '80px', marginRight: '10px' }}
                  objectId={objectId}
                  business={feedbackBusiness.id}
                />
              ))
            : '-';
        }}
      </ProFormItem>
      <PropertyModal open={propertyShowModal} onOpenChange={setPropertyShowModal} data={data} />
    </DrawerForm>
  );
};

export default View;
