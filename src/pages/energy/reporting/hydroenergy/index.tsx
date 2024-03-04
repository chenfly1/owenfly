import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import type {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { getWaterEnergyReport, getTotoalSource } from '@/services/energy';
import styles from './index.less';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { Button } from 'antd';
import { Method } from '@/utils';
import dayjs from 'dayjs';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [exporting, setExporting] = useState(false);
  const [meterTypes, setMeterTypes] = useState<{
    loading: boolean;
    values: Record<string, string>;
  }>();
  const { waterCategoryMap, measureTree } = useInitState<EnergyState>('useEnergy', [
    'waterCategoryMap',
    'measureTree',
  ]);

  const getOptions = async ({ current, insType, ...rest }: ParamsType) => {
    const options: any = { ...rest, pageNo: current };
    let types = meterTypes?.values;
    if (!types) {
      types = await getTotoalSource('InsType', {
        param: { energyType: 1 },
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
    const res = await getWaterEnergyReport(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const exportHandler = async () => {
    setExporting(true);
    const values = formRef?.current?.getFieldFormatValueObject!();
    const { current, pageSize } = actionRef?.current?.pageInfo || {};
    const options = await getOptions({ ...values, current, pageSize });
    Method.exportExcel(
      `/energy/mng/bi/statement/1/page`,
      `水能报表记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
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
          formRef?.current?.submit();
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
      fieldProps: {
        loading: meterTypes?.loading,
      },
      formItemProps: { name: 'insType' },
      order: -1,
    },
    {
      title: '仪表编号',
      dataIndex: 'syncId',
      order: -3,
    },
    {
      title: '仪表名称',
      dataIndex: 'insName',
      formItemProps: {
        name: 'cnName',
      },
      order: -4,
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
    },
    {
      title: '安装位置',
      dataIndex: 'installationSpaceName',
      hideInSearch: true,
    },
    {
      title: '分项名称',
      dataIndex: 'insTagName',
      valueEnum: waterCategoryMap.value,
      fieldProps: {
        loading: waterCategoryMap.loading,
      },
      formItemProps: {
        name: 'insTagId',
      },
      order: -5,
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
    },
    {
      title: '公区类型',
      dataIndex: 'publicTypeName',
      hideInSearch: true,
    },
    {
      title: '用水量(m³)',
      dataIndex: 'increment',
      hideInSearch: true,
    },
  ];
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
        rowKey="id"
        request={queryList}
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
        dateFormatter="string"
        toolBarRender={() => [
          <Button key="export" type="primary" loading={exporting} onClick={exportHandler}>
            导出
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default TableList;
