import type { ActionType, ProFormInstance, ProColumns } from '@ant-design/pro-components';

import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space } from 'antd';
import { useRef } from 'react';
import { exportExcel, parkTitles } from '@/pages/park-center/utils/constant';
import { parkAreaByPage } from '@/services/park';
import { Access, history, useAccess } from 'umi';
import { deleteEmptyKey } from '@/utils/project';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/park_area/queryByPage', '区域信息', params, 'POST');
  };

  const columns: ProColumns<ParkAreaType>[] = [
    {
      title: parkTitles.alitaYardName,
      dataIndex: 'parkName',
      hideInTable: true,
    },
    {
      title: parkTitles.alitaYardNo,
      dataIndex: 'parkCode',
      hideInTable: true,
    },
    {
      title: parkTitles.areaNum,
      dataIndex: 'code',
      width: 250,
      ellipsis: true,
      search: false,
    },
    {
      title: parkTitles.areaName,
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: parkTitles.belongYard,
      dataIndex: 'parkName',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: parkTitles.total,
      dataIndex: 'parkNumber',
      width: 100,
      ellipsis: true,
      search: false,
    },
    {
      title: parkTitles.fullAccess,
      dataIndex: 'limitState',
      search: false,
      width: 150,
      ellipsis: true,
      render: (_, record) => {
        return record.limitState ? '是' : '否';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      ellipsis: true,
      render: (_, record) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                text: '查看',
                onClick() {
                  history.push({
                    pathname: '/park-center/baseInfo/area-manager/detail',
                    query: {
                      id: record.id,
                      isEdit: 'false',
                    },
                  });
                },
              },
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  history.push({
                    pathname: '/park-center/baseInfo/area-manager/detail',
                    query: {
                      id: record.id,
                      isEdit: 'true',
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

  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  return (
    <PageContainer
      header={{
        // title: '区域管理',
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Access accessible={access.functionAccess('alitaParking_queryParkArea')}>
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
          request={async (params): Promise<any> => {
            const other = formRef.current?.getFieldFormatValueObject!();
            const p = { ...params, ...other };
            deleteEmptyKey(p);
            const res = await parkAreaByPage(p);

            // setEnableExport(res.data.items.length ? true : false);
            // if (res.data.items.length) {
            //   setCanUpdate(params.parkCode.length || params.parkName.length ? true : false);
            // }
            return {
              data: res.data.items,
              success: res.code == 'SUCCESS' ? true : false,
              total: res.data.page.totalItems,
            };
          }}
          rowKey="id"
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
        {/* <Detail edit={edit} visiable={show} data={item} onChange={setShow} /> */}
      </Access>
    </PageContainer>
  );
};
