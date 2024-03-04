import React, { useEffect, useRef, useState } from 'react';
import { ProFormText, ProFormItem, ProFormSelect } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { getPassingAreaById } from '@/services/DoorManager';
import SpaceTree from '../../components/spaceTree';
import styles from './style.less';
import { getQueryByDeviceList } from '@/services/device';
import { addPassingArea, editUserPassingArea } from '@/services/door';
import { InfoCircleOutlined } from '@ant-design/icons';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (edit: boolean) => void;
  data?: any;
  title: string;
  isEdit: boolean;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data, title, isEdit }) => {
  const formRef = useRef<ProFormInstance>();
  const menuInfo = JSON.parse(sessionStorage.getItem('menuInfo') || '{}');
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>();
  const [deviceList, setDeviceList] = useState<devicesListType[]>([]);

  const queryList = async (passingAreaId: number) => {
    const res = await getPassingAreaById(passingAreaId);
    if (res.code === 'SUCCESS') {
      setDeviceList(res.data.deviceVoList || []);
      setCheckedKeys(res.data.spaceIds);
      formRef?.current?.setFieldsValue({
        name: data.name,
        deviceCount: res.data.deviceVoList?.length || 0,
        checkedKeys: res.data.spaceIds,
      });
    }
  };

  useEffect(() => {
    if (open === true) {
      formRef?.current?.resetFields();
      setCheckedKeys([]);
      setDeviceList([]);
      if (isEdit) {
        queryList(data.id);
      }
    }
  }, [open]);

  // 提交
  const onFinish = async (values: any) => {
    console.log('values', values);
    let fetch = addPassingArea;
    if (isEdit) fetch = editUserPassingArea;
    const res = await fetch({
      ...values,
      id: data.id ? data.id : null,
      deviceSpaceids: deviceList.map((i) => ({
        deviceId: i.id,
        spaceId: i.spaceId,
      })),
      spaceIds: checkedKeys,
      deviceCount: deviceList.length,
    });
    if (res.code === 'SUCCESS') {
      onSubmit(isEdit);
      onOpenChange(false);
      message.success('操作成功');
    }
  };

  const onCheck: any = async (keys: any, info: any) => {
    console.log('onCheck', keys.checked);
    setCheckedKeys(keys.checked);
    formRef?.current?.setFieldsValue({
      checkedKeys: keys.checked,
    });
    if (keys.checked.length) {
      const devRes = await getQueryByDeviceList({
        spaceIds: keys.checked,
        systemCodeList: [menuInfo.code],
      });
      if (devRes.code === 'SUCCESS') {
        setDeviceList(devRes.data);
      }
    } else {
      setDeviceList([]);
    }
  };

  return (
    <DrawerForm
      colon={false}
      labelCol={{ flex: '120px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={550}
      title={title}
      open={open}
      drawerProps={{
        destroyOnClose: true,
        bodyStyle: { paddingRight: '50px' },
      }}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="区域名称"
        placeholder="请输入区域名称"
        rules={[
          {
            required: true,
          },
          {
            max: 30,
            message: '字符长度不可超过30',
          },
        ]}
      />
      <ProFormSelect
        label="区域类型"
        placeholder="请选择"
        name="type"
        initialValue={1}
        disabled
        options={[
          {
            value: 1,
            label: '人员通行区域',
          },
          {
            value: 2,
            label: '访客通行区域',
          },
        ]}
      />
      <ProFormItem
        label="设备空间"
        name="checkedKeys"
        labelCol={{
          flex: '120px',
        }}
        rules={[
          {
            required: true,
            message: '请选择',
          },
        ]}
      >
        <SpaceTree
          checkedKeys={checkedKeys}
          filterSpaceTypes={[
            'PROJECT',
            'PROJECT_STAGE',
            'BUILDING',
            'UNIT',
            'FLOOR',
            'ROOM',
            'PUBLIC_AREA',
          ]}
          checkStrictly
          onCheck={onCheck}
        />
      </ProFormItem>
      <ProFormItem
        label="已选中设备"
        name="deviceCount"
        colon={true}
        tooltip={{
          title: '通行区域绑定的对应设备',
          icon: <InfoCircleOutlined />,
        }}
        labelCol={{
          flex: '120px',
        }}
      >
        <>
          <div className={styles.sleectDevicesNum}>{deviceList.length}台</div>
          {deviceList.length ? (
            <div className={styles.sleectDevices}>
              {deviceList?.map((i) => (
                <p key={i.id}>{i.name}</p>
              ))}
            </div>
          ) : null}
        </>
      </ProFormItem>
    </DrawerForm>
  );
};

export default Add;
