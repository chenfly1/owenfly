import { ProFormInstance, ProFormText, ProFormRadio } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './idIndex.less';
import { useSyncState } from 'react-sync-state-hook';
import type { CardIdRes, ConnectResult } from '@/pages/pass-center/utils/serialUtils';
import { sendCommand, close, initSerial } from '@/pages/pass-center/utils/serialUtils';
import { LoadPassword, WriteBlock } from '@/pages/pass-center/utils/commandFn';
import {
  addPassingUser,
  getDevicenos,
  getLiftDeviceList,
  icSave,
  protocoltransition,
} from '@/services/door';
import dayjs from 'dayjs';
import ModalForm from '@/components/ModalFormCount';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

type IProps = {
  modalVisit: boolean;
  detailsData: any;
  getDetails: (id: string) => void;
  form: any;
  formNext: any;
  icCardNum: string;
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
  form,
  formNext,
  detailsData,
  getDetails,
  deviceConfig,
  icCardNum,
  onOpenChange,
}) => {
  const formRef = useRef<ProFormInstance>();
  const [serialConnect, setSerialConnect, serialbool] = useSyncState<boolean>(false);
  const [icLoading, setIcLoading] = useState<boolean>(false);
  const [loadingSerial, setLoadingSerial] = useState<boolean>(false);
  // 梯控数据
  const [eleList, setEleList] = useState<any[]>([]);

  const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);

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

  // 获取电梯和楼层
  const getLiftList = async (passingAreaIds: any[]) => {
    if (!passingAreaIds.length) return;
    const res = await getLiftDeviceList({
      passingAreaIds: passingAreaIds.map((i: any) => i.passingAreaId),
    });
    setEleList(res.data);
  };

  useEffect(() => {
    if (!modalVisit) closeSerial();
  }, [modalVisit]);

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.setFieldsValue({
        icCardNum: detailsData?.icCardNum,
      });
      console.log(detailsData);
      console.log(formRef?.current?.getFieldsValue());
      // if (detailsData?.elevator) getLiftList(detailsData?.userPassingAreaLinks || []);
    }
  }, [detailsData, modalVisit]);

  // 保存用户信息
  const saveUserMsg = async (values: Record<string, any>) => {
    try {
      console.log(values);
      const icCardClass = formRef.current?.getFieldValue('icCardClass');
      values.icCardClass = icCardClass;
      // 员工、客户禁止编辑通行区域
      let disabledIds: any[] = [];
      if (detailsData?.userPassingAreaLinks) {
        disabledIds = detailsData?.userPassingAreaLinks
          .filter((i: any) => i.isAutoSync === 1)
          .map((i: any) => i.passingAreaId);
      }
      values.userPassingAreaLinks = values.passingAreaIds.map((i: any) => {
        return {
          passingAreaId: i,
          isAutoSync: disabledIds.includes(i) ? 1 : 0, // 是否自动同步标识 1是，0否 默认0
        };
      });
      const buildingNumDataObj = values.buildingNumDataObj;
      if (buildingNumDataObj) {
        const keys = Object.keys(buildingNumDataObj);
        values.buildingNums = keys.map((key) => {
          if (buildingNumDataObj[key] && buildingNumDataObj[key].length) {
            return {
              deviceId: key,
              floorNumber: buildingNumDataObj[key].map((floorNumber: any) => floorNumber).join(','),
            };
          }
        });
      } else {
        values.buildingNums = [];
      }
      const formObj = formNext?.current?.getFieldsValue?.();
      console.log(values, formObj);
      if (values.periodId && values.periodId.length) {
        // 汉王认证
        const obj = periodList?.value?.filter((i: any) => i.id === values.periodId[0]);
        values.authStart = obj && obj[0]?.validDateStart;
        values.authEnd = obj && obj[0]?.validDateEnd;
      } else {
        values.authStart = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        values.authEnd = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }
      const res = await addPassingUser({
        ...detailsData,
        ...values,
        periodIds: values?.periodId?.join(','),
        ...formObj,
      });
      getDetails(detailsData?.id);
    } catch {
      // console.log
    }
  };

  // 保存IC卡信息
  const saveICmsg = async (deviceNos: number[], deviceNoFloorAuths: any) => {
    const fromData = form?.current?.getFieldsValue?.();
    const icCardClass = formRef.current?.getFieldValue('icCardClass');
    console.log(fromData);
    let obj: any = [];
    let authStart;
    let authEnd;
    if (fromData.periodId && fromData.periodId.length) {
      // 汉王认证
      obj = periodList?.value?.filter((i: any) => i.id === fromData.periodId[0]);
      authStart = obj && obj[0]?.validDateStart;
      authEnd = obj && obj[0]?.validDateEnd;
    } else {
      authStart = fromData.dateRange[0];
      authEnd = fromData.dateRange[1];
    }
    try {
      const res = await icSave({
        userId: detailsData?.id,
        cardSectionStart: deviceConfig?.cardSectionStart,
        cardPwd: deviceConfig?.cardPwd,
        userPhone: fromData.phone,
        authStart: authStart,
        authEnd: authEnd,
        doorOpenTimes: ['00002359'],
        num: detailsData?.icCardNum,
        deviceNos: deviceNos,
        deviceNoFloorAuths,
        cardClass: icCardClass,
        passingAreas: fromData.passingAreaIds.map((i: any) => ({ passingAreaId: i })),
      });
      if (res.code === 'SUCCESS') {
        saveUserMsg(fromData);
        message.success('写卡成功');
      }
    } catch {
      // console.log
    }
  };

  // 梯控写卡
  const eleWriteSerial = async (
    ladderControlProtocolTransitionVo: any,
    deviceNoFloorAuths: any,
    deviceNos: number[],
  ) => {
    let cardSectionStart = (Number(deviceConfig?.cardSectionStart) + 2) * 4;
    const blokKeys = [
      'firstBlock',
      'secondBlock',
      'thirdBlock',
      'fourthBlock',
      'fifthBlock',
      'sixthBlock',
      'seventhBlock',
      'eighthBlock',
      'ninthBlock',
      'tenthBlock',
      'eleventhBlock',
      'twelfthBlock',
      'thirteenthBlock',
      'fourteenthBlock',
      'fifteenthBlock',
      'sixteenthBlock',
      'seventeenthBlock',
      'eighteenthBlock',
      'nineteenthBlock',
    ];
    const commandList = blokKeys.map((item, index) => {
      if (index % 3 === 0 && index !== 0) {
        cardSectionStart++;
      }
      console.log('块区', cardSectionStart);
      if (ladderControlProtocolTransitionVo[item]) {
        return WriteBlock([
          cardSectionStart++,
          ...HexStringToBytes(
            ladderControlProtocolTransitionVo[item] || 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          ),
        ]);
      }
    });

    console.log(commandList);
    const result: any = [];

    for (let i = 0; i < commandList.length; i++) {
      if (commandList[i]) result[i] = await sendCommand(commandList[i] as any);
    }

    setIcLoading(false);
    if (result[0].result === 'SUCCESS' && result[1].result === 'SUCCESS') {
      saveICmsg(deviceNos, deviceNoFloorAuths);
    } else {
      message.error('未识别到卡片');
    }
  };

  // IC卡写卡
  const icWriteSerial = async (
    doorProtocolTransitionVo: any,
    ladderControlProtocolTransitionVo: any,
    deviceNoFloorAuths: any,
    deviceNos: number[],
  ) => {
    const cardSectionStart = (deviceConfig?.cardSectionStart as number) * 4;
    const firstBlock = WriteBlock([
      cardSectionStart,
      ...HexStringToBytes(doorProtocolTransitionVo.firstBlock),
    ]);
    const secondBlock = WriteBlock([
      cardSectionStart + 1,
      ...HexStringToBytes(doorProtocolTransitionVo.secondBlock),
    ]);
    const thirdBlock = WriteBlock([
      cardSectionStart + 2,
      ...HexStringToBytes(doorProtocolTransitionVo.thirdBlock),
    ]);
    const cardSectionStartNext = ((deviceConfig?.cardSectionStart as number) + 1) * 4;
    const firstBlockNext = WriteBlock([
      cardSectionStartNext,
      ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
    ]);
    const secondBlockNext = WriteBlock([
      cardSectionStartNext + 1,
      ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
    ]);
    const thirdBlockNext = WriteBlock([
      cardSectionStartNext + 2,
      ...HexStringToBytes('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
    ]);
    console.log(secondBlock);
    console.log(thirdBlock);
    setIcLoading(true);
    const firstData = await sendCommand(firstBlock);
    if ((firstData as CardIdRes).result !== 'SUCCESS') {
      setIcLoading(false);
      return message.error('未识别到卡片');
    }
    const secondData = await sendCommand(secondBlock);
    const thirdData = await sendCommand(thirdBlock);
    await sendCommand(firstBlockNext);
    await sendCommand(secondBlockNext);
    await sendCommand(thirdBlockNext);
    // 写梯控卡
    if (ladderControlProtocolTransitionVo && ladderControlProtocolTransitionVo.secondBlock) {
      eleWriteSerial(ladderControlProtocolTransitionVo, deviceNoFloorAuths, deviceNos);
    } else {
      setIcLoading(false);
      if (
        (firstData as CardIdRes).result === 'SUCCESS' &&
        (secondData as CardIdRes).result === 'SUCCESS' &&
        (thirdData as CardIdRes).result === 'SUCCESS'
      ) {
        saveICmsg(deviceNos, deviceNoFloorAuths);
      } else {
        message.error('未识别到卡片');
      }
    }
  };

  // 写卡
  const writeSerial = async () => {
    const fromData = form?.current?.getFieldsValue?.();
    let eleData: any = [];
    if (fromData?.passingAreaIds.length) {
      const res = await getLiftDeviceList({
        passingAreaIds: fromData?.passingAreaIds.map((i: any) => i),
      });
      eleData = res.data;
      setEleList(res.data);
    }
    console.log(fromData);
    const icCardClass = formRef.current?.getFieldValue('icCardClass');
    const cardClass = icCardClass === 1 ? 'A5' : 'A4';
    let dateRange1;
    let dateRange2;
    if (fromData.periodId && fromData.periodId.length) {
      // 汉王认证
      const obj = periodList?.value?.filter((i: any) => i.id === fromData.periodId[0]);
      dateRange1 = obj && obj[0]?.validDateStart.split('-');
      dateRange2 = obj && obj[0]?.validDateEnd.split('-');
    } else {
      dateRange1 = fromData.dateRange[0].split('-');
      dateRange2 = fromData.dateRange[1].split('-');
    }
    // 门禁通行区域的设备机号
    let deviceNos: number[] = [];
    // 梯控通行区域设备机号
    let deviceNoFloorAuths: any[] = [];
    if (icCardClass === 1) {
      // 管理卡
      deviceNos = [1];

      if (fromData?.elevator) {
        console.log(eleList);
        deviceNoFloorAuths = eleData?.map((i: any) => ({
          deviceNo: 1,
          floorAuths:
            i.floorNumberList &&
            i.floorNumberList.map((j: true) => ({
              floor: Number(j),
              isFront: true,
            })),
        }));
      }
    } else {
      const passingAreaIds = fromData.passingAreaIds.map((i: any) => i) || [];
      const devRes = await getDevicenos({
        passingAreaIds: passingAreaIds,
      });
      if (devRes.code !== 'SUCCESS') return message.error('门禁无IC卡设备，无法写卡');
      if (devRes.code === 'SUCCESS' && !devRes.data.length)
        return message.error('门禁无IC卡设备，无法写卡');
      deviceNos = Array.from(new Set(devRes.data.map((i: any) => i.deviceNo)));

      if (fromData?.elevator) {
        console.log(detailsData);
        const keys: any = [];
        for (const i in fromData?.buildingNumDataObj) {
          console.log(i, fromData?.buildingNumDataObj[i]); //i是键名，obj[i]是键值
          if (fromData?.buildingNumDataObj[i]) keys.push(i);
        }
        const buildingNumDataObj = fromData.buildingNumDataObj || {};
        const filterEleList = eleData.filter((i: any) => keys.includes(i.id));
        console.log(keys);
        console.log(eleData);
        console.log(filterEleList);
        if (filterEleList.some((i: any) => !i.doorDevice))
          return message.error('梯控无IC卡设备，无法写卡');
        deviceNoFloorAuths = filterEleList.map((i: any) => ({
          deviceNo: i.doorDevice && i.doorDevice.deviceNo,
          floorAuths: buildingNumDataObj[i.id]
            .map((floorNumber: any) => floorNumber)
            .map((j: true) => ({
              floor: Number(j),
              isFront: true,
            })),
        }));
      }
    }

    const proParams: any = {
      // ic卡数据
      cardDoorProtocolTransitionCmd: {
        num: detailsData?.icCardNum,
        authStart: dateRange1[0].slice(2) + '' + dateRange1[1] + dateRange1[2],
        authEnd: dateRange2[0].slice(2) + '' + dateRange2[1] + dateRange2[2],
        doorOpenTime: '00002359',
        deviceNos: deviceNos,
        cardClass: cardClass,
      },
    };

    if (fromData?.elevator) {
      // 梯控数据
      proParams.cardLadderControlProtocolTransitionCmd = {
        num: detailsData?.icCardNum,
        authStart: dateRange1[0].slice(2) + '' + dateRange1[1] + dateRange1[2],
        authEnd: dateRange2[0].slice(2) + '' + dateRange2[1] + dateRange2[2],
        doorOpenTime: '00002359',
        cardClass: cardClass,
        deviceNoFloorAuths,
      };
    }

    // 生成命令
    const resd = await protocoltransition(proParams);
    if (resd.code !== 'SUCCESS') return message.error('写卡命令解析有误');
    console.log(HexStringToBytes(resd.data.doorProtocolTransitionVo.firstBlock));
    icWriteSerial(
      resd.data.doorProtocolTransitionVo,
      resd.data.ladderControlProtocolTransitionVo,
      deviceNoFloorAuths,
      deviceNos,
    );
  };

  return (
    <ModalForm
      title="IC卡信息录入"
      width={600}
      formRef={formRef}
      layout="horizontal"
      open={modalVisit}
      onOpenChange={onOpenChange}
      className={styles.modalForm}
      modalProps={{
        centered: true,
        maskClosable: false,
        onCancel: () => {
          if (detailsData?.icCard?.status) {
            onSubmit(formRef.current?.getFieldsValue?.());
          }
          onOpenChange(false);
        },
      }}
      submitter={{
        render: () => {
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  if (detailsData?.icCard?.status) {
                    onSubmit(formRef.current?.getFieldsValue?.());
                  }
                  onOpenChange(false);
                }}
              >
                完成
              </Button>
            </Space>
          );
        },
      }}
    >
      <Space size={0} direction="vertical" className={styles.icidform}>
        <ProFormRadio.Group
          name="icCardClass"
          colon={true}
          initialValue={2}
          label="IC卡类型"
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
          <div>将IC卡放置于读卡器上</div>
        </Space>
        <Space align="start" className={styles.stepBoxAfter}>
          <div className={styles.step}>4</div>
          <div className={styles.formItem}>
            <div style={{ marginBottom: '10px' }}>点击写卡按钮，将IC卡信息写进卡中</div>
            <Space>
              <ProFormText name="icCardNum" width="md" disabled placeholder="请读取IC卡号" />
              <Button
                type="primary"
                loading={icLoading}
                onClick={writeSerial}
                disabled={!serialConnect}
                ghost
              >
                写卡
              </Button>
            </Space>
          </div>
        </Space>
      </Space>
    </ModalForm>
  );
};

export default BatchFace;
