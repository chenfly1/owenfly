import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Badge, List, Space } from 'antd';
import Style from './index.less';
import { useState } from 'react';
import Detail from '../detail';

const netStateMap: Record<string, any> = {
  1: {
    text: '在线',
    status: 'success',
  },
  0: {
    text: '离线',
    status: 'error',
  },
};

export default ({ source }: { source: devicesListType }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});

  // 查看详情
  const check = () => {
    // window.open(`/device-center/details/${source.id}`, '_blank');
    setOpen(true);
    setModalData(source);
  };

  return (
    <>
      <List
        size="small"
        className={Style.device_map_tooltip}
        footer={
          <a className={Style.device_map_tooltip_footer} onClick={check}>
            查看详情 &gt;
          </a>
        }
        split={false}
        dataSource={[
          `上游ID: ${source.did}`,
          `设备类型：${source.typeName}`,
          `产品型号：${source.model}`,
          `关联空间：${source.spaceName}`,
          `位置描述：${source.positionDescription}`,
          `IP地址: ${source.ip ?? ''}`,
          () => {
            const status = `${source?.status ?? ''}`;
            const match = netStateMap[status];
            return (
              <span>
                网络状态:
                {match ? (
                  <Badge className="ml-10" text={match.text} status={match.status} />
                ) : (
                  '123'
                )}
              </span>
            );
          },
        ]}
        renderItem={(item) => (
          <List.Item style={{ color: '#fff' }}>
            {typeof item === 'string' ? item : item()}
          </List.Item>
        )}
      />
      <Detail open={open} onOpenChange={setOpen} data={modalData} />
    </>
  );
};
