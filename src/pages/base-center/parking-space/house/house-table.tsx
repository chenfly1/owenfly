import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';

import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import {
  batchBuildingHouse,
  deleteBuildingHouse,
  getBuildingHouseBypage,
  getResourceEnum,
} from '@/services/mda';
import { Access, history, useAccess } from 'umi';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import styles from './style.less';

const { confirm } = Modal;
import { buildingHouse } from '@/components/FileUpload/business';
import { Jump } from '@/utils';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const formRef = useRef<ProFormInstance>();
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    defaultSelectedRowKeys: [],
    onChange: onSelectChange,
  };
  const columns: ProColumns<BuildingHouseListType>[] = [
    {
      title: '房产简称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
      render: (_, record) => [
        <Tooltip key="detail" placement="topLeft" title={record.name}>
          <a
            type="link"
            onClick={() => {
              history.push(`/base-center/parking-space/house/details?id=${record.id}`);
            }}
          >
            {`${record.name}`}
          </a>
        </Tooltip>,
      ],
    },
    {
      title: '产权人名称',
      dataIndex: 'propertyOwner',
      order: 4,

      ellipsis: true,
    },
    {
      title: '产权人手机',
      dataIndex: 'mobile',
      order: 4,
      width: 130,
      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '房产类型',
      dataIndex: 'propertyType',

      filters: false,
      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('house_property_type');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '产权性质',
      dataIndex: 'propertyRight',

      filters: false,
      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('house_property_right');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '使用性质',
      dataIndex: 'useNature',

      filters: false,
      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('house_use_nature');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '入住状态',
      dataIndex: 'occupyStatus',

      filters: false,
      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('house_occupy_status');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '出租状态',
      dataIndex: 'rentStatus',

      filters: false,
      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('house_rent_status');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '生效状态',
      dataIndex: 'state',

      filters: false,
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '生效',
          status: 'Success',
        },
        0: {
          text: '失效 ',
          status: 'Error',
        },
      },
      request: async () => {
        const res = await getResourceEnum('state');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '操作',
      width: 100,
      key: 'option',
      search: false,
      render: (_, record) => [
        <Access key="edit" accessible={access.functionAccess('masdata_editHouse')}>
          <a
            type="link"
            onClick={() => {
              history.push(`/base-center/parking-space/house/edit?id=${record.id}`);
            }}
          >
            编辑
          </a>
        </Access>,
      ],
    },
  ];

  const errorAlert = (list: string[]) => {
    return Modal.error({
      title: <span className={styles.errorText}>{'房产删除失败'}</span>,
      okText: '确定',
      centered: true,
      content: (
        <>
          {list.map((i: string) => (
            <p key={i}>{i}</p>
          ))}
        </>
      ),
    });
  };

  const deleteAll = () => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除房产后无法找回',
      centered: true,
      // content: (
      //   <div>
      //     <p className={styles.errorText}>如需批量修改房产信息，请【导出】修改，再批量导入。</p>
      //   </div>
      // ),
      onOk: async () => {
        const res = await deleteBuildingHouse(project?.bid);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          setSelectedRowKeys([]);
          const alterMsg = (res.data as any).alterMsg;
          if (alterMsg) {
            const errorList = alterMsg.split(';');
            errorAlert(errorList);
          } else {
            message.success('删除成功');
          }
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const deleteRow = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请勾选行数据');
      return;
    }
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除房产后无法找回',
      // content: (
      //   <div>
      //     <p className={styles.errorText}>如需批量修改房产信息，请【导出】修改，再批量导入。</p>
      //   </div>
      // ),
      centered: true,
      onOk: async () => {
        const res = await batchBuildingHouse(selectedRowKeys as string[]);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          setSelectedRowKeys([]);
          const alterMsg = (res.data as any).alterMsg;
          if (alterMsg) {
            const errorList = alterMsg.split(';');
            errorAlert(errorList);
          } else {
            message.success('删除成功');
          }
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const getByPage = async (params: Record<string, any>) => {
    const msg = await getBuildingHouseBypage({
      ...params,
      projectBid: project?.bid,
      pageNo: params.current,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  const headerTitle = () => {
    return (
      <ActionGroup
        scene="tableHeader"
        selection={{
          count: selectedRowKeys.length,
        }}
        actions={[
          {
            key: 'batchImport',
            text: '批量导入',
            accessKey: 'masdata_batchImportHouse',
            onClick: () => {
              history.push({
                pathname: `/base-center/parking-space/batch-import`,
                query: {
                  businessId: buildingHouse.id,
                  businessType: '1',
                  path: buildingHouse.path,
                  projectBid: project?.bid,
                },
              });
            },
          },
          {
            key: 'del',
            text: '删除',
            accessKey: 'masdata_deleteHouse',
            onClick: deleteRow,
          },
          {
            key: 'delAll',
            text: '全部删除',
            accessKey: 'masdata_deleteHouse',
            onClick: deleteAll,
          },
        ]}
      />
    );
  };

  return (
    <ProTable<BuildingHouseListType>
      columns={columns}
      ghost={true}
      className={styles.tableStyle}
      actionRef={actionRef}
      formRef={formRef}
      form={{
        colon: false,
      }}
      cardBordered
      request={getByPage}
      tableAlertRender={false}
      rowSelection={rowSelection}
      rowKey="id"
      search={
        {
          labelWidth: 80,
          labelAlign: 'left',
        } as any
      }
      pagination={{
        showSizeChanger: true,
      }}
      headerTitle={headerTitle()}
      toolBarRender={() => [
        <Access key="add" accessible={access.functionAccess('masdata_addHouse')}>
          <Button
            key="button"
            onClick={() => {
              Jump.go(`/base-center/parking-space/house/add`);
            }}
            icon={<PlusOutlined />}
            type="primary"
          >
            新建房产
          </Button>
        </Access>,
      ]}
    />
  );
};
