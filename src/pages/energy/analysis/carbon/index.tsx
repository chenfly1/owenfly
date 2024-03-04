import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { ProTable } from '@ant-design/pro-components';
import type {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { history } from 'umi';
import { getCarbonAnalysis } from '@/services/energy';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { Method } from '@/utils';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [exporting, setExporting] = useState(false);

  const queryList = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getCarbonAnalysis(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const exportHandler = () => {
    setExporting(true);
    const values = formRef?.current?.getFieldFormatValueObject!();
    const { pageSize, current } = actionRef?.current?.pageInfo || {};
    Method.exportExcel(
      '/energy/mng/bi/carbon_index/page',
      `碳排放分析记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        ...values,
        pageNo: current,
        pageSize,
        excel: 'export',
      },
    ).finally(() => {
      setExporting(false);
    });
  };

  const columns: ProColumns<CarbonAnalysis>[] = [
    {
      title: '指标名称',
      dataIndex: 'cnName',
      formItemProps: {
        label: '统计名称',
        name: 'carbonIndexName',
      },
    },
    {
      title: '统计周期',
      dataIndex: 'periodTypeName',
      hideInSearch: true,
    },
    {
      title: '折标煤系数',
      dataIndex: 'co2',
      hideInSearch: true,
      render: (_, row) => {
        return `${row.co2 ?? ''} kgec/kw·h`;
      },
    },
    {
      title: '折碳目标值',
      dataIndex: 'carbonLimit',
      hideInSearch: true,
      render: (_, row) => {
        return `${row.carbonLimit ?? ''} kg`;
      },
    },
    {
      title: '实际折碳值',
      dataIndex: 'realCarbonSize',
      hideInSearch: true,
      render: (_, row) => {
        return `${row.realCarbonSize ?? ''} kg`;
      },
    },
    {
      title: '超额用量',
      dataIndex: 'overSize',
      hideInSearch: true,
      render: (_, row) => {
        return `${row.overSize ?? ''} kg`;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        return (
          <ActionGroup
            limit={1}
            actions={[
              {
                key: 'check',
                text: '详情',
                onClick: () => {
                  history.push({
                    pathname: '/energy/analysis/carbon/detail',
                    query: {
                      id: `${row.id ?? ''}`,
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
      <ProTable<CarbonAnalysis>
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
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="id"
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
