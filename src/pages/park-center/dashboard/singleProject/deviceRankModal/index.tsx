import { Modal } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useRef } from 'react';
import { deviceOnlineRank } from '@/services/bi';

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
    };
    const res = await deviceOnlineRank(params);
    return {
      data: res.data.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page.totalItems,
    };
  };
  const columns: ProColumns<DeviceOnlineRankType>[] = [
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
      dataIndex: 'name',
      search: false,
    },
    {
      title: '车场名称',
      dataIndex: 'parkName',
      search: false,
    },
    {
      title: '在线设备数',
      dataIndex: 'online',
      search: false,
    },
    {
      title: '离线设备数',
      dataIndex: 'offline',
      search: false,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      search: false,
    },
  ];
  return (
    <Modal
      title="当前设备在线率"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      footer={null}
    >
      <ProTable<DeviceOnlineRankType>
        actionRef={actionRef}
        columns={columns}
        search={false}
        rowKey="projectCode"
        cardBordered
        form={{
          colon: false,
        }}
        pagination={false}
        request={queryList}
        options={false}
        tableAlertRender={false}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default App;
