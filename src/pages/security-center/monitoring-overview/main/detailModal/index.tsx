import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ProFormDateTimePicker,
  DrawerForm,
  ProFormText,
  ProFormSelect,
  ProFormItem,
} from '@ant-design/pro-components';
import { Form, Select, message } from 'antd';
import { useRef, useState } from 'react';
import { useRequest } from 'umi';
import { autoUpdateDeviceType, getDeviceDetail, updateDevice } from '@/services/monitor';
import FlvVideo from '@/components/FlvVideo';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};
const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const [form] = Form.useForm<DeviceVOListType>();
  const [intelligenceType, setIntelligenceType] = useState();
  const videoRef = useRef<any>();
  useRequest(
    () => {
      if (open) {
        return getDeviceDetail({ id: (data as any).id });
      } else {
        videoRef?.current?.destroyPlayer!();
        return {};
      }
    },
    {
      refreshDeps: [open, data],
      onSuccess: (res: any) => {
        form.setFieldsValue(res);
        setIntelligenceType(res.intelligenceType);
        videoRef?.current.createPlayer(res.id);
      },
    },
  );
  const onFinish = async (formData: any) => {
    const res = await updateDevice({ ...data, ...formData, intelligenceType });
    if (res.code === 'SUCCESS') {
      message.success('更新成功');
      onSubmit();
      return true;
    }
    return false;
  };
  const onAuthCatchClick = async () => {
    const res = await autoUpdateDeviceType({ id: data?.id });
    if (res.code === 'SUCCESS') {
    }
  };
  return (
    <DrawerForm
      {...rest}
      labelCol={{ flex: '130px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={600}
      colon={false}
      title={'监控信息'}
      form={form}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <div style={{ height: 300, marginBottom: '20px', background: '#000' }}>
        <FlvVideo id="mse" ref={videoRef} />
      </div>
      <ProFormText name="name" label="设备名称" disabled placeholder="" />
      <ProFormText name="spaceName" label="安装位置" disabled placeholder="" />
      <ProFormSelect
        name="status"
        disabled
        label="设备状态"
        options={[
          { label: '在线', value: 1 },
          { label: '离线', value: 0 },
        ]}
        placeholder=""
      />
      <ProFormItem name="intelligenceType" label="设备类型">
        <Select
          value={intelligenceType}
          style={{ width: '330px' }}
          options={[
            { label: '云控摄像头', value: 2 },
            { label: '智能摄像头', value: 1 },
            { label: '普通摄像头', value: 0 },
          ]}
          onChange={(val) => {
            setIntelligenceType(val);
          }}
          placeholder=""
        />
        <a
          style={{ paddingLeft: '10px' }}
          onClick={() => {
            onAuthCatchClick();
          }}
        >
          自动获取
        </a>
      </ProFormItem>
      {/* <ProFormSelect
        name="showToApp"
        colon={false}
        readonly
        label="业主小程序可查询"
        options={[
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ]}
        placeholder=""
      /> */}
      <ProFormDateTimePicker disabled name="gmtCreated" label="注册时间" />
    </DrawerForm>
  );
};

export default Add;
