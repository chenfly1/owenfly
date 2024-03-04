import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import {
  ProCard,
  ProForm,
  ProFormDateRangePicker,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { history } from 'umi';
import { defaultColors } from '@/components/StatisticCard/Chart/config';
import { BarChart } from '@/components/StatisticCard';
import { Button, Col, Row } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useEffect, useRef, useState } from 'react';
import { insTreeDetailById } from '@/services/energy';

type DataLinksType = {
  source: string;
  target: string;
  value: number;
};
let dataList: InsTreeDetailType[] = [];
let dataLinks: DataLinksType[] = [];
const TableList: React.FC = () => {
  const query = history.location.query;
  const insId = query?.id || '';
  const formRef = useRef<ProFormInstance>();
  const formRef2 = useRef<ProFormInstance>();
  // const [detail, setDetail] = useState<InsTreeDetailType>();
  const [yData, setYData] = useState<string[]>([]);
  const [xData, setXData] = useState<number[]>([]);
  const [sData, setSData] = useState<{ name: string }[]>([]);
  const [sLinks, setSLinks] = useState<DataLinksType[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const generateList = (data: any[], level = 0) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      dataList.push({ ...node, level });
      if (i === data.length - 1) {
        const levelTem = level + 1;
        if (node.children) generateList(node.children, levelTem);
      } else {
        if (node.children) generateList(node.children, level);
      }
    }
  };

  const generateLinks = () => {
    for (let i = 0; i < dataList.length; i++) {
      const node = dataList[i];
      if (node.children) {
        dataLinks.push(
          ...node.children.map((item) => ({
            source: node.insName,
            target: item.insName,
            value: item.currPeriod.readOfTotal,
          })),
        );
      }
    }
  };
  const setDetail = (detail: any) => {
    generateList([detail]);
    generateLinks();
    // console.log(dataLinks);
    // setDetail(res);
    // const detail = res;
    formRef2.current?.setFieldsValue({
      syncId: detail.syncId || '',
      insName: detail.insName || '',
      meterSpaceFullName: detail.meterSpaceFullName || '',
    });

    const yDataTem = [
      detail.insName || '',
      ...(detail?.children || []).map((item: any) => {
        return item?.insName || '';
      }),
    ];
    setYData(yDataTem);
    const xDataTem = [
      detail?.currPeriod?.readOfTotal || 0,
      ...(detail?.children || []).map((item: any) => {
        return item?.currPeriod?.readOfTotal || 0;
      }),
    ];
    setXData(xDataTem);
    // console.log(dataList);
    // console.log(dataLinks);
    setSData(
      dataList.map((item) => ({
        name: item.insName,
        rate: item.rateOfParent,
        level: item.level,
      })),
    );
    setSLinks(dataLinks);
  };
  const queryDetail = async () => {
    setLoading(true);
    dataList = [];
    dataLinks = [];
    const p = formRef.current?.getFieldFormatValueObject!();
    const params = {
      id: insId,
      recordTimeStart: p.ranger ? p.ranger[0] + ' 00:00:00' : undefined,
      recordTimeEnd: p.ranger ? p.ranger[1] + ' 23:59:59' : undefined,
      generation: -1,
      level: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
    };
    const res = await insTreeDetailById(params);
    setLoading(false);
    setDetail(res);
  };

  useEffect(() => {
    queryDetail();
  }, []);

  const getOption = () => ({
    colors: defaultColors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {},
    grid: {
      left: '3%',
      right: '6%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'value',
        axisLine: {
          show: true,
        },
        name: '用电量(kw·h)',
        nameTextStyle: {
          // align: 'center',
          // verticalAlign: 'top',
          // padding: [20, 20, 10, 0],
        },
      },
    ],
    yAxis: [
      {
        type: 'category',
        data: yData,
      },
    ],
    series: [
      {
        name: '',
        type: 'bar',
        barWidth: 10,
        emphasis: {
          focus: 'series',
        },
        data: xData,
      },
    ],
  });

  const getSankeyOption = () => {
    return {
      series: {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        links: sLinks,
        data: sData,
        label: {
          formatter: (p: any) => {
            if (p.data.level !== 0) {
              return p.data.rate ? `${p.data.name}: ${p.data.rate + '%'}` : `${p.data.name}`;
            } else {
              return `${p.data.name}`;
            }
          },
        },
      },
    };
  };
  return (
    <PageContainer
      header={{
        title: '主从分析详情',
        onBack: () => {
          history.goBack();
        },
      }}
      className={styles.pageWarp}
    >
      <ProCard split="horizontal">
        <ProCard>
          <ProForm
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            submitter={false}
            readonly={true}
            formRef={formRef2}
          >
            <Row>
              <Col span={6}>
                <ProFormText name="syncId" label="主仪表编号" />
              </Col>
              <Col span={6}>
                <ProFormText name="insName" label="主仪表名称" />
              </Col>
              <Col span={6}>
                <ProFormText name="meterSpaceFullName" label="所属位置" />
              </Col>
            </Row>
          </ProForm>
        </ProCard>
        <ProCard>
          <ProForm
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            onValuesChange={(changeValues) => console.log(changeValues)}
            formRef={formRef}
            submitter={false}
          >
            <Row>
              <Col span={6}>
                <ProFormDateRangePicker name="ranger" label="选择时间" />
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  style={{ marginLeft: '20px' }}
                  onClick={() => {
                    queryDetail();
                  }}
                >
                  查询
                </Button>
              </Col>
            </Row>
          </ProForm>
        </ProCard>
        <ProCard title="主从用能分布" loading={loading}>
          <BarChart getOption={getOption} />
        </ProCard>
        <ProCard title="能源流向分析" loading={loading}>
          <ReactECharts option={getSankeyOption()} />;
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default TableList;
