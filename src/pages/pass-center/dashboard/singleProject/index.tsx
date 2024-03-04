import { PageContainer } from '@ant-design/pro-layout';
import { Radio, Space } from 'antd';
import styles from './style.less';
import { Divider } from 'antd';
import { ProCard, ProFormSwitch } from '@ant-design/pro-components';
import { history } from 'umi';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  getDevicesCount,
  getPassRecordCount,
  getUserAuthCount,
  getVistorCount,
} from '@/services/bi';
import { useRequest } from 'ahooks';
import DevicesPreChartCard from './devicesPreChartCard';
import PassPreChartCard from './passPreChartCard';
import AuthLineChartCard from './authLineChartCard';
import PassLineChartCard from './passLineChartCard';
import { CompareIndicator, Indicator } from '@/components/StatisticCard';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [deviceTalData, setDeviceTalData] = useState<Record<string, any>>({ total: 0, rate: '0' });
  const [passTalData, setPassTalData] = useState<number>(0);
  const [vistorTalData, setVistorTalData] = useState<Record<string, any>>({
    today: 0,
    todayVisited: 0,
    rate: 0,
  });
  const [userAuth, setUserAuthTalData] = useState<Record<string, any>>({ today: 0, rate: 0 });
  const [qryType, setQryType] = useState<string>('day');
  const [passType, setPassType] = useState<string>('today');

  useRequest(async () => {
    const res = await getDevicesCount({
      projectIds: [project.bid],
    });
    if (res.code === 'SUCCESS') {
      setDeviceTalData(res.data);
    }
    const res2 = await getPassRecordCount({
      projectIds: [project.bid],
    });
    if (res2.code === 'SUCCESS') {
      setPassTalData(res2.data);
    }
    const res3 = await getVistorCount({
      projectIds: [project.bid],
    });
    if (res3.code === 'SUCCESS') {
      setVistorTalData(res3.data);
    }
    const res4 = await getUserAuthCount({
      projectIds: [project.bid],
    });
    if (res4.code === 'SUCCESS') {
      setUserAuthTalData(res4.data);
    }
  });
  const userTimeClick = (e: any) => {
    console.log(e);
    const value = e.target.value;
    setQryType(value);
  };
  const onButtonClick = (e: any) => {
    const value = e.target.value;
    setPassType(value);
  };
  return (
    <PageContainer
      header={{
        title: '经营概况-当前项目',
      }}
      extra={[
        <ProFormSwitch
          label={'多项目'}
          key="multiplProject"
          colon={false}
          fieldProps={{
            onChange: () => {
              history.push({
                pathname: '/pass-center/dashboard/multiplProject',
              });
            },
          }}
        />,
      ]}
      className={styles.pageWarp}
    >
      <Divider className={styles.cusDivider} />
      <div className={styles.cusWarp}>
        <ProCard style={{ marginTop: '10px' }} bordered split="horizontal">
          <ProCard split="vertical">
            <ProCard colSpan={'25%'}>
              <Indicator
                label="设备总数"
                value={deviceTalData.total}
                unit="台"
                size="large"
                labelStyle={{ fontWeight: 'bold' }}
              />
              <CompareIndicator
                label="设备在线率"
                value={deviceTalData.rate + '%'}
                direction={deviceTalData.rate >= 0 ? 'top' : 'down'}
              />
            </ProCard>
            <ProCard colSpan={'25%'}>
              <Indicator
                label="今日通行总量"
                value={passTalData}
                unit="次"
                size="large"
                labelStyle={{ fontWeight: 'bold' }}
              />
              {/* <CompareIndicator
                label="较昨日"
                value={50 + '%'}
                direction={50 >= 0 ? 'top' : 'down'}
              /> */}
            </ProCard>
            <ProCard colSpan={'25%'}>
              <Indicator
                label="今日访客总数"
                value={vistorTalData.today}
                unit="人次"
                size="large"
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Space direction="horizontal" size={50}>
                <CompareIndicator
                  label="较昨日"
                  value={vistorTalData.rate + '%'}
                  direction={vistorTalData.rate >= 0 ? 'top' : 'down'}
                />
                <div className={styles.vistorColr}>已到访：{vistorTalData.todayVisited}人</div>
              </Space>
            </ProCard>
            <ProCard colSpan={'25%'}>
              <Indicator
                label="授权人数"
                value={userAuth.today}
                unit="人"
                size="large"
                labelStyle={{ fontWeight: 'bold' }}
              />
              <CompareIndicator
                label="较昨日"
                value={userAuth.rate + '%'}
                direction={userAuth.rate >= 0 ? 'top' : 'down'}
              />
            </ProCard>
          </ProCard>
          <ProCard split="vertical">
            <ProCard
              colSpan={'65%'}
              title="人员授权趋势分析"
              extra={
                <Radio.Group defaultValue="day" buttonStyle="solid" onChange={userTimeClick}>
                  <Radio.Button value="day">近30天</Radio.Button>
                  <Radio.Button value="month">近一年</Radio.Button>
                </Radio.Group>
              }
            >
              <AuthLineChartCard qryType={qryType} projectIds={[project.bid]} />
            </ProCard>
            <ProCard colSpan={'35%'} title="当前设备类型占比">
              <DevicesPreChartCard projectIds={[project.bid]} />
            </ProCard>
          </ProCard>
          <ProCard split="vertical">
            <ProCard
              title="人员通行频次趋势分析"
              colSpan={'65%'}
              extra={
                <Radio.Group defaultValue="today" buttonStyle="solid" onChange={onButtonClick}>
                  <Radio.Button value="today">今日</Radio.Button>
                  <Radio.Button value="lastDay30">近30天</Radio.Button>
                </Radio.Group>
              }
            >
              <PassLineChartCard passType={passType} projectIds={[project.bid]} />
            </ProCard>
            <ProCard
              title={
                <>
                  通行方式占比
                  <span style={{ color: '#616577' }}>
                    （昨日{dayjs().subtract(1, 'day').format('MM-DD')}）
                  </span>
                </>
              }
              colSpan={'35%'}
            >
              <PassPreChartCard projectIds={[project.bid]} />
            </ProCard>
          </ProCard>
        </ProCard>
      </div>
    </PageContainer>
  );
};
