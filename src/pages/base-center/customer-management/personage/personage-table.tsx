import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history, Access, useAccess } from 'umi';

import {
  getIdCardTypeEnums,
  queryByPageCustomer,
  deleteCustomer,
  deleteAllCustomer,
} from '@/services/mda';
import { individualCustomer } from '@/components/FileUpload/business';
import DataMasking from '@/components/DataMasking';
import style from './style.less';
import ActionGroup from '@/components/ActionGroup';
const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');

  const handleDelSelection = async () => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '提示',
      centered: true,
      content: '确定删除全部个人客户吗',
      onOk: async () => {
        const res = await deleteAllCustomer({ projectBid: project?.bid });
        if (res.code === 'SUCCESS') {
          message.success(res.message);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: ProColumns<CusMemberPersonType>[] = [
    {
      title: '客户名称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
    },
    {
      title: '客户手机号',
      dataIndex: 'mobile',
      order: 4,

      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '证件类型',
      dataIndex: 'identityType',

      hideInSearch: true,
      ellipsis: true,
      order: 1,
      valueType: 'select',
      request: async () => {
        const res = await getIdCardTypeEnums();
        return res.data.map((i) => ({
          value: i.code,
          label: i.codeName,
        }));
      },
    },
    {
      title: '证件号码',
      dataIndex: 'identityCard',

      ellipsis: true,
      render: (_, record) => {
        if (record.identityType === 'id_card') {
          return [<DataMasking key="onlysee" text={record.identityCard} type="idCard" />];
        }
        return <span>{record.identityCard ? record.identityCard : '-'}</span>;
      },
    },
    {
      title: '关联房产',
      dataIndex: 'title',

      search: false,
      ellipsis: true,
      render: (_, row: any) => {
        const text =
          row.propertyRelList &&
          row.propertyRelList
            .map((i: any) => {
              return `${i.propertyName} ${i.roleName}`;
            })
            .join(';');
        return (
          <Tooltip key="detail" placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: '100px',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                accessKey: 'masdata_editCrmPersonage',
                onClick() {
                  history.push({
                    pathname: '/base-center/customer-management/personage/edit',
                    query: {
                      isEdit: 'true',
                      bid: record.bid,
                    },
                  });
                },
              },
              {
                key: 'del',
                text: '删除',
                danger: true,
                accessKey: 'masdata_deleteCustomer',
                onClick() {
                  confirm({
                    icon: <ExclamationCircleFilled />,
                    title: '确定删除客户',
                    centered: true,
                    content: (
                      <div>
                        <span>删除客户后在当前项目下无法找回</span>
                      </div>
                    ),
                    onOk: async () => {
                      const res = await deleteCustomer({
                        bid: record.bid,
                        projectBid: project?.bid,
                      });
                      if (res.code === 'SUCCESS') {
                        message.success(res.message);
                        if (actionRef.current) {
                          actionRef.current.reload();
                        }
                      }
                    },
                    onCancel() {
                      console.log('Cancel');
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
    <ProTable<CusMemberPersonType>
      className={style.tableStyle}
      columns={columns}
      actionRef={actionRef}
      cardBordered
      form={{
        colon: false,
      }}
      request={async (params = {}) => {
        const pageNo = params.current;
        delete params.current;
        const msg = await queryByPageCustomer({
          ...params,
          projectBid: project?.bid,
          pageNo,
        });
        return {
          data: msg.data.items,
          // success 请返回 true， 不然 table 会停止解析数据，即使有数据
          success: true,
          // 不传会使用 data 的长度，如果是分页一定要传
          total: msg.data.page.totalItems,
        };
      }}
      // rowSelection={{
      //   // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
      //   // 注释该行则默认不显示下拉选项
      //   defaultSelectedRowKeys: [],
      // }}
      tableAlertOptionRender={() => {}}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        onChange(value) {
          console.log('value: ', value);
        },
      }}
      rowKey="bid"
      search={
        {
          labelWidth: 88,
          labelAlign: 'left',
        } as any
      }
      ghost={true}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      dateFormatter="string"
      headerTitle={
        <ActionGroup
          scene="tableHeader"
          actions={[
            {
              key: 'batchImport',
              text: '批量导入',
              accessKey: 'masdata_batchImportCustomer',
              onClick: () => {
                history.push({
                  pathname: `/base-center/customer-management/batch-import`,
                  query: {
                    businessId: individualCustomer.id,
                    businessType: '3',
                    path: individualCustomer.path,
                    projectBid: project?.bid,
                  },
                });
              },
            },
            {
              key: 'delAll',
              text: '全部删除',
              accessKey: 'masdata_batchDeleteCustomer',
              onClick: handleDelSelection,
            },
          ]}
        />
      }
      toolBarRender={() => [
        <Access key="add" accessible={access.functionAccess('masdata_addCrmPersonage')}>
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              history.push({
                pathname: '/base-center/customer-management/personage/add',
                query: {
                  isEdit: 'false',
                },
              });
            }}
          >
            新建个人客户
          </Button>
        </Access>,
      ]}
    />
  );
};
