import { DrawerForm, ProFormItem } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ProFormDependency, ProFormSelect, ProFormSwitch } from '@ant-design/pro-form';
import UserModal from './user-modal';
import { getWorkorderCategoryList } from '@/services/workorder';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit } = props;
  const [userModalShow, setUserModalShow] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const selectUser = () => {
    setUserModalShow(true);
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={'新建执行动作'}
      layout="horizontal"
      width={600}
      labelCol={{
        flex: '160px',
      }}
      open={modalVisit}
      onFinish={onFinish}
      submitter={{
        render: (_, dom) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormSelect
        label="执行动作类型"
        name="type"
        rules={[{ required: true, message: '请选择执行动作类型' }]}
        options={[
          {
            value: 'WORKORDER',
            label: '推送工单',
          },
          {
            value: 'NOTICE',
            label: '推送消息',
            disabled: true,
          },
        ]}
      />
      <ProFormDependency name={['type']}>
        {({ type }) => {
          console.log(type);
          return type === 'NOTICE' ? (
            <>
              <ProFormSelect
                label="推送消息模板"
                name="type3"
                initialValue={'1'}
                valueEnum={{
                  1: 'Alita工单中心',
                }}
              />
              <ProFormItem label="消息接收人">
                <a onClick={selectUser}>项目自定义用户</a>
              </ProFormItem>
            </>
          ) : (
            <>
              <ProFormSelect
                label="推送工单系统"
                name="system"
                initialValue={'1'}
                rules={[{ required: true, message: '请选择推送工单系统' }]}
                valueEnum={{
                  1: 'Alita工单中心',
                }}
              />
              <ProFormSelect
                label="推送工单类型"
                name="linkCode"
                placeholder="请选择推送工单类型"
                rules={[{ required: true, message: '请选择推送工单类型' }]}
                request={async () => {
                  const res = await getWorkorderCategoryList({ code: 'DEVICE' });
                  const resdes = await getWorkorderCategoryList({
                    parentId: res.data && res.data[0].id,
                  });
                  return resdes.data.map((i: any) => ({
                    value: i.code,
                    label: i.name,
                  }));
                }}
              />
            </>
          );
        }}
      </ProFormDependency>
      <ProFormSwitch label="24h内免重复告警推送" name="avoidRepeat" />
      {/* <UserModal open={userModalShow} onOpenChange={setUserModalShow} data={[]} /> */}
    </DrawerForm>
  );
};

export default AddModelForm;
