import {
  NoticeBoxType,
  NoticeStatus,
  WorkorderQueryField,
  WorkorderQueryType,
  WorkorderStatus,
} from '@/components/NoticeBox/config';
import { getNoticeList, getNoticeTypes } from '@/services/notice';
import { workOrderQuery } from '@/services/workorder';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';

const generateListValue = () => ({ list: [], total: 0, loading: false });
type NoticeBoxItemType = Pick<NoticeItemType, 'id' | 'typeDesc' | 'title' | 'gmtCreated'>;
type NoticeBoxListType = { list: NoticeBoxItemType[]; total: number } & { loading?: boolean };

export default () => {
  const noticeTypeMap = useRef<Record<string, string>>();
  const [noticeList, setNoticeList] = useState(generateListValue() as NoticeBoxListType);
  const [todoList, setTodoList] = useState(generateListValue() as NoticeBoxListType);

  /** 获取消息类型映射 */
  const getNoticeTypeMap = async (): Promise<Record<string, string>> => {
    if (noticeTypeMap.current) return noticeTypeMap.current;
    const res = await getNoticeTypes().catch(() => {});
    if (res?.code === 'SUCCESS') {
      noticeTypeMap.current = (res?.data || []).reduce(
        (prev, curr) => ({
          ...prev,
          [curr.code]: curr.name,
        }),
        {},
      );
      return noticeTypeMap.current;
    }
    return {};
  };

  /** 获取消息数据 */
  const getList = async (type: NoticeBoxType) => {
    // 显示前三条记录
    const params = { pageNo: 1, pageSize: 99 };
    // 获取消息列表
    if (type === NoticeBoxType.notice) {
      const types = await getNoticeTypeMap();
      const res = await getNoticeList({ ...params, status: NoticeStatus.Unread }).catch(() => {});
      return {
        list: (res?.data?.items || []).map((item) => ({
          ...item,
          typeDesc: types?.[item.type] || '',
        })),
        total: res?.data?.page?.totalItems || 0,
      };
    }
    // 获取并处理待办列表
    const [selfRes, groupRes] = await Promise.all([
      workOrderQuery({
        ...params,
        status: WorkorderStatus.Processing,
        queryType: WorkorderQueryType.SelfApprove,
        orderField: WorkorderQueryField.gmtUpdated,
        allProject: true,
      }).catch(() => {}),
      workOrderQuery({
        ...params,
        status: WorkorderStatus.Pending,
        queryType: WorkorderQueryType.GroupTodo,
        orderField: WorkorderQueryField.gmtUpdated,
        allProject: true,
      }).catch(() => {}),
    ]);
    return {
      list: (selfRes?.data?.items || [])
        .concat(groupRes?.data?.items || [])
        .map(({ id, categoryName, gmtCreated, gmtUpdated, description }) => ({
          id: `${id}`,
          typeDesc: categoryName,
          title: description,
          gmtCreated: gmtUpdated || gmtCreated,
        }))
        .sort((prev, next) => dayjs(next.gmtCreated).valueOf() - dayjs(prev.gmtCreated).valueOf())
        .slice(0, 3),
      total: (selfRes?.data?.page?.totalItems || 0) + (groupRes?.data?.page?.totalItems || 0) || 0,
    };
  };

  /** 更新消息数据 */
  const updateSource = async (type: NoticeBoxType) => {
    const updateFn = type === NoticeBoxType.notice ? setNoticeList : setTodoList;
    updateFn((prev) => ({ ...prev, loading: true }));
    const source = await getList(type);
    updateFn({ ...source, loading: false });
  };

  return {
    noticeList,
    setNoticeList,
    todoList,
    setTodoList,
    updateSource,
  };
};
