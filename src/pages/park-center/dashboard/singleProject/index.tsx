import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Radio, Switch } from 'antd';
import styles from './style.less';
import { Divider } from 'antd';
import {
  ProCard,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { parkYardListByPage } from '@/services/park';
import { history } from 'umi';
import { useState } from 'react';
import dayjs from 'dayjs';
import ChannelTotalCard from './channelTotalCard';
import AmountTotalCard from './amountTotalCard';
import DeviceRateCard from './deviceRateCard';
import ParkingPayStaticCard from './parkingPayStaticCard';
import VehicleComparisonCard from './vehicleComparisonCard';
import VehiclTtrafficCard from './vehiclTtrafficCard';
import DeviceRankModal from './deviceRankModal';
import { parkingFee } from '@/services/bi';
import { useRequest } from 'ahooks';

export default () => {
  const [dates, setDates] = useState<any>([
    dayjs().format('YYYY-MM-DD') + ' 00:00:00',
    dayjs().format('YYYY-MM-DD') + ' 23:59:59',
  ]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [deviceRankOpen, setDeviceRankOpen] = useState<boolean>(false);
  const [deviceRankData, setDeviceRankData] = useState<Record<string, any>>({});
  const [parkFeeData, setParkFeeData] = useState<ParkingFeeType>({});
  const [parkIds, setParkIds] = useState<string[]>([]);
  const [parkIds2, setParkIds2] = useState<string[]>([]);
  const [isRate, setIsRate] = useState<number>(0);

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      projectId: project.bid,
      pageSize: 1000,
      pageNo: 1,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };
  useRequest(
    async () => {
      const params = {
        start: dates[0],
        end: dates[1],
        projectIds: [project.bid],
        isRate,
      };
      const res = await parkingFee(params);
      setParkFeeData(res.data || {});
    },
    {
      refreshDeps: [dates, isRate],
    },
  );
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
  return (
    <PageContainer
      header={{
        title: '经营概况-单项目',
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
                onChange: () => {
                  history.push({
                    pathname: '/park-center/dashboard/multiplProject',
                  });
                },
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
                <ChannelTotalCard />
              </ProCard>
              <ProCard
                title="当前设备在线率"
                // extra={
                //   <a
                //     onClick={() => {
                //       setDeviceRankOpen(true);
                //       setDeviceRankData({
                //         projectIds: [project.bid],
                //         dates: dates,
                //       });
                //     }}
                //   >
                //     查看排名
                //   </a>
                // }
              >
                <DeviceRateCard dates={dates} projectIds={[project.bid]} />
              </ProCard>
            </ProCard>
            <ProCard colSpan={'40%'} title="临停收入统计">
              <ParkingPayStaticCard data={parkFeeData} type="lt" isRate={isRate} />
            </ProCard>
            <ProCard colSpan={'40%'} title="月租收入统计">
              <ParkingPayStaticCard data={parkFeeData} type="yz" isRate={isRate} />
            </ProCard>
          </ProCard>
          <ProCard split="vertical">
            <ProCard
              colSpan={'44%'}
              title="车辆对比"
              extra={
                <ProFormCheckbox.Group
                  name="park"
                  fieldProps={{
                    value: parkIds,
                    onChange: (val: any) => {
                      setParkIds(val);
                    },
                  }}
                  request={queryParkList}
                />
              }
            >
              <VehicleComparisonCard
                dates={dates}
                projectIds={[project.bid]}
                parkIds={parkIds}
                isRate={isRate}
              />
            </ProCard>
            <ProCard
              title="车辆通行指标"
              colSpan={'56%'}
              extra={
                <ProFormCheckbox.Group
                  name="park"
                  fieldProps={{
                    value: parkIds2,
                    onChange: (val: any) => {
                      setParkIds2(val);
                    },
                  }}
                  request={queryParkList}
                />
              }
            >
              <VehiclTtrafficCard
                dates={dates}
                projectIds={[project.bid]}
                parkIds={parkIds2}
                isRate={isRate}
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
    </PageContainer>
  );
};
