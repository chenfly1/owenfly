import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Radio, Space, TreeSelect } from 'antd';
import styles from './style.less';
import { Divider } from 'antd';
import { ProCard, ProFormDateRangePicker, ProFormSwitch } from '@ant-design/pro-components';
import { history, useModel } from 'umi';
import { getProjectAllList } from '@/services/mda';
import DeviceRankModal from './deviceRankModal';
import AmountTotalCard from './amountTotalCard';
import ParkingPayStaticModal from './parkingPayStaticModal';
import VehicleStatisModal from './vehicleStatisModal';
import PasshzModal from './passhzModal';
import PasshzCard from './passhzCard';
import ChannelTotalCard from './channelTotalCard';
import DeviceRateCard from './deviceRateCard';
import ParkingPayStaticCard from './parkingPayStaticCard';
import VehicleComparisonCard from './vehicleComparisonCard';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { parkingFee } from '@/services/bi';
import { useRequest } from 'ahooks';
import { orgQueryTreeList } from '@/services/auth';
import { getProjectIdsByOrg } from '@/services/security';

const loopData = (treeData: OrgListType[]): OrgListType[] => {
  return treeData.map((item) => {
    const disabled = item.state === 'BAND' ? true : false;
    if (item.children) {
      return {
        ...item,
        disabled,
        children: loopData(item.children),
      };
    }
    return {
      ...item,
      disabled,
    };
  });
};

export default () => {
  const [dates, setDates] = useState<any>([
    dayjs().format('YYYY-MM-DD') + ' 00:00:00',
    dayjs().format('YYYY-MM-DD') + ' 23:59:59',
  ]);
  const [isRate, setIsRate] = useState<number>(0);
  const [deviceRankOpen, setDeviceRankOpen] = useState<boolean>(false);
  const [deviceRankData, setDeviceRankData] = useState<Record<string, any>>({});
  const [parkingPayOpen, setParkingPayOpen] = useState<boolean>(false);
  const [parkingPayData, setParkingPayData] = useState<Record<string, any>>({});
  const [vehicleStatisOpen, setVehicleStatisOpen] = useState<boolean>(false);
  const [vehicleStatisData, setVehicleStatisData] = useState<Record<string, any>>();
  const [passhzOpen, setPasshzOpen] = useState<boolean>(false);
  const [passhzData, setPasshzData] = useState<Record<string, any>>({});
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [parkFeeData, setParkFeeData] = useState<ParkingFeeType>({});
  const [exitOrenter, setExitOrenter] = useState<'0' | '1'>('0');
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  const [orgTreeData, setOrgTreeData] = useState<OrgListType[]>();
  const [orgValue, setOrgValue] = useState<string[]>(orgBidList);

  const getTeeData = () => {
    const params = { orgBids: orgBidList };
    // 获取组织权限列表
    orgQueryTreeList({ params }).then((res) => {
      setOrgTreeData(loopData(res.data || []));
    });
  };

  const queryProjectList = async () => {
    const res = await getProjectAllList();
    const projectIdsTem = res.data.items.map((item: any) => {
      return item.bid;
    });
    setProjectIds(projectIdsTem);
    return res.data.items.map((item: any) => {
      return {
        label: item.name,
        value: item.bid,
      };
    });
  };

  const queryProjectByOrg = async (value: any) => {
    const res = await getProjectIdsByOrg({ orgBids: value });
    const projectIdsTem = res.data.map((item: any) => {
      return item.bid;
    });
    setProjectIds(projectIdsTem);
  };

  useRequest(
    async () => {
      if (projectIds.length > 0) {
        const params = {
          start: dates[0],
          end: dates[1],
          projectIds: projectIds,
        };
        const res = await parkingFee(params);
        setParkFeeData(res.data || {});
      }
    },
    {
      refreshDeps: [dates, projectIds],
    },
  );

  useEffect(() => {
    queryProjectList();
    getTeeData();
  }, []);

  const onButtonClick = (e: any) => {
    const value = e.target.value;
    let tempDatas: any = [];
    setIsRate(0);
    if (value === 'today') {
      tempDatas = [
        dayjs().format('YYYY-MM-DD') + ' 00:00:00',
        dayjs().format('YYYY-MM-DD') + ' 23:59:59',
      ];
    } else if (value === 'yesterday') {
      tempDatas = [
        dayjs().subtract(1, 'day').format('YYYY-MM-DD') + ' 00:00:00',
        dayjs().subtract(1, 'day').format('YYYY-MM-DD') + ' 23:59:59',
      ];
    } else if (value === 'lastDay30') {
      setIsRate(1);
      tempDatas = [
        dayjs().subtract(30, 'day').format('YYYY-MM-DD') + ' 00:00:00',
        dayjs().format('YYYY-MM-DD') + ' 23:59:59',
      ];
    } else if (value === 'month') {
      tempDatas = [
        dayjs().date(1).format('YYYY-MM-DD') + ' 00:00:00',
        dayjs().format('YYYY-MM-DD') + ' 23:59:59',
      ];
    } else if (value === 'year') {
      tempDatas = [
        dayjs().month(0).date(1).format('YYYY-MM-DD') + ' 00:00:00',
        dayjs().format('YYYY-MM-DD') + ' 23:59:59',
      ];
    }
    setDates(tempDatas);
  };
  const dateChange = (vals: any) => {
    const tempDatas: any = [
      vals[0].format('YYYY-MM-DD' + ' 00:00:00'),
      vals[1].format('YYYY-MM-DD' + ' 23:59:59'),
    ];
    setDates(tempDatas);
  };
  const onVechButtonClick = (e: any) => {
    console.log(e.target.value);
    setExitOrenter(e.target.value);
  };
  return (
    <PageContainer
      header={{
        title: '经营概况-多项目',
      }}
      className={styles.pageWarp}
    >
      <Divider className={styles.cusDivider} />
      <div className={styles.cusWarp}>
        <Row>
          <Col flex={'600px'}>
            <Radio.Group defaultValue="today" buttonStyle="solid" onChange={onButtonClick}>
              <Radio.Button value="today">今日</Radio.Button>
              <Radio.Button value="yesterday">昨天</Radio.Button>
              <Radio.Button value="lastDay30">近30天</Radio.Button>
              <Radio.Button value="month">本月</Radio.Button>
              <Radio.Button value="year">本年</Radio.Button>
            </Radio.Group>
          </Col>
          <Col flex="auto">
            <ProFormDateRangePicker
              fieldProps={{
                value: dates,
                onChange: dateChange,
                disabledDate: (current) => {
                  return current && current > dayjs().startOf('day');
                },
              }}
            />
          </Col>

          <Col flex="auto" style={{ display: 'flex', justifyContent: 'right' }}>
            <ProFormSwitch
              label={'多项目'}
              colon={false}
              fieldProps={{
                defaultChecked: true,
                onChange: () => {
                  history.push({
                    pathname: '/park-center/dashboard/singleProject',
                  });
                },
              }}
            />
          </Col>
          <Col
            flex="0 0 300px"
            style={{ display: 'flex', justifyContent: 'left', marginLeft: '20px' }}
          >
            <TreeSelect
              treeLine={true}
              style={{ width: '300px' }}
              multiple
              treeDefaultExpandAll={true}
              treeData={orgTreeData}
              fieldNames={{
                label: 'name',
                value: 'bid',
              }}
              treeCheckable={true}
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              placeholder="请选择组织"
              treeNodeFilterProp="name"
              value={orgValue}
              onChange={(value, node, extea) => {
                setOrgValue(value);
                queryProjectByOrg(value);
              }}
            />
          </Col>
        </Row>
        <ProCard style={{ marginTop: '10px' }} bordered split="horizontal">
          <ProCard split="vertical">
            <ProCard colSpan={'300px'} split="horizontal">
              <ProCard>
                <AmountTotalCard data={parkFeeData} isRate={isRate} />
              </ProCard>
              <ProCard>
                <ChannelTotalCard projectIds={projectIds} />
              </ProCard>
              <ProCard
                title="当前设备在线率"
                extra={
                  <a
                    onClick={() => {
                      setDeviceRankData({
                        projectIds: projectIds,
                        dates: dates,
                      });
                      setDeviceRankOpen(true);
                    }}
                  >
                    查看排名
                  </a>
                }
              >
                <DeviceRateCard dates={dates} projectIds={projectIds} />
              </ProCard>
            </ProCard>
            <ProCard
              colSpan={'40%'}
              title="临停收入统计"
              extra={
                <a
                  onClick={() => {
                    setParkingPayData({
                      projectIds,
                      dates,
                      type: '0',
                    });
                    setParkingPayOpen(true);
                  }}
                >
                  查看排名
                </a>
              }
            >
              <ParkingPayStaticCard data={parkFeeData} type="lt" isRate={isRate} />
            </ProCard>
            <ProCard
              colSpan={'40%'}
              title="月租收入统计"
              extra={
                <a
                  onClick={() => {
                    setParkingPayData({
                      projectIds,
                      dates,
                      type: '1',
                    });
                    setParkingPayOpen(true);
                  }}
                >
                  查看排名
                </a>
              }
            >
              <ParkingPayStaticCard data={parkFeeData} type="yz" isRate={isRate} />
            </ProCard>
          </ProCard>
          <ProCard split="vertical">
            <ProCard
              colSpan={'44%'}
              title="车辆统计"
              extra={
                <a
                  onClick={() => {
                    setVehicleStatisData({
                      projectIds,
                      dates,
                    });
                    setVehicleStatisOpen(true);
                  }}
                >
                  查看排名
                </a>
              }
            >
              <VehicleComparisonCard dates={dates} projectIds={projectIds} isRate={isRate} />
            </ProCard>
            <ProCard
              title="通行频次排名TOP10"
              colSpan={'56%'}
              bodyStyle={{ textAlign: 'center' }}
              extra={
                <Space>
                  <a>切换排名</a>
                  <a
                    onClick={() => {
                      setPasshzData({
                        projectIds,
                        dates,
                        type: exitOrenter,
                      });
                      setPasshzOpen(true);
                    }}
                  >
                    查看排名
                  </a>
                </Space>
              }
            >
              <Radio.Group
                defaultValue="0"
                buttonStyle="solid"
                className={styles.cusRadioGroup}
                onChange={onVechButtonClick}
              >
                <Radio.Button value="0">进场</Radio.Button>
                <Radio.Button value="1">离场</Radio.Button>
              </Radio.Group>
              <PasshzCard
                dates={dates}
                projectIds={projectIds}
                isRate={isRate}
                type={exitOrenter}
              />
            </ProCard>
          </ProCard>
        </ProCard>
      </div>
      <DeviceRankModal
        open={deviceRankOpen}
        onOpenChange={setDeviceRankOpen}
        data={deviceRankData}
      />
      <ParkingPayStaticModal
        open={parkingPayOpen}
        onOpenChange={setParkingPayOpen}
        data={parkingPayData}
      />
      <VehicleStatisModal
        open={vehicleStatisOpen}
        onOpenChange={setVehicleStatisOpen}
        data={vehicleStatisData}
      />
      <PasshzModal open={passhzOpen} onOpenChange={setPasshzOpen} data={passhzData} />
    </PageContainer>
  );
};
