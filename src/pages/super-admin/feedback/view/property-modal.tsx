import { Button, Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef } from 'react';
import { getFeedbackUserHousesPage } from '@/services/auth';
import DataMasking from '@/components/DataMasking';
import { getCustomerRoleEnums } from '@/services/mda';

type IProps = {
  open: boolean;
  data: Record<string, any>;
  onOpenChange: (open: boolean) => void;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const actionRef = useRef<ActionType>();

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);

  const queryList = async (params: any) => {
    const res = await getFeedbackUserHousesPage({
      ...params,
      id: data?.id,
      pageNo: params.current,
    });
    return {
      data:
        (res.data &&
          (res.data as any).map((i) => ({
            ...i,
            userName: data?.userName,
            tenant: data?.tenant,
          }))) ||
        [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data && (res.data as any).length,
    };
  };
  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '用户昵称',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      ellipsis: true,
      render: (_, record) => [<DataMasking key={record.mobile} text={record.mobile} />],
    },
    {
      title: '租户',
      dataIndex: 'tenant',
      ellipsis: true,
    },
    {
      title: '项目',
      dataIndex: 'project',
      ellipsis: true,
    },
    {
      title: '客户名称',
      dataIndex: 'propertyOwner',
      ellipsis: true,
    },
    {
      title: '产权',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '身份',
      dataIndex: 'role',
      ellipsis: true,
    },
    {
      title: '权限',
      dataIndex: 'authType',
      ellipsis: true,
    },
  ];
  return (
    <Modal
      title="查看关联产权信息"
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
          返回
        </Button>,
      ]}
    >
      <ProTable<Record<string, any>>
        actionRef={actionRef}
        columns={columns}
        search={false}
        options={false}
        scroll={{ y: 400 }}
        form={{
          colon: false,
        }}
        rowKey="id"
        // cardBordered
        request={queryList as any}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default Add;
