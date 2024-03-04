import {
  addAlarmPlan,
  getAlarmPlanDetail,
  getAlarmPlanPage,
  listEventTypeConfig,
  updateAlarmPlan,
} from '@/services/monitor';
import { allUse } from '@/services/workorder';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ProFormSelect,
  DrawerForm,
  ProFormText,
  ProFormDependency,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  readonly,
  onSubmit,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const queryEventConfigTypes = async () => {
    const res = await listEventTypeConfig({ projectId: project.bid });
    return (res.data || []).map((item: any) => ({
      label: item.eventName,
      value: item.eventTypeCode,
    }));
  };

  const queryAlarmType = async () => {
    const params = {
      pageNo: 1,
      pageSize: 100,
    };
    const res = await getAlarmPlanPage(params);
    return res?.data?.items || [];
  };

  const getDetail = async () => {
    const res = await getAlarmPlanDetail({ id: data?.id });
    formRef?.current?.setFieldsValue({
      ...res.data,
      // ...data,
    });
  };

  const queryUserList = async () => {
    const res = await allUse({ projectBid: project.bid });
    return (res.data || [])?.map((item: any) => {
      return {
        ...item,
        label: item.name,
        value: item.userBid,
      };
    });
  };

  const onFinish = async (params: any) => {
    if (data?.id) {
      params.id = data?.id;
      const res = await updateAlarmPlan(params);
      if (res.code === 'SUCCESS') {
        message.success('保存成功');
        onSubmit();
        return true;
      }
      return false;
    } else {
      const res = await addAlarmPlan(params);
      if (res.code === 'SUCCESS') {
        message.success('保存成功');
        onSubmit();
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      if (data?.id) {
        getDetail();
      }
    }
  }, [open]);
  return (
    <DrawerForm
      {...rest}
      labelCol={{ flex: '120px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      colon={false}
      title={'告警配置'}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <ProFormText
        name="description"
        label="告警描述"
        fieldProps={{ maxLength: 20, showCount: true }}
      />
      <ProFormSelect
        name="eventTypeCode"
        request={async () => {
          const disabledList = await queryAlarmType();
          const options = await queryEventConfigTypes();
          return options.map((item: any) => {
            if (disabledList.some((i: any) => i.eventTypeCode === item.value)) {
              return {
                disabled: true,
                ...item,
              };
            } else {
              return {
                ...item,
              };
            }
          });
        }}
        label="告警类型"
      />
      <ProFormSelect
        name="eventLevel"
        options={[
          {
            label: '低',
            value: 1,
          },
          {
            label: '中',
            value: 2,
          },
          {
            label: '高',
            value: 3,
          },
        ]}
        label="告警等级"
      />
      <ProFormSelect
        name="handleType"
        options={[
          {
            label: '发通知',
            value: 2,
          },
          {
            label: '转工单',
            value: 1,
          },
          {
            label: '不处理',
            value: 0,
          },
        ]}
        label="预案处理"
      />
      <ProFormDependency name={['handleType']}>
        {({ handleType }) => {
          if (handleType === 2) {
            // 发通知
            return (
              <ProFormSelect
                name="notifyStaffIds"
                mode="multiple"
                request={queryUserList}
                label="通知人员"
              />
            );
          } else {
            // 转工单
            return null;
          }
        }}
      </ProFormDependency>
    </DrawerForm>
  );
};

export default Add;
