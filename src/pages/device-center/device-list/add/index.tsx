import { DrawerForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef } from 'react';
import { queryDeviceConfig, saveDeviceConfig } from '@/services/door';
import storageSy from '@/utils/Setting/storageSy';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange } = props;
  const formRef = useRef<ProFormInstance>();
  const projectInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));

  useEffect(() => {
    queryDeviceConfig(projectInfo?.bid as string).then((res) => {
      formRef?.current?.setFieldsValue({
        ...res.data,
        projectName: projectInfo?.name,
      });
    });
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      console.log(values);
      values.projectUid = projectInfo?.bid;
      const res = await saveDeviceConfig(values);
      if (res.code === 'SUCCESS') {
        onOpenChange(false);
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title="IC设备配置"
      width={560}
      layout="horizontal"
      labelCol={{
        flex: '100px',
      }}
      open={modalVisit}
      onFinish={onFinish}
      submitter={{
        render: (_, dom) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormText name="projectName" label="项目名称" colon={false} readonly />
      <ProFormDigit
        name="cardSectionStart"
        label="扇区开始位置"
        validateTrigger="onBlur"
        rules={[
          { required: true, message: '请输入1-14的整数' },
          {
            validator(rule, value, callback) {
              if (value < 1 || value > 14) {
                callback('请输入1-14的整数');
              }
              callback();
            },
          },
        ]}
        fieldProps={{
          maxLength: 2,
          precision: 0,
        }}
        placeholder="请输入1-14的整数"
      />
      <ProFormText
        name="cardPwd"
        label="设置密码"
        placeholder="请输入12个字符串（0-9，A-F）"
        validateTrigger="onBlur"
        fieldProps={{
          maxLength: 12,
        }}
        rules={[
          { required: true, message: '请输入12个字符串（0-9，A-F）' },
          { pattern: /^[0-9A-F]{12}$/, message: '请输入12个字符串（0-9，A-F）' },
        ]}
      />
    </DrawerForm>
  );
};

export default AddModelForm;
