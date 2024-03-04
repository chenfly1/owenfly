import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef } from 'react';
import { authVehicStaticRank } from '@/services/bi';

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
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const queryList = async (p: any) => {
    const params = {
      ...p,
      pageNo: p.current,
      projectIds: data.projectIds,
      start: data.dates[0],
      end: data.dates[1],
    };
    const res = await authVehicStaticRank(params);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };
  const columns: ProColumns<AuthVehicStaticRankType>[] = [
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
      dataIndex: 'projectCode',
      search: false,
    },
    {
      title: '车场数量',
      dataIndex: 'parkCount',
      search: false,
    },
    {
      title: '车辆总数',
      dataIndex: 'total',
      search: false,
    },
    {
      title: '产权车辆总数',
      dataIndex: 'property',
      search: false,
    },
    {
      title: '月租车辆总数',
      dataIndex: 'moth',
      search: false,
    },
    {
      title: '免费车辆总数',
      dataIndex: 'fre',
      search: false,
    },
    {
      title: '其它车辆',
      dataIndex: 'other',
      search: false,
    },
    {
      title: '访客车辆',
      dataIndex: 'visitor',
      search: false,
    },
  ];
  return (
    <Modal
      title="车辆统计"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={null}
    >
      <ProTable<AuthVehicStaticRankType>
        actionRef={actionRef}
        columns={columns}
        search={false}
        rowKey="projectCode"
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
