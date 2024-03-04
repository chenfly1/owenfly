import React from 'react';
import { Badge, List } from 'antd';
import { ReactComponent as NoticeNoDataSVG } from '@/assets/svg/notice_no_data.svg';
import Style from './index.less';

type NoticeBoxItemType = Pick<NoticeItemType, 'id' | 'typeDesc' | 'title' | 'gmtCreated'>;

/** 无消息展示内容 */
const NoticeNoData = React.memo(() => {
  return (
    <div className={Style.noticeBox_nodata}>
      <NoticeNoDataSVG />
      <span>暂无内容</span>
    </div>
  );
});

/** 消息盒子标签 */
export const NoticeLabel: React.FC<{ title: string; count?: number }> = React.memo((props) => {
  return (
    <>
      {props.title}
      {props.count ? `(${props.count})` : ''}
    </>
  );
});

/** 消息盒子主体 */
export const NoticeBoxItem = <T extends NoticeBoxItemType>({
  source,
  link,
  loading,
  onClick,
  warning,
}: React.PropsWithChildren<{
  source: T[];
  link?: string;
  loading?: boolean;
  warning?: boolean;
  onClick?: (record: T) => void;
}>) => {
  /** 查看全部访问链接 */
  const checkAll = () => {
    if (link) window.open(link, '_blank');
  };

  /** 查看指定消息记录 */
  const checkItem = (item: T) => () => {
    onClick?.(item);
  };

  return (
    <List
      bordered
      loading={loading}
      footer={link ? <a onClick={checkAll}>查看全部</a> : null}
      dataSource={source}
      renderItem={(item) => {
        return (
          <List.Item onClick={checkItem(item)}>
            <Badge dot={warning} offset={[5, 0]}>
              <h3 title={item.typeDesc} className="m-0 text-ellipsis">
                {item.typeDesc || <>&nbsp;</>}
              </h3>
            </Badge>
            <p title={item.title} className="m-0 text-ellipsis">
              {item.title || <>&nbsp;</>}
            </p>
            <span>{item.gmtCreated || <>&nbsp;</>}</span>
          </List.Item>
        );
      }}
    >
      {loading === false && !source?.length ? <NoticeNoData /> : null}
    </List>
  );
};
