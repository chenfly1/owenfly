import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef } from 'react';
import { parkPassDetailRank } from '@/services/bi';

type IProps = {
  open: boolean;
  data: Record<string, any>;
  onOpenChange: (open: boolean) => void;
};

const App: React.FC<IProps> = ({ open, onOpenChange, data }) => {
  const actionRef = useRef<ActionType>();

  useMemo(async () => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);
  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      projectIds: data.projectIds,
      start: data.dates[0],
      end: data.dates[1],
      type: data.type,
    };
    const res = await parkPassDetailRank(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<AuthVehicStaticType>[] = [
    {
      title: '排名',
      dataIndex: 'index',
      search: false,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      search: false,
    },
    {
      title: '项目编号',
      dataIndex: 'projectId',
      search: false,
    },
    {
      title: '车场数量',
      dataIndex: 'parkAmount',
      search: false,
    },
    {
      title: data.type === '0' ? '进场通行次数' : '离场通行次数',
      dataIndex: 'amount',
      search: false,
    },
  ];
  return (
    <Modal
      title="通行频次排名TOP10"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={null}
    >
      <ProTable<AuthVehicStaticType>
        actionRef={actionRef}
        columns={columns}
        search={false}
        rowKey="index"
        cardBordered
        form={{
          colon: false,
        }}
        pagination={{
          defaultPageSize: 10,
        }}
        request={queryList}
        options={false}
        tableAlertRender={false}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default App;
