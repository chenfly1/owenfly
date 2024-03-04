import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Col, Divider, Row } from 'antd';
import Line from '@/components/StatisticCard/Chart/Line';
import { history } from 'umi';
import { getMeterRecordPage, meterRecordDetail } from '@/services/energy';
import dayjs from 'dayjs';
import { Method } from '@/utils';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const { query } = history.location;
  const { syncId, recordDt, insId } = query as any;
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const month = dayjs(recordDt).get('M') + 1;
  const d = dayjs(recordDt).get('D');
  const defaultXData = [];
  for (let i = 1; i <= 24; i++) {
    defaultXData.push(i + '时');
  }
  const [xData, setXData] = useState<string[]>(defaultXData);
  const defaultYData = [
    {
      name: '用水量',
      data: defaultXData.map((item) => 0),
    },
  ];
  const [yData, setYData] = useState<Record<string, any>[]>(defaultYData);

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '2', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).format('YYYY-MM-DD') + ' 00:00:00',
      recordTimeEnd: dayjs(recordDt).format('YYYY-MM-DD') + ' 23:59:59',
    };
    const res = await getMeterRecordPage(params);
    return {
      data: res?.items || [],
      success: true,
      total: res.page?.totalItems,
    };
  };

  const queryDetail = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: recordDt,
      recordTimeEnd: recordDt,
      syncId: syncId,
    };
    const res = await getMeterRecordPage(params);
    const res2 = await meterRecordDetail({
      insId: insId,
      ds: recordDt,
      periodType: '3',
    });
    formRef.current?.setFieldsValue({
      ...res.items[0],
      currTotalSize: res2.currTotalSize,
      totalSize: res2.currTotalSize,
    });
    const records = res2.records || [];
    setXData(records.map((item) => item.time.substring(8) + '时'));
    const yDataTem = defaultYData.map((item) => ({
      name: item.name,
      data: records.map((innerItem) => innerItem.readOfTotal || 0),
      stack: 'Total',
    }));
    setYData(yDataTem);
  };
  const exportClick = async () => {
    setExporting(true);
    const params = {
      ...query,
      pageNo: 1,
      pageSize: 1000,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '2', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).format('YYYY-MM-DD') + ' 00:00:00',
      recordTimeEnd: dayjs(recordDt).format('YYYY-MM-DD') + ' 23:59:59',
    };
    Method.exportExcel(
      `/energy/mng/bi/meter_record/page`,
      `水能用能分析_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...params,
        excel: 'export',
      },
      'POST',
    ).finally(() => {
      setExporting(false);
    });
  };

  useEffect(() => {
    queryDetail();
  }, []);
  const columns: ProColumns<MeterRecordType>[] = [
    {
      title: '所属时间',
      dataIndex: 'recordDt',
      valueType: 'date',
      ellipsis: true,
      search: false,
      width: 100,
      fieldProps: {
        format: 'HH时',
      },
    },
    {
      title: '仪表编号',
      dataIndex: 'syncId',
      ellipsis: true,
      search: false,
      width: 120,
    },
    {
      title: '仪表名称',
      dataIndex: 'insName',
      ellipsis: true,
      search: false,
    },
    {
      title: '计量位置',
      dataIndex: 'meterSpaceFullName',
      ellipsis: true,
      search: false,
    },
    {
      title: '分项名称',
      dataIndex: 'insTagName',
      ellipsis: true,
      search: false,
    },
    {
      title: '上次读数（m³）',
      dataIndex: 'priorPeriodStr',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.priorPeriod?.readOfTotal || '-';
      },
    },
    {
      title: '本次读数（m³）',
      dataIndex: 'currPeriodStr',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.currPeriod?.readOfTotal || '-';
      },
    },
    {
      title: '用量（m³）',
      dataIndex: 'incrementStr',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.increment?.readOfTotal || '-';
      },
    },
  ];
  return (
    <PageContainer
      header={{
        title: '水能用能详情(小时)',
        onBack: () => {
          history.goBack();
        },
      }}
      className={styles.pageWarp}
    >
      <Divider style={{ marginTop: '10px' }} />
      <ProForm
        readonly={true}
        labelCol={{
          flex: '130px',
        }}
        layout="horizontal"
        labelAlign="right"
        formRef={formRef}
        submitter={false}
      >
        <Row>
          <Col span={6}>
            <ProFormText name="syncId" label="仪表编号" placeholder="" />
          </Col>
          <Col span={6}>
            <ProFormText name="insName" label="仪表名称" placeholder="" />
          </Col>
          <Col span={6}>
            <ProFormText name="meterSpaceFullName" label="仪表位置" placeholder="" />
          </Col>
          <Col span={6}>
            <ProFormText name="insTagName" label="分项名称" placeholder="" />
          </Col>
        </Row>
        <Divider />
        <h3 style={{ padding: '0 24px 10px' }}>趋势数据</h3>
        <Row>
          <Col span={6}>
            <ProFormText
              name="currTotalSize"
              label={
                <>
                  <span style={{ fontWeight: 'bold' }}>{`${month}月${d}日`}</span>
                  <span>累计用量</span>
                </>
              }
              placeholder=""
              addonAfter={'m³'}
            />
          </Col>
          <Col span={6}>
            <ProFormText name="totalSize" label="总累计用量" placeholder="" addonAfter={'m³'} />
          </Col>
        </Row>
        <Line
          style={{ padding: '0 24px' }}
          options={{
            yAxis: {
              type: 'value',
              name: '用水量(m³)',
              nameTextStyle: {
                align: 'center',
                verticalAlign: 'bottom',
                // padding: [0, 20, 10, 0],
              },
              splitLine: {
                lineStyle: {
                  type: 'dashed',
                },
              },
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisTick: {
                show: false,
              },
            },
            grid: { top: 50, right: 40, bottom: 40, left: 36 },
            legend: {
              show: true,
              data: defaultYData.map((item) => item.name),
              right: '10%',
              top: 'top',
            },
            tooltip: {
              trigger: 'axis',
              valueFormatter: (value: any) => value + ' m³',
            },
          }}
          data={yData}
        />
      </ProForm>
      <Divider />
      <h3 style={{ padding: '0 24px' }}>用量明细</h3>
      <ProTable<MeterRecordType>
        actionRef={actionRef}
        columns={columns}
        cardBordered
        search={false}
        params={query}
        request={queryList}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        options={false}
        dateFormatter="string"
        headerTitle={
          <ActionGroup
            scene="tableHeader"
            limit={2}
            actions={[
              {
                key: 'export',
                accessKey: 'alitaEnergy_reportInsRecordAnalysis',
                text: '导出',
                loading: exporting,
                onClick() {
                  exportClick();
                },
              },
            ]}
          />
        }
      />
      <Divider />
    </PageContainer>
  );
};

export default TableList;
