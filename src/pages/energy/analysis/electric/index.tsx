import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { history } from 'umi';
import MeasureTree from '../../measureTree';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { getMeterRecordPage } from '@/services/energy';
import { Method } from '@/utils';
import dayjs from 'dayjs';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const [meterSpaceId, setMeterSpaceId] = useState<string>('0');
  const actionRef = useRef<ActionType>();
  const [exporting, setExporting] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const { publicTypeMap } = useInitState<EnergyState>('useEnergy', ['publicTypeMap']);

  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      meterSpaceId,
      energyType: '0', //  能源类型, 0, "电能";1, "水能";
      periodType: '4', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: p.recordTime,
      recordTimeEnd: p.recordTime,
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
  const onSelect = (e: any) => {
    if (e) {
      setMeterSpaceId(e?.key);
      actionRef.current?.reload();
    }
  };
  const exportClick = async () => {
    setExporting(true);
    const p = formRef?.current?.getFieldFormatValueObject!();
    const params = {
      ...p,
      pageNo: 1,
      pageSize: 1000,
      meterSpaceId,
      energyType: '0', //  能源类型, 0, "电能";1, "水能";
      periodType: '4', // 2, "小时统计";3, "日统计";4, "月统计";5, "年统计"
      recordTimeStart: p.recordTime,
      recordTimeEnd: p.recordTime,
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
  const columns: ProColumns<MeterRecordType>[] = [
    // {
    //   title: '仪表类型',
    //   dataIndex: 'insType',
    //   valueType: 'select',
    //   hideInTable: true,
    //   // initialValue: '0',
    //   valueEnum: insTypeMap.value,
    //   fieldProps: { loading: insTypeMap.loading },
    // },
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
      title: '公区类型',
      dataIndex: 'publicType',
      valueType: 'select',
      hideInTable: true,
      valueEnum: publicTypeMap.value,
      fieldProps: { loading: publicTypeMap.loading },
    },

    {
      title: '日期',
      dataIndex: 'recordDt',
      valueType: 'date',
      width: 80,
      fieldProps: {
        format: 'YYYY-MM',
      },
      ellipsis: true,
      search: false,
    },
    {
      title: '仪表类型',
      dataIndex: 'insTypeName',
      width: 80,
      ellipsis: true,
      search: false,
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
      title: '上期读数（kw·h）',
      dataIndex: 'priorPeriodStr',
      ellipsis: true,
      search: false,
    },
    {
      title: '本期读数（kw·h）',
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
                    pathname: '/energy/analysis/electric/dateDetail',
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
            formRef={formRef}
            columns={columns}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            columnsState={{
              persistenceKey: 'pro-table-singe-demos',
              persistenceType: 'localStorage',
            }}
            rowKey="id"
            search={{
              labelWidth: 68,
            }}
            pagination={{
              showSizeChanger: true,
            }}
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
