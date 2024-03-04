import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { ExclamationCircleFilled } from '@ant-design/icons';
import type { CaptFieldRef, ProFormInstance } from '@ant-design/pro-components';
import { ProFormCaptcha } from '@ant-design/pro-form';
import { getCaptcha } from '@/services/app';
import { modifyPhone } from '@/services/wps';
import { useEffect, useRef } from 'react';
import { message, Modal } from 'antd';

const { confirm } = Modal;

type IProps = {
  modalVisit: boolean;
  detailsData: TenantListType;
  onOpenChange: (open: boolean) => void;
  setDetailData: (data: TenantListType) => void;
};

const ModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, detailsData, setDetailData } = props;
  const formRef = useRef<ProFormInstance>();
  const captchaRef = useRef<CaptFieldRef | null | undefined>();
  useEffect(() => {
    formRef?.current?.resetFields();
  }, [modalVisit]);
  return (
    <ModalForm
      title="修改密保手机号"
      open={modalVisit}
      formRef={formRef}
      onFinish={async (value) => {
        confirm({
          icon: <ExclamationCircleFilled />,
          title: '修改密保手机',
          content: <p>提交后，该租户密码相关信息将发送到新密保手机，请确定是否提交</p>,
          okText: '确定提交',
          cancelText: '取消',
          centered: true,
          onOk: async () => {
            const res = await modifyPhone(detailsData.bid, {
              securePhone: value.mobile,
              phoneCode: value.phoneCode,
            });
            if (res.code === 'SUCCESS') {
              setDetailData({
                ...detailsData,
                info: {
                  ...detailsData.info,
                  securePhone: value.mobile,
                },
              });
              message.success('修改成功');
            }
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        return true;
      }}
      onOpenChange={onOpenChange}
    >
      <ProFormText
        name="mobile"
        label="密保手机"
        tooltip="密保手机用于接收该租户密码相关信息"
        placeholder={'请输入手机号'}
        fieldProps={{
          maxLength: 11,
        }}
        validateTrigger="onBlur"
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
          {
            pattern: /^1\d{10}$/,
            message: '手机号格式错误',
          },
        ]}
      />
      <ProFormCaptcha
        label="确定码"
        captchaProps={{
          type: 'primary',
          ghost: true,
        }}
        placeholder={'请输入确定码'}
        name="phoneCode"
        fieldProps={{
          maxLength: 10,
        }}
        captchaTextRender={(timing, count) => {
          if (timing) {
            return `${count}S ${'获取确定码'}`;
          }
          return '获取确定码';
        }}
        rules={[
          {
            required: true,
            message: '请输入确定码',
          },
        ]}
        fieldRef={captchaRef}
        onGetCaptcha={async () => {
          const securePhone = formRef?.current?.getFieldValue('mobile');
          if (!securePhone) {
            message.warning('请输入密保手机');
            return new Promise((resolve, reject) => {
              reject();
            });
          }
          if (!/^1\d{10}$/.test(securePhone)) {
            message.warning('手机号格式错误');
            return new Promise((resolve, reject) => {
              reject();
            });
          }
          captchaRef.current?.startTiming();
          getCaptcha({
            phone: securePhone,
          }).then((res) => {
            if (res.code === 'SUCCESS') {
              message.success('获取确定码成功');
            }
          });
        }}
      />
    </ModalForm>
  );
};

export default ModelForm;
