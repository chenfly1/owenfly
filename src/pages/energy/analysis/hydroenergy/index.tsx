import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { history } from 'umi';
import MeasureTree from '../../measureTree';
import { getMeterRecordPage } from '@/services/energy';
import { Method } from '@/utils';
import dayjs from 'dayjs';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const [meterSpaceId, setMeterSpaceId] = useState<string>('0');
  const actionRef = useRef<ActionType>();
  const [exporting, setExporting] = useState(false);
  const formRef = useRef<ProFormInstance>();

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      meterSpaceId,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '4', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: p.recordTime,
      recordTimeEnd: p.recordTime,
    };
    const res = await getMeterRecordPage(params);
    return {
      data: res?.items || [],
      success: true,
      total: res.page?.totalItems,
    };
  };
  const onSelect = (e: any) => {
    if (e) {
      setMeterSpaceId(e?.key);
      actionRef.current?.reload();
    }
  };
  const columns: ProColumns<MeterRecordType>[] = [
    {
      title: '仪表编号',
      dataIndex: 'syncId',
      hideInTable: true,
    },
    {
      title: '选择时间',
      dataIndex: 'recordTime',
      valueType: 'dateMonth',
      hideInTable: true,
    },
    {
      title: '仪表名称',
      dataIndex: 'cnName',
      hideInTable: true,
    },
    {
      title: '日期',
      dataIndex: 'recordDt',
      valueType: 'date',
      ellipsis: true,
      width: 80,
      fieldProps: {
        format: 'YYYY-MM',
      },
      search: false,
    },
    {
      title: '仪表类型',
      dataIndex: 'energyTypeName',
      ellipsis: true,
      search: false,
      width: 80,
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
      title: '计量位置',
      dataIndex: 'meterSpaceFullName',
      ellipsis: true,
      search: false,
    },
    {
      title: '安装位置',
      dataIndex: 'installationSpaceName',
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
      title: '生成时间',
      dataIndex: 'gmtCreated',
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
                text: '用能明细',
                accessKey: 'alitaEnergy_queryInsRecordAnalysis',
                onClick() {
                  history.push({
                    pathname: '/energy/analysis/hydroenergy/dateDetail',
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
  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
      meterSpaceId,
      energyType: '1', //  能源类型, 0, "电能";1, "水能";
      periodType: '4', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: p.recordTime,
      recordTimeEnd: p.recordTime,
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
  return (
    <PageContainer header={{ title: null }} className={styles.pageWarp}>
      <SplitPane>
        <Pane className="SpaceTreePane" initialSize={'320px'} maxSize="50%">
          <div style={{ height: 'calc(100vh - 123px)', overflowY: 'scroll' }}>
            <MeasureTree
              bodyStyle={{
                padding: '0',
              }}
              select={onSelect}
            />
          </div>
        </Pane>
        <Pane>
          <ProTable<MeterRecordType>
            actionRef={actionRef}
            columns={columns}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            columnsState={{
              persistenceKey: 'pro-table-singe-demos',
              persistenceType: 'localStorage',
              onChange(value) {
                console.log('value: ', value);
              },
            }}
            rowKey="id"
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
            search={{
              labelWidth: 68,
            }}
            pagination={{
              showSizeChanger: true,
            }}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default TableList;
