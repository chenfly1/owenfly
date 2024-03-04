import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './index.less';
import { Alert, Space, Input, Button, message } from 'antd';
import { queryDeviceConfig } from '@/services/door';
import { useSyncState } from 'react-sync-state-hook';
import {
  CardIdRes,
  ConnectResult,
  initSerial,
  close,
  sendCommand,
} from '@/pages/pass-center/utils/serialUtils';
import { LoadPassword, WriteBlock } from '@/pages/pass-center/utils/commandFn';
const HexStringToBytes = (str: string) => {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }
  return bytes;
};
const Init: React.FC<any> = forwardRef((props, ref) => {
  const [deviceConfig, setDeviceConfig] = useState<{ cardSectionStart: number; cardPwd: string }>();
  const [serialConnect, setSerialConnect, serialbool] = useSyncState<boolean>(false);
  const [loadingSerial, setLoadingSerial] = useState<boolean>(false);
  const [loadingWeite, setLoadingWeite] = useState<boolean>(false);
  const [serialName, setSerialName] = useState<string>('');

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
            setSerialName(portInfo as string);
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
      setSerialName('');
      setSerialConnect(false);
      serialbool.current = false;
    }
  };

  useEffect(() => {
    queryDeviceConfig().then((res) => {
      setDeviceConfig(res.data);
    });
    return () => {
      console.log('关闭');
      closeSerial();
    };
  }, []);

  const writeSerial = async () => {
    setLoadingWeite(true);
    const cardSectionStart = (deviceConfig?.cardSectionStart as number) * 4;
    const res = await sendCommand(
      WriteBlock([cardSectionStart, ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')]),
    );
    for (let i = 1; i < 3; i++) {
      await sendCommand(
        WriteBlock([cardSectionStart * i, ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')]),
      );
      await sendCommand(
        WriteBlock([
          (cardSectionStart + 1) * i,
          ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
        ]),
      );
      await sendCommand(
        WriteBlock([
          (cardSectionStart + 2) * i,
          ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
        ]),
      );
    }
    setLoadingWeite(false);
    if ((res as CardIdRes).result !== 'SUCCESS') {
      return message.error('未识别到卡片');
    }
    message.success('初始化成功');
  };

  useImperativeHandle(ref, () => {
    return {
      closeSerial,
    };
  });

  return (
    <>
      <Alert
        message="IC卡初始化会清除卡上的权限信息，初始化后卡片无法正常使用，请谨慎操作以避免不必要的后果。"
        banner
        closable
      />
      <Space size={0} direction="vertical" className={styles.card}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>初始化步骤</h3>
        <Space className={styles.stepBox}>
          <div className={styles.step}>1</div>
          <div>将读卡器设备连接至电脑</div>
        </Space>
        <Space align="start" className={styles.stepBox}>
          <div className={styles.step}>2</div>
          <div>
            <div style={{ marginBottom: '10px' }}>选择串口信息</div>
            <Space>
              <Input
                placeholder="选择串口信息"
                value={serialName}
                style={{ width: '300px' }}
                disabled
              />
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
          <div>将IC卡放置于读卡器上</div>
        </Space>
        <Space align="start" className={styles.stepBoxAfter}>
          <div className={styles.step}>4</div>
          <div>
            <div style={{ marginBottom: '10px' }}>点击初始化按钮，将IC卡信息初始化</div>
            <Button
              type="primary"
              disabled={!serialConnect}
              loading={loadingWeite}
              onClick={() => writeSerial()}
            >
              初始化
            </Button>
          </div>
        </Space>
      </Space>
    </>
  );
});

export default Init;
