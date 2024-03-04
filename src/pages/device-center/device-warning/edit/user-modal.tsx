import { Button, Modal, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import { roleQueryByPage, userQueryByPage } from '@/services/auth';
import DataMasking from '@/components/DataMasking';

type IProps = {
  open: boolean;
  data: Record<string, any>;
  onOpenChange: (open: boolean) => void;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  console.log(orgBidList);
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);

  const handleRowSelectionChange = (selectedRowKey: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKey);
    setSelectedRow(selectedRows);
  };

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);

  const onOk = () => {
    if (selectedRowKeys.length === 0) return message.warning('请选择人员');
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.state = 'NORMAL';
    params.orgBid = orgBidList.join(',');
    const res = await userQueryByPage({ params });
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const queryRoles = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1000,
    };
    const res = await roleQueryByPage({ params });
    return (res.data?.items || []).map((item) => ({
      label: item.name,
      value: item.bid,
    }));
  };

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      search: false,
      ellipsis: true,
    },
    {
      title: '用户账号',
      dataIndex: 'account',
      ellipsis: true,
    },
    {
      title: '用户手机号',
      dataIndex: 'mobile',
      ellipsis: true,
      render: (_, record) => {
        return [<DataMasking key="onlysee" text={record.mobile} />];
      },
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: '组织',
      dataIndex: 'orgs',
      ellipsis: true,
      search: false,
      render: (node, row) => {
        const orgNameList = row.orgs?.map((item: any) => item?.name);
        return orgNameList?.join('；');
      },
    },
    {
      title: '角色',
      key: 'rolesTexts',
      dataIndex: 'user',
      ellipsis: true,
      hideInSearch: true,
      render: (node, row) => {
        return row.rolesTexts?.join('；');
      },
    },
    {
      title: '角色',
      key: 'roleBid',
      dataIndex: 'user',
      hideInTable: true,
      valueType: 'select',
      request: queryRoles,
      render: (node, row) => {
        return row.rolesTexts?.join('；');
      },
    },
    {
      title: '用户状态',
      dataIndex: 'state',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        NORMAL: {
          text: '可用',
          status: 'Success',
        },
        BAND: {
          text: '禁用',
          status: 'Error',
        },
      },
    },
  ];
  return (
    <Modal
      title="项目自定义用户"
      open={open}
      width={'70%'}
      centered
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={onOk}>
          确定
        </Button>,
      ]}
    >
      <ProTable<Record<string, any>>
        actionRef={actionRef}
        columns={columns}
        options={false}
        scroll={{ y: 400 }}
        form={{
          colon: false,
        }}
        rowKey="id"
        // cardBordered
        request={queryList}
        dateFormatter="string"
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true, // 翻页记录上一页数据
          onChange: handleRowSelectionChange,
        }}
      />
    </Modal>
  );
};

export default Add;
