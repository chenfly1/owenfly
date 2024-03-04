import { ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { Button } from 'antd';
import { ProFormSelect } from '@ant-design/pro-form';
import styles from './style.less';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const abilityTypeEnum = {
  face: '人脸',
  idCard: 'ID卡',
  icCard: 'IC卡',
  qrcode: '二维码',
  bluetooth: '蓝牙',
  remote: '远程',
  elevator: '梯控',
};

const DetailsModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data } = props;
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    formRef?.current?.resetFields();
    if (modalVisit && data?.id) {
      const abilityText: string[] = [];
      if (data?.deviceAbility) {
        Object.keys(abilityTypeEnum).forEach((key) => {
          if (data?.deviceAbility[key]) {
            abilityText.push(abilityTypeEnum[key]);
          }
        });
      }
      formRef?.current?.setFieldsValue({
        ...data,
        abilityText: abilityText.join('、'),
      });
    }
  }, [modalVisit]);

  return (
    <DrawerForm
      labelCol={{ flex: '112px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={480}
      title="查看设备信息"
      open={modalVisit}
      className={styles.formItem}
      readonly
      labelAlign="left"
      submitter={{
        render: () => {
          return [
            <Button
              key="cancel"
              disabled={false}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              返回
            </Button>,
          ];
        },
      }}
      drawerProps={{
        bodyStyle: { paddingRight: '50px' },
      }}
    >
      <h3 style={{ fontWeight: 'bold' }}>业务信息</h3>
      <ProFormText name="name" label="设备名称" />
      <ProFormText name={['setDeviceConfig', 'deviceNo']} label="机号" />
      <ProFormSelect
        label="进出口"
        readonly
        name={['doorDevice', 'inOut']}
        options={[
          {
            value: '1',
            label: '进',
          },
          {
            value: '2',
            label: '出',
          },
          {
            value: '3',
            label: '进出',
          },
          {
            value: 0,
            label: '-',
          },
        ]}
      />
      <ProFormText name={['doorDevice', 'bluetoothKey']} label="蓝牙秘钥" />
      <ProFormText name={['doorDevice', 'qrcodeKey']} label="二维码秘钥" />
      <h3 style={{ fontWeight: 'bold' }}>基础信息</h3>
      <ProFormText name="id" label="设备ID" />
      <ProFormText name="sn" label="SN" />
      <ProFormText name="did" label="DID" />
      <ProFormText name="mac" label="MAC" />
      <ProFormText name="ip" label="IP" />
      <ProFormText name="manufacturer" label="厂商" />
      <ProFormText name="model" label="型号" />
      <ProFormText name="typeName" label="设备类型" />
      <ProFormText name="spaceName" label="安装位置" />
      <ProFormText name="abilityText" label="支持通行方式" />
    </DrawerForm>
  );
};

export default DetailsModelForm;
