import {
  ActionType,
  ParamsType,
  ProColumns,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { energyTypeEnum } from '../config';
import { getMeterRecordList } from '@/services/energy';
import MeasureTree from '../measureTree';
import { useInitState } from '@/hooks/useInitState';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import { EnergyState } from '@/models/useEnergy';
import { Method } from '@/utils';
import dayjs from 'dayjs';

export default ({ energyType }: { energyType: energyTypeEnum }) => {
  const [params, setParams] = useState<{ meterSpaceId: string }>({
    meterSpaceId: '0',
  });
  const [exporting, setExporting] = useState(false);
  const { electricCategoryMap, waterCategoryMap, publicTypeMap, energyTypeMap } =
    useInitState<EnergyState>('useEnergy', [
      'electricCategoryMap',
      'waterCategoryMap',
      'publicTypeMap',
      'energyTypeMap',
    ]);
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const unit = energyType === energyTypeEnum.electric ? 'kW·h' : 'm³';
  const getColumns: () => ProColumns<MeterReadingType>[] = () =>
    (
      [
        {
          title: '抄表时间',
          key: 'readTimestamp',
          dataIndex: 'readTimestamp',
          width: 200,
          hideInSearch: true,
          ellipsis: true,
        },
        {
          title: '抄表时间',
          key: 'readTimestamp',
          dataIndex: 'readTimestamp',
          valueType: 'dateRange',
          hideInTable: true,
          order: -4,
          search: {
            transform: (value) => {
              return {
                recordTimeStart: value[0],
                recordTimeEnd: value[1],
              };
            },
          },
        },
        {
          title: '仪表编号',
          key: 'syncId',
          dataIndex: 'syncId',
          order: 0,
          width: 200,
          ellipsis: true,
        },
        {
          title: '仪表名称',
          key: 'insName',
          dataIndex: 'insName',
          order: -1,
          width: 200,
          ellipsis: true,
          formItemProps: {
            name: 'cnName',
          },
        },
        {
          title: '计量位置',
          key: 'meterSpaceFullName',
          dataIndex: 'meterSpaceFullName',
          hideInSearch: true,
          width: 200,
          ellipsis: true,
        },
        {
          title: '安装位置',
          key: 'installationSpaceName',
          dataIndex: 'installationSpaceName',
          hideInSearch: true,
          ellipsis: true,
          width: 200,
        },
        {
          title: '分项名称',
          key: 'insTagName',
          dataIndex: 'insTagName',
          ...(energyType === energyTypeEnum.electric
            ? {
                fieldProps: { loading: electricCategoryMap.loading },
                valueEnum: electricCategoryMap.value,
              }
            : {
                fieldProps: { loading: waterCategoryMap.loading },
                valueEnum: waterCategoryMap.value,
              }),
          formItemProps: {
            name: 'insTagId',
          },
          ellipsis: true,
          order: -2,
          width: 200,
        },
        {
          title: '公区类型',
          key: 'publicTypeName',
          dataIndex: 'publicTypeName',
          order: -5,
          fieldProps: {
            loading: publicTypeMap.loading,
          },
          formItemProps: {
            name: 'publicType',
          },
          valueEnum: publicTypeMap.value,
          ellipsis: true,
          width: 100,
        },
        {
          title: `本期总读数(${unit})`,
          key: 'readOfTotal',
          dataIndex: 'readOfTotal',
          width: 200,
          ellipsis: true,
          hideInSearch: true,
        },
      ] as ProColumns<MeterReadingType>[]
    ).concat(
      energyType === energyTypeEnum.electric
        ? [
            {
              title: `本期尖读数(${unit})`,
              key: 'readOfA',
              dataIndex: 'readOfA',
              width: 200,
              ellipsis: true,
              hideInSearch: true,
            },
            {
              title: `本期峰读数(${unit})`,
              key: 'readOfB',
              dataIndex: 'readOfB',
              width: 200,
              ellipsis: true,
              hideInSearch: true,
            },
            {
              title: `本期平读数(${unit})`,
              key: 'readOfC',
              dataIndex: 'readOfC',
              width: 200,
              ellipsis: true,
              hideInSearch: true,
            },
            {
              title: `本期谷读数(${unit})`,
              key: 'readOfD',
              dataIndex: 'readOfD',
              width: 200,
              ellipsis: true,
              hideInSearch: true,
            },
          ]
        : [],
    );

  const getList = async ({ current, meterSpaceId, ...rest }: ParamsType) => {
    const options = {
      ...rest,
      pageNo: current,
      meterSpaceId: `${meterSpaceId ?? 0}` === '0' ? ['0', '-1'] : [meterSpaceId],
    };
    const res = await getMeterRecordList(energyType, options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  const exportHandler = () => {
    setExporting(true);
    const values = formRef?.current?.getFieldFormatValueObject!();
    const { pageSize, current } = tableRef?.current?.pageInfo || {};
    Method.exportExcel(
      `/energy/mng/meter_record/${energyType}/page`,
      `${energyTypeMap?.value?.[energyType] || ''}抄表记录_${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
      {
        ...values,
        pageNo: current,
        pageSize,
        meterSpaceId: `${params.meterSpaceId ?? 0}` === '0' ? ['0', '-1'] : [params.meterSpaceId],
        excel: 'export',
      },
    ).finally(() => {
      setExporting(false);
    });
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%" minSize={'280px'}>
          <MeasureTree
            select={(node) => {
              if (node?.key !== undefined) setParams({ meterSpaceId: node.key });
            }}
          />
        </Pane>
        <Pane>
          <ProTable<MeterReadingType, { meterSpaceId: string }>
            columns={getColumns()}
            params={params}
            formRef={formRef}
            actionRef={tableRef}
            form={{ colon: false }}
            tableAlertRender={false}
            pagination={{
              showSizeChanger: true,
            }}
            cardBordered
            request={getList}
            toolbar={{
              actions: [
                <Button key="export" type="primary" loading={exporting} onClick={exportHandler}>
                  导出
                </Button>,
              ],
            }}
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};
