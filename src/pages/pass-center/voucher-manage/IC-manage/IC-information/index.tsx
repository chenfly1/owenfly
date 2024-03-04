import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './index.less';
import { Button, Input, Space, message } from 'antd';
import { ProForm, ProFormInstance, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { getICcardDetails, protocoltransitionRead, queryDeviceConfig } from '@/services/door';
import { useSyncState } from 'react-sync-state-hook';
import type { CardIdRes, ConnectResult } from '@/pages/pass-center/utils/serialUtils';
import { sendCommand, close, initSerial } from '@/pages/pass-center/utils/serialUtils';
import { LoadPassword, ReadBlock } from '@/pages/pass-center/utils/commandFn';
const HexStringToBytes = (str: string) => {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }
  return bytes;
};
// souece 原字符串 start 要截取的位置 newStr 要插入的字符
const insertStr = (source: string, newStr: string) => {
  return '20' + source.slice(0, 2) + newStr + source.slice(2, 4) + newStr + source.slice(4);
};
const Information: React.FC<any> = forwardRef((props, ref) => {
  const formRef = useRef<ProFormInstance>();
  const [deviceConfig, setDeviceConfig] = useState<{ cardSectionStart: number; cardPwd: string }>();
  const [serialConnect, setSerialConnect, serialbool] = useSyncState<boolean>(false);
  const [loadingSerial, setLoadingSerial] = useState<boolean>(false);
  const [loadingRead, setLoadingRead] = useState<boolean>(false);
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

  // 读卡
  const readSerial = async () => {
    formRef?.current?.resetFields();
    setLoadingRead(true);
    const cardSectionStart = (deviceConfig?.cardSectionStart as number) * 4;
    // 门禁命令
    const firstCommand = ReadBlock(cardSectionStart);
    const secondCommand = ReadBlock(cardSectionStart + 1);
    const thirdCommand = ReadBlock(cardSectionStart + 2);
    const firstData = await sendCommand(firstCommand);
    if ((firstData as CardIdRes).result !== 'SUCCESS') {
      setLoadingRead(false);
      return message.error('未识别到卡片');
    }
    const secondData = await sendCommand(secondCommand);
    const thirdData = await sendCommand(thirdCommand);
    // 梯控命令
    const liftCardSectionStart = ((deviceConfig?.cardSectionStart as number) + 2) * 4;
    const liftFirstData = await sendCommand(ReadBlock(liftCardSectionStart));
    const liftSecondData = await sendCommand(ReadBlock(liftCardSectionStart + 1));
    const liftThirdData = await sendCommand(ReadBlock(liftCardSectionStart + 2));
    const fourthData = await sendCommand(ReadBlock(liftCardSectionStart + 4));
    const fifthData = await sendCommand(ReadBlock(liftCardSectionStart + 5));
    const sixthData = await sendCommand(ReadBlock(liftCardSectionStart + 6));
    const seventhData = await sendCommand(ReadBlock(liftCardSectionStart + 8));
    const eighthData = await sendCommand(ReadBlock(liftCardSectionStart + 9));
    const ninthData = await sendCommand(ReadBlock(liftCardSectionStart + 10));
    const tenthData = await sendCommand(ReadBlock(liftCardSectionStart + 12));
    const eleventhData = await sendCommand(ReadBlock(liftCardSectionStart + 13));
    const twelfthData = await sendCommand(ReadBlock(liftCardSectionStart + 14));
    const thirteenthData = await sendCommand(ReadBlock(liftCardSectionStart + 16));
    const fourteenthData = await sendCommand(ReadBlock(liftCardSectionStart + 17));
    const fifteenthData = await sendCommand(ReadBlock(liftCardSectionStart + 18));
    const sixteenthData = await sendCommand(ReadBlock(liftCardSectionStart + 20));
    const seventeenthData = await sendCommand(ReadBlock(liftCardSectionStart + 21));
    const eighteenthData = await sendCommand(ReadBlock(liftCardSectionStart + 22));
    console.log('res: ', firstData);
    console.log('res: ', secondData);
    console.log('res: ', thirdData);
    if ((firstData as CardIdRes).result === 'SUCCESS') {
      // 调接口解析命令
      const res = await protocoltransitionRead({
        doorProtocolTransitionVo: {
          firstBlock: (firstData as CardIdRes).id?.join(''),
          secondBlock: (secondData as CardIdRes).id?.join(''),
          thirdBlock: (thirdData as CardIdRes).id?.join(''),
        },
        ladderControlProtocolTransitionVo: {
          firstBlock: (liftFirstData as CardIdRes).id?.join(''),
          secondBlock: (liftSecondData as CardIdRes).id?.join(''),
          thirdBlock: (liftThirdData as CardIdRes).id?.join(''),
          fourthBlock: (fourthData as CardIdRes).id?.join(''),
          fifthBlock: (fifthData as CardIdRes).id?.join(''),
          sixthBlock: (sixthData as CardIdRes).id?.join(''),
          seventhBlock: (seventhData as CardIdRes).id?.join(''),
          eighthBlock: (eighthData as CardIdRes).id?.join(''),
          ninthBlock: (ninthData as CardIdRes).id?.join(''),
          tenthBlock: (tenthData as CardIdRes).id?.join(''),
          eleventhBlock: (eleventhData as CardIdRes).id?.join(''),
          twelfthBlock: (twelfthData as CardIdRes).id?.join(''),
          thirteenthBlock: (thirteenthData as CardIdRes).id?.join(''),
          fourteenthBlock: (fourteenthData as CardIdRes).id?.join(''),
          fifteenthBlock: (fifteenthData as CardIdRes).id?.join(''),
          sixteenthBlock: (sixteenthData as CardIdRes).id?.join(''),
          seventeenthBlock: (seventeenthData as CardIdRes).id?.join(''),
          eighteenthBlock: (eighteenthData as CardIdRes).id?.join(''),
        },
      });
      if (res.code === 'SUCCESS') {
        const cardDoorProtocolTransitionCmd = res.data?.cardDoorProtocolTransitionCmd || {};
        if (cardDoorProtocolTransitionCmd.num === '16777215') {
          setLoadingRead(false);
          message.success('读卡成功，暂无卡信息');
          return;
        }
        const cardLadderControlProtocolTransitionCmd =
          res.data?.cardLadderControlProtocolTransitionCmd;
        const deviceNoFloorAuths =
          cardLadderControlProtocolTransitionCmd &&
          cardLadderControlProtocolTransitionCmd.deviceNoFloorAuths;
        const authStart = insertStr(cardDoorProtocolTransitionCmd.authStart, '-');
        const authEnd = insertStr(cardDoorProtocolTransitionCmd.authEnd, '-');
        const getName = await getICcardDetails({ num: cardDoorProtocolTransitionCmd.num });
        formRef?.current?.setFieldsValue({
          num: cardDoorProtocolTransitionCmd.num,
          userName: getName?.data?.userName ? getName?.data?.userName : '无持卡人信息',
          cardClass: cardDoorProtocolTransitionCmd.cardClass,
          dateRange: `${authStart}至${authEnd}`,
          deviceNos: cardDoorProtocolTransitionCmd.deviceNos.join('、'),
          deviceNoFloorAuths:
            deviceNoFloorAuths &&
            deviceNoFloorAuths
              .map((i: any) => i.floorAuths.map((j: any) => j.floor).join('、'))
              .join('、'),
        });
        message.success('读卡成功');
      }
      setLoadingRead(false);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      closeSerial,
    };
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Space direction="horizontal" size={100}>
        <Space size={0} direction="vertical" className={styles.card}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>查看步骤</h3>
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
              <div style={{ marginBottom: '10px' }}>点击查看按钮</div>
              <Button
                type="primary"
                disabled={!serialConnect}
                loading={loadingRead}
                onClick={() => readSerial()}
              >
                查看
              </Button>
            </div>
          </Space>
        </Space>
        <Space size={0} direction="vertical" className={styles.card}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>IC卡信息</h3>
          <ProForm<{
            num: string;
            userName?: string;
            cardClass?: string;
            dateRange?: string;
            deviceNos?: string;
            deviceNoFloorAuths?: string;
          }>
            formRef={formRef}
            colon={false}
            labelCol={{
              flex: '80px',
            }}
            layout="horizontal"
            submitter={false}
            disabled
          >
            <ProFormText width="md" name="num" label="IC卡号" placeholder="请先查看IC卡信息" />
            <ProFormText width="md" name="userName" label="持卡人" placeholder="请先查看IC卡信息" />
            <ProFormRadio.Group
              name="cardClass"
              label="卡类型"
              options={[
                {
                  label: '业主卡',
                  value: 'a4',
                },
                {
                  label: '管理卡',
                  value: 'a5',
                },
              ]}
            />
            <ProFormText
              width="md"
              name="dateRange"
              label="授权期限"
              placeholder="请先查看IC卡信息"
            />
            <ProFormText width="md" name="deviceNos" label="机号" placeholder="请先查看IC卡信息" />
            <ProFormText
              width="md"
              name="deviceNoFloorAuths"
              label="楼层"
              placeholder="请先查看IC卡信息"
            />
          </ProForm>
        </Space>
      </Space>
    </div>
  );
});

export default Information;
