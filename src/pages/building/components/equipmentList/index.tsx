import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';

import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { getQueryByDevicePage } from '@/services/device';
import { Button, Col, Modal, Row, Switch } from 'antd';
import StatisticCard from '../StatisticCard';
import { ExclamationCircleFilled } from '@ant-design/icons';
import Detail from '../detail';

type IProps = {
  spaceId: string;
};

const App: React.FC<IProps> = ({ spaceId }) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [open, setOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});

  const reload = () => {
    actionRef.current?.reload();
  };
  useEffect(() => {
    reload();
  }, [spaceId]);

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await getQueryByDevicePage({
      ...params,
      // projectId: project?.bid,
      spaceId: spaceId,
      showSubordinates: true,
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

  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备编号',
      dataIndex: 'did',
      render: (_, row) => {
        return (
          <a
            onClick={() => {
              setModalData(row);
              setOpen(true);
            }}
          >
            {row.did}
          </a>
        );
      },
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '网络状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'Error',
        },
      },
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在线',
          status: 'Success',
        },
        0: {
          text: '离线',
          status: 'Error',
        },
      },
    },
    {
      title: '故障状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '正常',
          status: 'Success',
        },
        0: {
          text: '故障',
          status: 'Error',
        },
      },
    },
    {
      title: '送风温度',
      dataIndex: 'sn',
      ellipsis: true,
    },
    {
      title: '回风温度',
      dataIndex: 'sn',
      ellipsis: true,
    },
    {
      title: '自动状态',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: '自动',
        0: '手动',
      },
    },
    {
      title: '控制模式',
      dataIndex: 'status',
      ellipsis: true,
      render: (_, row) => {
        return (
          <Switch
            checkedChildren="自动"
            unCheckedChildren="手动"
            checked={row.status == '1' ? true : false}
            onChange={(e) => {
              Modal.confirm({
                title: e ? '是否设置设置为自动控制模式' : '是否设置设置为手动控制模式',
                icon: <ExclamationCircleFilled />,
                centered: true,
                onOk: async () => {},
              });
            }}
          />
        );
      },
    },
    {
      title: '开关控制',
      dataIndex: 'status',
      ellipsis: true,
      render: (_, row) => {
        return (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            defaultChecked
            onChange={(e) => {
              Modal.confirm({
                title: '确定是否同时设置为“手动控制模式”',
                content:
                  '控制开关前，需将控制模式设置为【手动】才可生效，确认是否同时设置为【手动控制模式】',
                icon: <ExclamationCircleFilled />,
                centered: true,
                onOk: async () => {},
              });
            }}
          />
        );
      },
    },
  ];

  return (
    <>
      <Row style={{ margin: '0 16px 0 16px' }} gutter={16} justify="space-between">
        <Col span={6}>
          <StatisticCard label="设备总数" value={1000} />
        </Col>
        <Col span={6}>
          <StatisticCard label="在线设备" value={1000} />
        </Col>
        <Col span={6}>
          <StatisticCard label="离线设备" value={1000} />
        </Col>
        <Col span={6}>
          <StatisticCard label="故障设备" value={1000} />
        </Col>
      </Row>
      <ProTable<devicesListType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage}
        rowKey="id"
        search={false}
        options={false}
        toolbar={{
          actions: [
            <Button
              key="addTask"
              type="ghost"
              onClick={() => {
                Modal.confirm({
                  title: '确定是否全部设置为“手动控制模式”',
                  content:
                    '控制开关前，需将控制模式设置为【手动】才可生效，确认是否将以下设备都设置为【手动控制模式】3层（选择空间关联设备）空间下的所有空调设备（未设置设备10台）',
                  icon: <ExclamationCircleFilled />,
                  centered: true,
                  onOk: async () => {},
                });
              }}
            >
              全部开启
            </Button>,
            <Button
              key="addTask"
              type="ghost"
              onClick={() => {
                Modal.confirm({
                  title: '确定是否全部设置为“手动控制模式”',
                  content:
                    '控制开关前，需将控制模式设置为【手动】才可生效，确认是否将以下设备都设置为【手动控制模式】3层（选择空间关联设备）空间下的所有空调设备（未设置设备10台）',
                  icon: <ExclamationCircleFilled />,
                  centered: true,
                  onOk: async () => {},
                });
              }}
            >
              全部关闭
            </Button>,
          ],
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
      <Detail open={open} onOpenChange={setOpen} data={modalData} />
    </>
  );
};
export default App;
