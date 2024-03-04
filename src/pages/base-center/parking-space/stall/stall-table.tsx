import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Tooltip } from 'antd';
import { Button, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import {
  batchParkingPlace,
  deleteParkingPlace,
  getParkingQueryByPage,
  getResourceEnum,
} from '@/services/mda';
import styles from './style.less';
import { Access, history, useAccess } from 'umi';
import { parkingSpace } from '@/components/FileUpload/business';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';

const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    onChange: onSelectChange,
  };

  const errorAlert = (list: string[]) => {
    return Modal.error({
      title: <span className={styles.errorText}>{'车位删除失败'}</span>,
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
      title: '确定删除车位后无法找回',
      // content: (
      //   <div>
      //     <p className={styles.errorText}>如需批量修改车位信息，请【导出】修改，再批量导入。</p>
      //   </div>
      // ),
      centered: true,
      onOk: async () => {
        const res = await deleteParkingPlace(project?.bid);
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
      title: '确定删除车位后无法找回',
      // content: (
      //   <div>
      //     <p className={styles.errorText}>如需批量修改车位信息，请【导出】修改，再批量导入。</p>
      //   </div>
      // ),
      centered: true,
      onOk: async () => {
        const res = await batchParkingPlace(selectedRowKeys as number[]);
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
  const columns: ProColumns<ParkingPlaceListType>[] = [
    {
      title: '车位简称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
      render: (_, record) => [
        <Tooltip key="detail" placement="topLeft" title={record.name}>
          <a
            key="detail"
            type="link"
            onClick={() => {
              history.push(`/base-center/parking-space/stall/details?id=${record.id}`);
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
      title: '手机号',
      dataIndex: 'mobile',
      order: 4,

      search: false,
      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '车位类型',
      dataIndex: 'parkingType',

      // filters: true,
      // onFilter: true,
      ellipsis: true,
      order: 1,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('place_parking_type');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '产权性质',
      dataIndex: 'propertyRight',
      key: 'placeright',
      order: 4,

      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('place_property_right');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '使用状态',
      dataIndex: 'useStatus',
      order: 4,

      ellipsis: true,
      search: false,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('place_use_status');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '交付状态',
      dataIndex: 'deliverStatus',

      // filters: true,
      search: false,
      // onFilter: true,
      ellipsis: true,
      order: 1,
      valueType: 'select',
      request: async () => {
        const res = await getResourceEnum('place_deliver_status');
        return res.data.map((i) => ({
          value: i.code,
          label: i.message,
        }));
      },
    },
    {
      title: '生效状态',
      dataIndex: 'state',
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
      // onFilter: true,
      // ellipsis: true,
      order: 1,
      valueType: 'select',
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
        <Access key="edit" accessible={access.functionAccess('masdata_editStall')}>
          <a
            key="edit"
            type="link"
            onClick={() => {
              history.push(`/base-center/parking-space/stall/edit?id=${record.id}`);
            }}
          >
            编辑
          </a>
        </Access>,
      ],
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    const msg = await getParkingQueryByPage({
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
            accessKey: 'masdata_houseBatchImport',
            onClick: () => {
              history.push({
                pathname: `/base-center/parking-space/batch-import`,
                query: {
                  businessId: parkingSpace.id,
                  businessType: '2',
                  path: parkingSpace.path,
                  projectBid: project?.bid,
                },
              });
            },
          },
          {
            key: 'del',
            text: '删除',
            accessKey: 'masdata_deleteImport',
            onClick: deleteRow,
          },
          {
            key: 'delAll',
            text: '全部删除',
            accessKey: 'masdata_deleteImport',
            onClick: deleteAll,
          },
        ]}
      />
    );
  };
  return (
    <ProTable<ParkingPlaceListType>
      columns={columns}
      ghost={true}
      className={styles.tableStyle}
      actionRef={actionRef}
      cardBordered
      request={getByPage}
      rowSelection={rowSelection}
      rowKey="id"
      form={{
        colon: false,
      }}
      search={
        {
          labelWidth: 80,
          labelAlign: 'left',
        } as any
      }
      pagination={{
        showSizeChanger: true,
      }}
      tableAlertRender={false}
      headerTitle={headerTitle()}
      toolBarRender={() => [
        <Access key="add" accessible={access.functionAccess('masdata_addStall')}>
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              history.push(`/base-center/parking-space/stall/add`);
            }}
          >
            新建车位
          </Button>
        </Access>,
      ]}
    />
  );
};
