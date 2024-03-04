import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProFormDateRangePicker } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import { Button, Card, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import { packageOptions, parkYardListByPage, placeQueryByPage } from '@/services/park';
import { vehicleAuthHandle } from '@/services/park';

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
  const [title, setTitle] = useState<string>('');
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const onFinish = async (form: any) => {
    const params = {
      id: data?.id,
      parkId: form.parkId,
      packageId: form.packageId,
      spaceIds: form.carportes,
      startDate: form?.dateRange[0] + ' 00:00:00',
      endDate: form?.dateRange[1] + ' 23:59:59',
      reviewType: 1,
    };
    const res = await vehicleAuthHandle(params);
    if (res.code === 'SUCCESS') {
      message.success('办理成功');
      return true;
    }
    return false;
  };

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: project.bid,
    });
    return (res.data.items || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  };

  // 车位下拉
  const queryLotList = async () => {
    const res = await placeQueryByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
      state: '1',
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  useEffect(() => {
    if (open) {
      formRef.current?.resetFields();
      setTitle(data?.type === '1' ? '月租申请' : '产权申请');
      formRef.current?.setFieldsValue({
        ...data,
      });
    }
  }, [open]);

  return (
    <DrawerForm
      colon={false}
      {...rest}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      className={styles.drawerModal}
      width={620}
      title={title}
      formRef={formRef}
      open={open}
      submitter={{
        render: (props) => (
          <Space>
            <Button
              onClick={() => {
                onSubmit();
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                props.form?.submit?.();
              }}
            >
              办理
            </Button>
          </Space>
        ),
      }}
      onFinish={onFinish}
    >
      <ProFormSelect name="spaces" label="车位编号" request={queryLotList} mode="multiple" />
      <ProFormText colon={false} readonly name="plates" label="车牌号码" />
      <ProFormText colon={false} readonly name="gmtGreated" label="申请时间" />
      <ProFormText colon={false} readonly name="ownerName" label="产权人" />
      <ProFormText colon={false} readonly name="ownerPhone" label="手机号码" />
      <Card
        bordered
        style={{ marginBlockEnd: 10 }}
        title={'办理'}
        bodyStyle={{ paddingBlockEnd: 0 }}
      >
        <ProFormSelect
          rules={[{ required: true }]}
          name="parkId"
          label="车场名称"
          allowClear={false}
          fieldProps={{
            showSearch: true,
            onChange: () => {
              formRef?.current?.resetFields(['packageId']);
            },
          }}
          request={queryParkList}
        />
        <ProFormSelect
          rules={[{ required: true }]}
          name="packageId"
          label="车辆套餐"
          dependencies={['parkId']}
          fieldProps={{
            allowClear: false,
            showSearch: true,
            placeholder: '请选择',
          }}
          readonly={readonly}
          request={async (values: { parkId: string }) => {
            if (values.parkId) {
              const res = await packageOptions({ ...values, type: '1' });
              return res.data.map((item: any) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              });
            } else {
              return [];
            }
          }}
        />
        <ProFormDateRangePicker
          colProps={{}}
          rules={[{ required: true, message: '请选择有效期' }]}
          label="有效期"
          name="dateRange"
          width={'lg'}
        />
      </Card>
    </DrawerForm>
  );
};

export default Add;
