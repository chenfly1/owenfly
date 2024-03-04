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
    defaultXData.push(i + '');
  }
  const [xData, setXData] = useState<string[]>(defaultXData);
  const defaultYData = [
    {
      name: '用水量',
      data: defaultXData.map((item) => 0),
    },
  ];
  const [yData, setYData] = useState<Record<string, any>[]>(defaultYData);
  const month = dayjs(recordDt).get('M') + 1;

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).startOf('month').format('YYYY-MM-DD'),
      recordTimeEnd: dayjs(recordDt).endOf('month').format('YYYY-MM-DD'),
    };
    const res = await getMeterRecordPage(params);
    return {
      data: res?.items || [],
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
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
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
      periodType: '3', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      syncId: syncId,
      recordTimeStart: dayjs(recordDt).startOf('month').format('YYYY-MM-DD'),
      recordTimeEnd: dayjs(recordDt).endOf('month').format('YYYY-MM-DD'),
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
      width: 120,
      search: false,
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
      title: '上期读数（m³）',
      dataIndex: 'priorPeriod',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.priorPeriod?.readOfTotal || '-';
      },
    },
    {
      title: '本期读数（m³）',
      dataIndex: 'currPeriod',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.currPeriod?.readOfTotal || '-';
      },
    },
    {
      title: '用量（m³）',
      dataIndex: 'increment',
      ellipsis: true,
      search: false,
      render: (_, row) => {
        return row.increment?.readOfTotal || '-';
      },
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
                    pathname: '/energy/analysis/hydroenergy/timeDetail',
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
      valueType: 'date',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态类型',
      dataIndex: 'value',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'stateTypeName',
      ellipsis: true,
      search: false,
    },
  ];
  return (
    <PageContainer
      header={{
        title: '水能用能详情(日)',
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
