import { ProFormInstance, ProFormText, ProFormRadio } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './idIndex.less';
import { useSyncState } from 'react-sync-state-hook';
import type { CardIdRes, ConnectResult } from '@/pages/pass-center/utils/serialUtils';
import { sendCommand, close, initSerial } from '@/pages/pass-center/utils/serialUtils';
import { LoadPassword, ReadSerialNumber } from '@/pages/pass-center/utils/commandFn';
import { idCardCheck } from '@/services/door';
import ModalForm from '@/components/ModalFormCount';

type IProps = {
  modalVisit: boolean;
  idCardNum: string;
  detailsData: any;
  deviceConfig: { cardSectionStart: number; cardPwd: string };
  onSubmit: (obj: any) => void;
  onOpenChange: (open: boolean) => void;
};

const HexStringToBytes = (str: string) => {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }
  return bytes;
};

const BatchFace: React.FC<IProps> = ({
  modalVisit,
  onSubmit,
  detailsData,
  deviceConfig,
  idCardNum,
  onOpenChange,
}) => {
  const formRef = useRef<ProFormInstance>();
  const [serialConnect, setSerialConnect, serialbool] = useSyncState<boolean>(false);
  const [idLoading, setIdLoading] = useState<boolean>(false);
  const [loadingSerial, setLoadingSerial] = useState<boolean>(false);

  // 打开串口
  const openSerial = () => {
    if (!deviceConfig?.cardPwd) {
      message.error('请先到[门禁梯控设备]进行IC设备配置');
      return;
    }
    setLoadingSerial(true);
    initSerial(async (res: ConnectResult, portInfo?: string) => {
      console.log('res: ', res);
      if (res === 'CONNECTED') {
        const setTimer = setTimeout(async () => {
          const pwdData = await sendCommand(
            LoadPassword(HexStringToBytes(deviceConfig?.cardPwd as string)),
          );
          console.log(pwdData);
          if ((pwdData as CardIdRes).result === 'SUCCESS') {
            setLoadingSerial(false);
            formRef?.current?.setFieldsValue({
              serialName: portInfo,
            });
            setSerialConnect(true);
            message.success('连接成功');
          } else {
            close();
            setLoadingSerial(false);
            message.error('修改发卡器密码失败，请重新连接');
          }
          clearTimeout(setTimer);
        }, 1000);
      } else {
        setLoadingSerial(false);
        // message.error('连接失败，请重新连接');
      }
    });
  };

  // 关闭串口
  const closeSerial = () => {
    console.log(serialbool);
    if (serialbool.current) {
      close();
      formRef?.current?.setFieldsValue({
        serialName: '',
      });
      setSerialConnect(false);
      serialbool.current = false;
    }
  };

  useEffect(() => {
    if (!modalVisit) closeSerial();
  }, [modalVisit]);

  useEffect(() => {
    if (!idCardNum) formRef?.current?.resetFields();
  }, [idCardNum]);

  // 读ID卡
  const readSerial = async () => {
    setIdLoading(true);
    const readData = await sendCommand(ReadSerialNumber());
    setIdLoading(false);
    if ((readData as CardIdRes).result === 'NODATA') {
      return message.error('未识别到卡片');
    }
    if ((readData as CardIdRes).result === 'SUCCESS') {
      // 有卡号
      if (!(readData as any).id.length) {
        return message.error('未识别到卡片');
      }
      message.success('读卡成功');
      formRef?.current?.setFieldsValue({
        idCardNum: (readData as any).id.splice(2).join(''),
      });
      console.log(readData);
    }
  };

  const onOk = async (values: Record<string, any>) => {
    if (!values.idCardNum) return message.error('请读取ID卡信息');
    const res = await idCardCheck({ num: values.idCardNum, userId: detailsData?.id });
    if (res.data) return message.error('该ID卡已被绑定');
    onOpenChange(false);
    onSubmit(values);
  };

  return (
    <ModalForm
      title="ID卡信息录入"
      width={600}
      formRef={formRef}
      layout="horizontal"
      open={modalVisit}
      onOpenChange={onOpenChange}
      onFinish={onOk}
      className={styles.modalForm}
      modalProps={{
        centered: true,
        maskClosable: false,
        onCancel: () => {
          onOpenChange(false);
        },
      }}
      submitter={{
        render: (_: any, dom: any) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <Space size={0} direction="vertical" className={styles.icidform}>
        <ProFormRadio.Group
          name="idCardClass"
          colon={true}
          initialValue={2}
          label="ID卡类型"
          options={[
            {
              label: '业主卡',
              value: 2,
            },
            {
              label: '管理卡',
              value: 1,
            },
          ]}
        />
        <Space className={styles.stepBox}>
          <div className={styles.step}>1</div>
          <div>将读卡器设备连接至电脑</div>
        </Space>
        <Space align="start" className={styles.stepBox}>
          <div className={styles.step}>2</div>
          <div className={styles.formItem}>
            <div style={{ marginBottom: '10px' }}>选择串口信息</div>
            <Space>
              <ProFormText name="serialName" disabled width="md" placeholder="选择串口信息" />
              <Button
                hidden={serialConnect}
                loading={loadingSerial}
                type="primary"
                ghost
                onClick={openSerial}
              >
                选择串口
              </Button>
              <Button hidden={!serialConnect} danger type="primary" onClick={closeSerial} ghost>
                关闭串口
              </Button>
            </Space>
          </div>
        </Space>
        <Space className={styles.stepBox}>
          <div className={styles.step}>3</div>
          <div>将ID卡放置于读卡器上</div>
        </Space>
        <Space align="start" className={styles.stepBoxAfter}>
          <div className={styles.step}>4</div>
          <div className={styles.formItem}>
            <div style={{ marginBottom: '10px' }}>点击读卡按钮，自动读取卡号</div>
            <Space>
              <Button
                type="primary"
                loading={idLoading}
                onClick={readSerial}
                disabled={!serialConnect}
                ghost
              >
                读卡
              </Button>
              <ProFormText name="idCardNum" width="md" disabled placeholder="请读取ID卡号" />
            </Space>
          </div>
        </Space>
      </Space>
    </ModalForm>
  );
};

export default BatchFace;
