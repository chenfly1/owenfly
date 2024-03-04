import { Button, Space, message } from 'antd';
import { ProFormText } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import React, { useEffect, useRef, useState } from 'react';
import type { CardIdRes, ConnectResult } from '@/pages/pass-center/utils/serialUtils';
import { sendCommand } from '@/pages/pass-center/utils/serialUtils';
import { initSerial, close } from '@/pages/pass-center/utils/serialUtils';
import {
  addPassingUser,
  getDevicenos,
  icSave,
  protocoltransition,
  queryDeviceConfig,
} from '@/services/door';
import { LoadPassword, WriteBlock } from '@/pages/pass-center/utils/commandFn';
import styles from './style.less';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';
import Modal from '@/components/ModalCount';
import { useModel } from 'umi';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const HexStringToBytes = (str: string) => {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }
  return bytes;
};

const BatchBindingCardModal: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const actionRef = useRef<ActionType>();
  const [dataDetails, setDataDetails] = useState<DoorICcardListType[]>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>();
  const [serialConnect, setSerialConnect] = useState<boolean>(false);
  const [serialName, setSerialName] = useState<string>();
  const [loadingSerial, setLoadingSerial] = useState<boolean>(false);
  const [deviceConfig, setDeviceConfig] = useState<{ cardSectionStart: number; cardPwd: string }>();
  const { initialState } = useModel('@@initialState');
  const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);
  const [countShow] = useState<boolean>(
    initialState?.currentUser?.userName === '公安三所认证租户管理员',
  );
  // 初始化串口
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
          setLoadingSerial(false);
          if ((pwdData as CardIdRes).result === 'SUCCESS') {
            setSerialName(portInfo);
            setSerialConnect(true);
            message.success('连接成功');
          } else {
            close();
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
    if (serialConnect) close();
    setSerialName('');
    setSerialConnect(false);
  };
  useEffect(() => {
    queryDeviceConfig().then((res) => {
      setDeviceConfig(res.data);
    });
  }, []);
  useEffect(() => {
    setEditableRowKeys(data?.map((item: any) => item.id));
    setDataDetails(
      (data as any).map((i: any) => ({
        ...i,
        buildingNumsText:
          i.buildingNums &&
          i.buildingNums
            .map((j: any) => {
              return `${j.deviceName}-${
                j.floorNumber &&
                j.floorNumber
                  .split(',')
                  .map((k: any) => `${k}层`)
                  .join('、')
              }`;
            })
            .join('，'),
        time: `${i.authStart}至${i.authEnd}`,
        dateRange: [i.authStart, i.authEnd],
      })),
    );
  }, [data]);

  const onFinish = async (
    values: Record<string, any>,
    deviceNos: number[],
    deviceNoFloorAuths: any,
  ) => {
    try {
      console.log(values);
      const res = await icSave({
        userId: values?.id,
        cardSectionStart: deviceConfig?.cardSectionStart,
        cardPwd: deviceConfig?.cardPwd,
        userPhone: values.phone.key,
        authStart: values.authStart,
        authEnd: values.authEnd,
        doorOpenTimes: ['00002359'],
        num: values.icCardNum,
        deviceNoFloorAuths,
        deviceNos,
        cardClass: values.icCard && values.icCard.cardClass,
        passingAreas: values.userPassingAreaLinks
          .map((i: any) => i.passingAreaId)
          .map((i: any) => ({ passingAreaId: i })),
      });
      if (res.code === 'SUCCESS') {
        message.success('写卡成功');
      }
    } catch {
      // console.log
    }
  };

  // 梯控写卡
  const eleWriteSerial = async (
    values: any,
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

    if (result[0].result === 'SUCCESS' && result[1].result === 'SUCCESS') {
      onFinish(values, deviceNos, deviceNoFloorAuths);
    } else {
      message.error('未识别到卡片');
    }
  };

  // IC卡写卡
  const icWriteSerial = async (
    values: any,
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
    const firstData = await sendCommand(firstBlock);
    if ((firstData as CardIdRes).result !== 'SUCCESS') {
      return message.error('未识别到卡片');
    }
    const secondData = await sendCommand(secondBlock);
    const thirdData = await sendCommand(thirdBlock);
    await sendCommand(firstBlockNext);
    await sendCommand(secondBlockNext);
    await sendCommand(thirdBlockNext);
    // 写梯控卡
    if (ladderControlProtocolTransitionVo.secondBlock) {
      eleWriteSerial(values, ladderControlProtocolTransitionVo, deviceNoFloorAuths, deviceNos);
    } else {
      if (
        (firstData as CardIdRes).result === 'SUCCESS' &&
        (secondData as CardIdRes).result === 'SUCCESS' &&
        (thirdData as CardIdRes).result === 'SUCCESS'
      ) {
        onFinish(values, deviceNos, deviceNoFloorAuths);
      } else {
        message.error('未识别到卡片');
      }
    }
  };

  // 写卡
  const writeSerial = async (values: Record<string, any>) => {
    if (!serialConnect) {
      message.error('请先连接读卡器');
      return;
    }
    const dateRange1 = values.authStart.split('-');
    const dateRange2 = values.authEnd.split('-');
    const cardClass = values.icCard && values.icCard.cardClass === 1 ? 'A5' : 'A4';
    // 通行区域的设备机号
    let deviceNos: number[] = [];
    // 梯控通行区域设备机号
    let deviceNoFloorAuths: any[] = [];
    // 管理卡
    if (values.icCard.cardClass === 1) {
      // 门禁机号
      deviceNos = [1];

      // 梯控机号
      deviceNoFloorAuths = [
        {
          deviceNo: 1,
          floorAuths: [
            {
              floor: 1,
              isFront: true,
            },
          ],
        },
      ];
    } else {
      const devRes = await getDevicenos({
        passingAreaIds: values.userPassingAreaLinks.map((i: any) => i.passingAreaId),
      });
      if (devRes.code !== 'SUCCESS') return message.error('无IC卡设备，无法写卡');
      if (devRes.code === 'SUCCESS' && !devRes.data.length)
        return message.error('无IC卡设备，无法写卡');
      deviceNos = Array.from(new Set(devRes.data.map((i: any) => i.deviceNo)));

      const buildingNums = values.buildingNums;
      if (buildingNums) {
        buildingNums.map((i: any) => {
          if (devRes.data.map((j: any) => j.deviceId).includes(i.deviceId)) {
            deviceNoFloorAuths.push({
              deviceNo: (devRes.data.filter((o: any) => o.deviceId === o.deviceId)[0] as any)
                .deviceNo,
              floorAuths:
                i.floorNumber &&
                i.floorNumber.split(',').map((j: any) => ({ floor: Number(j), isFront: true })),
            });
          }
        });
      }
    }
    const resd = await protocoltransition({
      // 门禁数据
      cardDoorProtocolTransitionCmd: {
        num: values.icCardNum,
        authStart: dateRange1[0].slice(2) + '' + dateRange1[1] + dateRange1[2],
        authEnd: dateRange2[0].slice(2) + '' + dateRange2[1] + dateRange2[2],
        doorOpenTime: '00002359',
        deviceNos: deviceNos,
        cardClass: cardClass,
      },
      // 梯控数据
      cardLadderControlProtocolTransitionCmd: {
        num: values.icCardNum,
        authStart: dateRange1[0].slice(2) + '' + dateRange1[1] + dateRange1[2],
        authEnd: dateRange2[0].slice(2) + '' + dateRange2[1] + dateRange2[2],
        doorOpenTime: '00002359',
        cardClass: cardClass,
        deviceNoFloorAuths,
      },
    });
    icWriteSerial(
      values,
      resd.data.doorProtocolTransitionVo,
      resd.data.ladderControlProtocolTransitionVo,
      deviceNoFloorAuths,
      deviceNos,
    );
  };
  const columns: ProColumns<DoorICcardListType>[] = [
    {
      title: '人员姓名',
      dataIndex: 'name',
      ellipsis: true,
      readonly: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      ellipsis: true,
      readonly: true,
      renderText(_, record) {
        return <DataMasking key={record.phone} text={record.phone} />;
      },
    },
    {
      title: '通行区域',
      dataIndex: 'passingArea',
      ellipsis: true,
      readonly: true,
    },
    {
      title: '授权周期',
      dataIndex: 'periodId',
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
      },
      search: false,
      hideInTable: !countShow,
      ellipsis: true,
      request: async () => {
        return periodList?.value as any;
      },
    },
    {
      title: '授权期限',
      dataIndex: 'time',
      ellipsis: true,
      readonly: true,
    },
    {
      title: '卡号',
      dataIndex: 'icCardNum',
      readonly: true,
      ellipsis: true,
    },
    {
      title: '是否为管理卡',
      dataIndex: ['icCard', 'cardClass'],
      valueType: 'select',
      readonly: true,
      ellipsis: true,
      valueEnum: {
        1: {
          text: '是',
        },
        2: {
          text: '否',
        },
      },
    },
    {
      title: '通行楼层',
      dataIndex: 'buildingNumsText',
      readonly: true,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 60,
      dataIndex: 'option',
      // valueType: 'option',
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'view',
                text: '写卡',
                onClick() {
                  writeSerial(record);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title="批量绑定IC卡"
      width="70%"
      open={open}
      centered
      afterClose={closeSerial}
      onCancel={() => {
        onSubmit();
        onOpenChange(false);
      }}
      className={styles.TableStyle}
      footer={[
        <Button
          key="back"
          type="primary"
          onClick={() => {
            onSubmit();
            onOpenChange(false);
          }}
        >
          完成
        </Button>,
      ]}
    >
      <div style={{ fontWeight: 'bold' }}>批量绑定流程</div>
      <div className={styles.stepFlex}>
        <Space className={styles.stepBox}>
          <div className={styles.step}>1</div>
          <div>将读卡器设备连接至电脑</div>
        </Space>
        <Space align="start" className={styles.formItem}>
          <div className={styles.step}>2</div>
          <div>选择串口信息</div>
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
          <ProFormText
            name="serialName"
            disabled
            fieldProps={{
              value: serialName,
            }}
            width="md"
            placeholder="选择串口信息"
          />
        </Space>
        <Space className={styles.stepBox}>
          <div className={styles.step}>3</div>
          <div>逐一将IC卡放置于读卡器上，点击写卡按钮，将对应信息写进IC卡中</div>
        </Space>
      </div>
      <ProTable<DoorICcardListType>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        // cardBordered
        dataSource={dataDetails}
        scroll={{ y: 500 }}
        search={false}
        // editable={{
        //   type: 'multiple',
        //   // 行编辑按钮去掉删除，只显示保存和取消
        //   actionRender: (row, config, dom) => [dom.save],
        //   editableKeys,
        //   saveText: '写卡',
        //   onSave: writeSerial as any,
        // }}
        // recordCreatorProps={false}
        options={false}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default BatchBindingCardModal;
