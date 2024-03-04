import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Col, Divider, Row } from 'antd';
import Line from '@/components/StatisticCard/Chart/Line';
import { history } from 'umi';
import { getInsStatePage, getMeterRecordPage, meterRecordDetail } from '@/services/energy';
import dayjs from 'dayjs';
import { Method } from '@/utils';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const { query } = history.location;
  const { syncId, recordDt, insId } = query as any;
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [exporting, setExporting] = useState(false);
  const defaultXData = [];
  for (let i = 1; i <= 30; i++) {
    defaultXData.push(i + '日');
  }
  const [xData, setXData] = useState<string[]>(defaultXData);
  const defaultYData = [
    {
      name: '总用量',
      data: defaultXData.map((item) => 0),
    },
    {
      name: '尖期用量',
      data: defaultXData.map((item) => 0),
    },
    {
      name: '峰期用量',
      data: defaultXData.map((item) => 0),
    },
    {
      name: '平期用量',
      data: defaultXData.map((item) => 0),
    },
    {
      name: '谷期用量',
      data: defaultXData.map((item) => 0),
    },
  ];
  const [yData, setYData] = useState<Record<string, any>[]>(defaultYData);
  const month = dayjs(recordDt).get('M') + 1;

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      energyType: '0', //  能源类型, 0, "电能";1, "水能";
      periodType: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).startOf('month').format('YYYY-MM-DD'),
      recordTimeEnd: dayjs(recordDt).endOf('month').format('YYYY-MM-DD'),
    };
    const res = await getMeterRecordPage(params);
    const data = (res?.items || []).map((row) => {
      return {
        ...row,
        priorPeriodStr: `总:${row.priorPeriod?.readOfTotal || 0}|尖:${
          row.priorPeriod?.readOfA || 0
        }|峰:${row.priorPeriod?.readOfB || 0}|平:${row.priorPeriod?.readOfC || 0}|谷:${
          row.priorPeriod?.readOfD || 0
        }`,
        currPeriodStr: `总:${row.currPeriod?.readOfTotal || 0}|尖:${
          row.currPeriod?.readOfA || 0
        }|峰:${row.currPeriod?.readOfB || 0}|平:${row.currPeriod?.readOfC || 0}|谷:${
          row.currPeriod?.readOfD || 0
        }`,
        incrementStr: `总:${row.increment?.readOfTotal || 0}|尖:${row.increment?.readOfA || 0}|峰:${
          row.increment?.readOfB || 0
        }|平:${row.increment?.readOfC || 0}|谷:${row.increment?.readOfD || 0}`,
      };
    });
    return {
      data: data,
      success: true,
      total: res.page?.totalItems,
    };
  };
  // 仪表状态
  const queryList2 = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      insId,
    };
    const res = await getInsStatePage(params);
    return {
      data: res?.items || [],
      success: true,
      total: res?.page?.totalItems || 0,
    };
  };

  const queryDetail = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1,
      energyType: '0', //  能源类型, 0, "电能";1, "水能";
      periodType: '4', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: recordDt,
      recordTimeEnd: recordDt,
      syncId: syncId,
    };
    const res = await getMeterRecordPage(params);
    const res2 = await meterRecordDetail({
      insId: insId,
      ds: recordDt,
      periodType: '4',
    });
    formRef.current?.setFieldsValue({
      ...res.items[0],
      currTotalSize: res2.currTotalSize,
      totalSize: res2.currTotalSize,
    });
    const records = res2.records || [];
    setXData(records.map((item) => item.time.substring(6) + '日'));
    const yDataTem = defaultYData.map((item) => {
      let dataTem: any = [];
      switch (item.name) {
        case '总用量':
          dataTem = records.map((innerItem) => innerItem.readOfTotal || 0);
          break;
        case '尖期用量':
          dataTem = records.map((innerItem) => innerItem.readOfA || 0);
          break;
        case '峰期用量':
          dataTem = records.map((innerItem) => innerItem.readOfB || 0);
          break;
        case '平期用量':
          dataTem = records.map((innerItem) => innerItem.readOfC || 0);
          break;
        case '谷期用量':
          dataTem = records.map((innerItem) => innerItem.readOfD || 0);
          break;
      }
      return {
        name: item.name,
        data: dataTem,
        stack: 'Total',
      };
    });
    setYData(yDataTem);
  };
  const exportClick = async () => {
    setExporting(true);
    const params = {
      ...query,
      pageNo: 1,
      pageSize: 1000,
      energyType: '0', //  能源类型, 0, "电能";1, "水能";
      periodType: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).startOf('month').format('YYYY-MM-DD'),
      recordTimeEnd: dayjs(recordDt).endOf('month').format('YYYY-MM-DD'),
    };
    Method.exportExcel(
      `/energy/mng/bi/meter_record/page`,
      `电能用能分析_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
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
      title: '所属日间',
      dataIndex: 'recordDt',
      valueType: 'date',
      ellipsis: true,
      search: false,
      width: 100,
      fieldProps: {
        format: 'YYYY-MM-DD',
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
      title: '上次读数（kw·h）',
      dataIndex: 'priorPeriodStr',
      ellipsis: true,
      search: false,
    },
    {
      title: '本次读数（kw·h）',
      dataIndex: 'currPeriodStr',
      ellipsis: true,
      search: false,
    },
    {
      title: '用量（kw·h）',
      dataIndex: 'incrementStr',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'detail',
                text: '当日明细',
                accessKey: 'alitaEnergy_queryInsRecordAnalysis',
                onClick() {
                  history.push({
                    pathname: '/energy/analysis/electric/timeDetail',
                    query: {
                      syncId: row.syncId,
                      recordDt: row.recordDt,
                      insId: row.insId + '',
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];
  const columns2: ProColumns<InsStatePageType>[] = [
    {
      title: '序号',
      valueType: 'index',
      width: 100,
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateTime',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态类型',
      dataIndex: 'stateTypeName',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'value',
      ellipsis: true,
      search: false,
    },
  ];
  return (
    <PageContainer
      header={{
        title: '电能用能详情(日)',
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
          flex: '120px',
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
              // label={`${month}月累计用量`}
              label={
                <>
                  <span style={{ fontWeight: 'bold' }}>{`${month}月`}</span>
                  <span>累计用量</span>
                </>
              }
              placeholder=""
              addonAfter={'kw·h'}
            />
          </Col>
          <Col span={6}>
            <ProFormText name="totalSize" label="总累计用量" placeholder="" addonAfter={'kw·h'} />
          </Col>
        </Row>
        <Line
          style={{ padding: '0 24px' }}
          options={{
            yAxis: {
              type: 'value',
              name: '用电量(kw·h)',
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
              name: '日期',
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
              valueFormatter: (value: any) => value + ' kw·h',
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
                loading: exporting,
                text: '导出',
                onClick() {
                  exportClick();
                },
              },
            ]}
          />
        }
      />
      <Divider />
      <h3 style={{ padding: '0 24px' }}>仪表状态</h3>
      <ProTable<InsStatePageType>
        columns={columns2}
        cardBordered
        search={false}
        request={queryList2}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        options={false}
        dateFormatter="string"
      />
      {/* <Add open={modalVisit} onOpenChange={setModalVisit} onSubmit={onSubmit} data={modalData} /> */}
    </PageContainer>
  );
};

export default TableList;
