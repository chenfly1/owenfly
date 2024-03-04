import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Badge, List, Space } from 'antd';
import Style from './index.less';

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

export default ({
  source,
  editable,
  onRemove,
  onUpdate,
}: {
  editable?: boolean;
  source: devicesListType;
  onRemove: (source: devicesListType) => void;
  onUpdate: (source: devicesListType) => void;
}) => {
  // 查看详情
  const check = () => {
    window.open(`/device-center/details/${source.id}`, '_blank');
  };
  // 移除处理
  const remove = () => {
    onRemove(source);
  };

  // 更新处理
  const update = () => {
    onUpdate(source);
  };

  return (
    <>
      <List
        size="small"
        className={Style.device_map_tooltip}
        header={
          <div className={Style.device_map_tooltip_header}>
            <span>{source.name}</span>
            {editable ? (
              <Space>
                <DeleteOutlined className="text-danger ml-10" onClick={remove} />
                <EditOutlined onClick={update} />
              </Space>
            ) : null}
          </div>
        }
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
    </>
  );
};
