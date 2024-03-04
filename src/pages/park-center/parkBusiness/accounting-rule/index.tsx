// import { ExclamationCircleFilled, VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useRef, useState } from 'react';

import {
  chargeHolidayModeEnum,
  chargeModeEnum,
  exportExcel,
  parkTitles,
} from '@/pages/park-center/utils/constant';
import { chargeRuleByPage, parkYardListByPage, syncChargeRule } from '@/services/park';
import { deleteEmptyKey } from '@/utils/project';
import { Access, history, useAccess } from 'umi';
import { RedoOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons/lib/icons';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [open, setOpen] = useState<boolean>(false);

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: project.bid,
    });
    return (res.data.items || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const onFinish = async (form: any) => {
    const params = {
      projectId: project.bid,
      parkId: form.parkId,
    };
    const res = await syncChargeRule(params);
    if (res.code === 'SUCCESS') {
      message.success('同步成功');
      actionRef?.current?.reload();
      return true;
    }
  };

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!() || {};
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/parking/mng/charge_rule', '计费规则', params, 'GET');
  };

  const columns: ProColumns<ParkChargeRuleType>[] = [
    {
      title: parkTitles.alitaYardName,
      dataIndex: 'parkName',
      hideInTable: true,
    },
    {
      title: '计费规则名称',
      dataIndex: 'name',
      search: false,
    },
    {
      title: parkTitles.belongYard,
      dataIndex: 'parkName',
      search: false,
    },
    // {
    //   title: parkTitles.belongProject,
    //   dataIndex: 'projectName',
    //   search: false,
    // },
    {
      title: '计费方式',
      dataIndex: 'mode',
      search: false,
      valueEnum: chargeModeEnum,
    },
    {
      title: '节假日模式',
      dataIndex: 'holidayMode',
      search: false,
      valueEnum: chargeHolidayModeEnum,
    },
    {
      title: '规则描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
  ];
  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  return (
    <PageContainer
      header={{
        // title: '计费规则',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Access
        key="accounting-rule"
        accessible={access.functionAccess('alitaParking_queryChargeRule')}
      >
        <ProTable
          columns={tableColumns}
          actionRef={actionRef}
          form={{
            colon: false,
          }}
          cardBordered
          request={async (params) => {
            const other = formRef.current?.getFieldFormatValueObject!();
            const p = { ...params, ...other };
            deleteEmptyKey(p);

            const res = await chargeRuleByPage(p);
            // setEnableExport(res.data.items.length ? true : false);
            return {
              data: res.data.items,
              success: res.code == 'SUCCESS' ? true : false,
              total: res.data.page.totalItems,
            };
          }}
          columnsState={{
            persistenceKey: 'pro-table-singe-demos',
            persistenceType: 'localStorage',
            onChange(value) {
              console.log('value: ', value);
            },
          }}
          toolBarRender={() => [
            <Button
              key="1"
              type="primary"
              icon={<RedoOutlined />}
              onClick={() => {
                formRef.current?.resetFields();
                setOpen(true);
              }}
            >
              同步
            </Button>,
          ]}
          headerTitle={
            <Button key="delete" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
              导出
            </Button>
          }
          rowKey="name"
          search={{
            labelWidth: 68,
            // defaultColsNumber: 7,
          }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          options={{
            setting: {
              listsHeight: 400,
            },
          }}
          dateFormatter="string"
        />
      </Access>
      <ModalForm
        modalProps={{
          centered: true,
        }}
        width={'400px'}
        layout="horizontal"
        onOpenChange={setOpen}
        title={'同步'}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
      >
        <ProFormSelect
          rules={[{ required: true }]}
          name="parkId"
          label="车场名称"
          allowClear={false}
          request={queryParkList}
        />
      </ModalForm>
    </PageContainer>
  );
};
