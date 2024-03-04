import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { ProTable } from '@ant-design/pro-components';
import type {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Divider } from 'antd';
import Detail from './detail';
import { getElectricEnergyReport, getEnergyStatement, getTotoalSource } from '@/services/energy';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import ActionGroup from '@/components/ActionGroup';
import { Method } from '@/utils';
import dayjs from 'dayjs';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [exporting, setExporting] = useState(false);
  const [source, setSource] = useState<EnergyStatementType>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});
  const [meterTypes, setMeterTypes] = useState<{
    loading: boolean;
    values: Record<string, string>;
  }>();
  const { electricCategoryMap, measureTree } = useInitState<EnergyState>('useEnergy', [
    'electricCategoryMap',
    'measureTree',
  ]);

  const getOptions = async ({ current, insType, ...rest }: ParamsType) => {
    const options: any = { ...rest, pageNo: current };
    let types = meterTypes?.values;
    if (!types) {
      types = await getTotoalSource('InsType', {
        param: { energyType: 0 },
      });
      setMeterTypes({
        loading: false,
        values: types,
      });
    }
    options.insTypes = insType ? [insType] : Object.keys(types);
    return options;
  };

  const queryList = async (params: ParamsType) => {
    const options = await getOptions(params);
    const res = await getElectricEnergyReport(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const onSubmit = () => {
    setModalVisit(false);
  };

  const exportHandler = async () => {
    setExporting(true);
    const values = formRef?.current?.getFieldFormatValueObject!();
    const { current, pageSize } = actionRef?.current?.pageInfo || {};
    const options = await getOptions({ ...values, current, pageSize });
    Method.exportExcel(
      `/energy/mng/bi/statement/0/page`,
      `电能报表记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...options,
        excel: 'export',
      },
    ).finally(() => {
      setExporting(false);
    });
  };

  const columns: ProColumns<EnergyReportType>[] = [
    {
      title: '日期',
      dataIndex: 'recordDtStr',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '统计日期维度',
      dataIndex: 'periodType',
      valueType: 'radioButton',
      valueEnum: {
        3: '日',
        4: '月',
        5: '年',
      },
      hideInTable: true,
      initialValue: '4',
      fieldProps: {
        buttonStyle: 'solid',
        onChange: () => {
          formRef.current?.submit();
        },
      },
      order: 0,
      colSize: 3,
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      valueEnum: meterTypes?.values || {},
      formItemProps: { name: 'insType' },
      fieldProps: {
        loading: meterTypes?.loading,
      },
      order: -1,
      width: 100,
      ellipsis: true,
    },
    {
      title: '仪表编号',
      dataIndex: 'syncId',
      order: -3,
      width: 150,
      ellipsis: true,
    },
    {
      title: '仪表名称',
      dataIndex: 'insName',
      formItemProps: {
        name: 'cnName',
      },
      order: -4,
      width: 150,
      ellipsis: true,
    },
    {
      title: '计量位置',
      dataIndex: 'meterSpaceFullName',
      valueType: 'treeSelect',
      fieldProps: {
        allowClear: true,
        loading: measureTree.loading,
        options: measureTree.value,
        fieldNames: {
          value: 'key',
          label: 'title',
        },
      },
      formItemProps: {
        name: 'meterSpaceId',
      },
      order: -2,
      width: 150,
      ellipsis: true,
    },
    {
      title: '安装位置',
      dataIndex: 'installationSpaceName',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '分项名称',
      dataIndex: 'insTagName',
      valueEnum: electricCategoryMap.value,
      fieldProps: {
        loading: electricCategoryMap.loading,
      },
      formItemProps: {
        name: 'insTagId',
      },
      order: -5,
      width: 150,
      ellipsis: true,
    },
    {
      title: '关联主表',
      dataIndex: 'parentSyncId',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '是否含从表',
      dataIndex: 'inCloudChildStr',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
    },
    {
      title: '公区类型',
      dataIndex: 'publicTypeName',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
    },
    {
      title: '用电量(kW·h)',
      dataIndex: 'increment',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
    },
    {
      title: '碳排放(kg)',
      dataIndex: 'realCarbonSize',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
    },
    {
      title: '二氧化碳排放(kg)',
      dataIndex: 'carbonDioxide',
      hideInSearch: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: '选择时间',
      dataIndex: 'range',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            recordTimeStart: value[0],
            recordTimeEnd: value[1],
          };
        },
      },
      hideInTable: true,
      order: -6,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      ellipsis: true,
      fixed: 'right',
      render: (_, row) => {
        return (
          <ActionGroup
            limit={1}
            actions={[
              {
                key: 'check',
                text: '详情',
                onClick: () => {
                  setModalVisit(true);
                  setModalData(row);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  useEffect(() => {
    getEnergyStatement().then((res) => {
      setSource(res);
    });
  }, []);

  return (
    <PageContainer header={{ title: null }} className={styles.pageWarp}>
      <ProTable<EnergyReportType>
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
          labelWidth: 120,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        toolBarRender={() => [
          <Button key="export" type="primary" loading={exporting} onClick={exportHandler}>
            导出
          </Button>,
        ]}
        headerTitle={
          <>
            <div>
              主仪表累计：<span>{source?.topSum ?? ''} kW·h</span>
            </div>
            <div>
              碳排放：<span>{source?.topCarbonSum ?? ''} kg</span>
            </div>
            <Divider type="vertical" style={{}} />
            <div>
              最小节点仪表累计：<span>{source?.leafSum ?? ''} kW·h</span>
            </div>
            <div>
              碳排放：<span>{source?.leafCarbonSum ?? ''} kg</span>
            </div>
            <Divider type="vertical" />
            <div>
              损耗率：
              <span>
                {source?.raceOfLoss ? `${Math.abs(Number(source.raceOfLoss)) * 100}%` : ''}
              </span>
            </div>
          </>
        }
        dateFormatter="string"
      />
      <Detail open={modalVisit} onOpenChange={setModalVisit} onSubmit={onSubmit} data={modalData} />
    </PageContainer>
  );
};

export default TableList;
