import { useEffect, useState, useRef, createRef, useMemo } from 'react';
import { Badge, Button, Popover, Tabs } from 'antd';
import ItemWrapper from '../RightContent/ItemWrapper';
import { ReactComponent as NoticeSVG } from '@/assets/svg/notification.svg';
import { readNotice, allReadNotice } from '@/services/notice';
import { NoticeLabel, NoticeBoxItem } from './Item';
import { NoticeBoxItemType, NoticeBoxType, generateListValue } from './config';
import Visiblity from '@/utils/Method/visibility';
import type { DetailRef } from './NoticeDetail';
import NoticeDetail from './NoticeDetail';
import Style from './index.less';
import { useModel, useAccess } from 'umi';

// 最多显示数量
const maxCount = 3;

export default () => {
  const access = useAccess();
  const todoAuth = access.functionAccess('alitaMasdata_getWorkorderPage');
  const [activeKey, setActiveKey] = useState<NoticeBoxType>(
    todoAuth ? NoticeBoxType.todo : NoticeBoxType.notice,
  );
  const [loading, setLoading] = useState<Record<'read', boolean>>({ read: false });
  const { noticeList, setNoticeList, todoList, updateSource } = useModel('useNotice');
  const timerRef = useRef<{
    timer?: ReturnType<typeof setTimeout>;
    popoverState: boolean;
    pageState: boolean;
  }>({ popoverState: false, pageState: false });
  const detailRef = createRef<DetailRef>();

  /** 刷新消息数据，频次默认 10s */
  const refreshSource = (time = 10000) => {
    clearTimeout(timerRef.current.timer);
    timerRef.current.timer = setTimeout(async () => {
      if (!timerRef.current.popoverState && !Visiblity.isHidden()) {
        await Promise.all([updateSource(NoticeBoxType.notice), updateSource(NoticeBoxType.todo)]);
      }
      refreshSource();
    }, time);
  };

  /** 设置单条消息已读 */
  const readOne = (notice: NoticeBoxItemType) => {
    // 设置消息已读
    readNotice(notice.id)
      .then(() => {
        if (noticeList.total !== noticeList.list.length && noticeList.list.length <= maxCount) {
          updateSource(NoticeBoxType.notice);
        } else {
          setNoticeList((prev) => {
            return {
              ...prev,
              total: prev.total - 1,
              list: prev.list.filter((item) => item.id !== notice.id),
            };
          });
        }
      })
      .catch(() => null);
  };

  // 消息总数
  const count = noticeList?.total + todoList?.total || undefined;
  // Tab 操作区（全部已读操作）
  const tabBarExtraContent = useMemo(() => {
    return activeKey === NoticeBoxType.notice ? (
      <Button
        type="link"
        disabled={!noticeList?.total}
        loading={loading.read}
        onClick={() => {
          setLoading((prev) => ({ ...prev, read: true }));
          allReadNotice()
            .then((res) => {
              if (res.code === 'SUCCESS') {
                setNoticeList(generateListValue());
              }
            })
            .finally(() => {
              setLoading((prev) => ({ ...prev, read: false }));
            });
        }}
      >
        全部已读
      </Button>
    ) : null;
  }, [activeKey]);

  /** 初始加载消息数据 */
  useEffect(() => {
    updateSource(NoticeBoxType.notice);
    if (todoAuth) {
      updateSource(NoticeBoxType.todo);
    }
    // refreshSource()
    return () => {
      clearTimeout(timerRef.current.timer);
    };
  }, []);

  const todoItem = {
    key: NoticeBoxType.todo,
    label: <NoticeLabel title="待办" count={todoList.total} />,
    children: (
      <NoticeBoxItem
        source={todoList.list.slice(0, maxCount)}
        loading={todoList.loading}
        link="/workorder-center/list?type=base"
        onClick={(item) => {
          if (item?.id) {
            window.open(`/workorder-center/list/details-acceptance/${item.id}?type=base`, '_blank');
          }
        }}
      />
    ),
  };

  const noticeItem = {
    key: NoticeBoxType.notice,
    label: <NoticeLabel title="消息" count={noticeList.total} />,
    children: (
      <NoticeBoxItem
        warning={true}
        source={noticeList.list.slice(0, maxCount)}
        loading={noticeList.loading}
        link="/notice-center/notice-list?type=base"
        onClick={(item) => detailRef.current?.checkNotice(item as NoticeItemType)}
      />
    ),
  };

  return (
    <NoticeDetail ref={detailRef} onOpen={readOne}>
      <Popover
        placement="bottom"
        trigger="hover"
        overlayClassName={Style.noticeBox_popover}
        zIndex={999}
        showArrow={false}
        onOpenChange={(open) => {
          timerRef.current.popoverState = open;
        }}
        content={
          <Tabs
            activeKey={activeKey}
            defaultActiveKey={NoticeBoxType.todo}
            onChange={(key) => setActiveKey(key as NoticeBoxType)}
            tabBarExtraContent={tabBarExtraContent}
            items={todoAuth ? [todoItem, noticeItem] : [noticeItem]}
          />
        }
      >
        <Badge size="small" count={count} overflowCount={99}>
          <ItemWrapper style={{ lineHeight: '25px' }}>
            <NoticeSVG />
          </ItemWrapper>
        </Badge>
      </Popover>
    </NoticeDetail>
  );
};
