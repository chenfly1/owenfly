import { placeQueryByPage } from '@/services/park';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef } from 'react';
// import { parkTitles } from '@/pages/park-center/utils/constant';
// import type { DefaultOptionType } from 'antd/lib/select';
// import NameSearchSelect from '../../NameSearchSelect';
import { Button, Space } from 'antd';
// import { ExclamationCircleFilled, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { deleteEmptyKey } from '@/utils/project';
import { getResourceEnum } from '@/services/mda';
import { Access, history, useAccess } from 'umi';
import { exportExcel } from '../../utils/constant';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import DataMasking from '@/components/DataMasking';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  // const [enableExport, setEnableExport] = useState(false);
  const access = useAccess();

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/place/queryByPage', '车位信息', params, 'POST');
  };

  const columns: ProColumns<SpaceType>[] = [
    {
      title: '车位编号',
      order: 6,
      dataIndex: 'code',
    },
    {
      title: '车位类型',
      order: 5,
      index: 6,
      dataIndex: 'parkingType',
      valueType: 'select',
      request: async () => {
        const { data } = await getResourceEnum('place_parking_type');
        if (data instanceof Array) {
          return data.map((i) => ({
            value: i.code,
            label: i.message,
          }));
        }
        return [];
      },
      fieldProps: {
        onChange: () => {
          actionRef.current?.reload();
        },
      },
    },
    // {
    //   index: 2,
    //   title: '所属项目',
    //   dataIndex: 'project',
    //   search: false,
    // },
    {
      order: 3,
      title: '泊车数量',
      dataIndex: 'parkingNumber',
    },
    {
      order: 2,
      title: '产权人姓名',
      dataIndex: 'propertyOwner',
    },
    {
      order: 1,
      title: '手机号码',
      dataIndex: 'mobile',
      render: (_, row) => {
        return <DataMasking key="onlysee" text={row.mobile} />;
      },
    },
  ];

  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  return (
    <PageContainer
      header={{
        // title: '车位信息',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Access key="park-info" accessible={access.functionAccess('alitaParking_queryMasPlace')}>
        <ProTable
          cardBordered
          form={{
            colon: false,
          }}
          columns={tableColumns}
          actionRef={actionRef}
          formRef={formRef}
          columnsState={{
            persistenceKey: 'pro-table-singe-demos',
            persistenceType: 'localStorage',
          }}
          request={async (params): Promise<{ data: any; success: boolean; total: any }> => {
            // params.projectId = getProjectBid();
            const other = formRef.current?.getFieldFormatValueObject!();
            const p = { ...params, ...other };
            deleteEmptyKey(p);

            const res = await placeQueryByPage(p);
            // setEnableExport(res.data.items.length ? true : false);
            return {
              data: res.data.items,
              success: res.code === 'SUCCESS' ? true : false,
              total: res.data.page.totalItems,
            };
          }}
          rowKey="placeCode"
          search={
            {
              labelWidth: 68,
              labelAlign: 'left',
              // // defaultColsNumber: 7,
            } as any
          }
          options={{
            setting: {
              listsHeight: 400,
            },
          }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          dateFormatter="string"
          headerTitle={
            <Space>
              <Button icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                导出
              </Button>
            </Space>
          }
        />
      </Access>
    </PageContainer>
  );
};
