import { request } from 'umi';

/** A端 */
/** 渠道分页列表 */
export async function getNoticeChannelList(data?: Record<string, any>) {
  return request<ResultPageData<Record<string, any>>>('/nty/api/v1/channel/list', {
    method: 'POST',
    data,
  });
}

/** A端 */
/** 渠道分页列表 */
export async function getNoticeChannelList2(data?: Record<string, any>) {
  return request<ResultData<Record<string, any>[]>>('/nty/api/v1/channel/tenant/owner/list', {
    method: 'POST',
    data,
  });
}

/** 渠道类型下拉列表 */
export async function getNoticeTypeList(data?: Record<string, any>) {
  return request<ResultData<NoticeItemType[]>>('/nty/api/v1/channel/type/list', {
    method: 'POST',
    data,
  });
}

/** 添加渠道 */
export async function addNoticeChannel(data?: Record<string, any>) {
  return request<ResultPageData<NoticeItemType>>('/nty/api/v1/channel/add', {
    method: 'POST',
    data,
  });
}

/** 编辑渠道 */
export async function updateNoticeChannel(data?: Record<string, any>) {
  return request<ResultPageData<NoticeItemType>>('/nty/api/v1/channel/update', {
    method: 'POST',
    data,
  });
}
/** 渠道详情 */
export async function detailNoticeChannel(data?: Record<string, any>) {
  return request<ResultData<NoticeItemType>>(`/nty/api/v1/channel/detail/${data?.id}`, {
    method: 'POST',
    data,
  });
}

/** 删除渠道 */
export async function deleteNoticeChannel(data?: Record<string, any>) {
  return request<ResultPageData<NoticeItemType>>('/nty/api/v1/channel/delete', {
    method: 'POST',
    data,
  });
}

/** 分配租户 */
export async function addNoticeTenant(data?: Record<string, any>) {
  return request<ResultData<void>>('/nty/api/v1/channel/tenant/add', {
    method: 'POST',
    data,
  });
}

/** 获取消息模板列表 */
export async function getNoticeTempList(data: Record<string, any>) {
  return request<ResultPageData<NoticeTempType[]>>('/nty/api/v1/template/list', {
    method: 'POST',
    data,
  });
}

/** 查看单个模板详情 */
export async function getNoticeTempDetail(data: Record<string, any>) {
  return request<ResultData<NoticeTempDetail>>(`/nty/api/v1/template/${data.id}`, {
    method: 'POST',
    data,
  });
}

/** 新建模板 */
export async function addNoticeTemp(data: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/template/add`, {
    method: 'POST',
    data,
  });
}

/** 编辑模板 */
export async function updateNoticeTemp(data: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/template/update`, {
    method: 'POST',
    data,
  });
}

/** 消息模板禁用启用 */
export async function updateStatusNoticeTemp(data: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/template/updateStatus`, {
    method: 'POST',
    data,
  });
}

/** 消息模板删除 */
export async function deleteNoticeTemp(data: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/template/delete`, {
    method: 'POST',
    data,
  });
}

/** 微信模板 */
export async function webChartTempList(data?: Record<string, any>) {
  return request<ResultData<WebChartTempType[]>>(`/nty/api/v1/third/wechat/template/list`, {
    method: 'POST',
    data,
  });
}

/** 消息日志 */
export async function getNoticeLog(data?: Record<string, any>) {
  return request<ResultPageData<NoticeLogType>>(`/nty/api/v1/sendRecord/list`, {
    method: 'POST',
    data,
  });
}

/** 消息发送统计 */
export async function getSendStatisticList(data?: Record<string, any>) {
  return request<ResultPageData<SendStatisticList>>(`/nty/api/v1/sendStatistic/list`, {
    method: 'POST',
    data,
  });
}

/**  消息发送任务列表 */
export async function getNoticeTaskList(data?: Record<string, any>) {
  return request<ResultPageData<NoticeTaskType>>(`/nty/api/v1/sendTask/list`, {
    method: 'POST',
    data,
  });
}
/** 新建消息发送任务 */
export async function addNoticeTask(data?: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/sendTask/add`, {
    method: 'POST',
    data,
  });
}
/** 消息发送任务开启关闭 */
export async function updateNoticeTaskStatus(data?: Record<string, any>) {
  return request<ResultData<void>>(`/nty/api/v1/sendTask/updateStatus`, {
    method: 'POST',
    data,
  });
}
/**  消息发送任务删除 */
export async function deleteNoticeTask(data?: Record<string, any>) {
  return request<ResultPageData<void>>(`/nty/api/v1/sendTask/delete`, {
    method: 'POST',
    data,
  });
}

/**  消息发送任务详情 */
export async function detailNoticeTask(data?: Record<string, any>) {
  return request<ResultData<DetailNoticeTaskType>>(`/nty/api/v1/sendTask/detail`, {
    method: 'POST',
    data,
  });
}

/**  消息内容类目列表 */
export async function getNoticeCategoryList(data?: Record<string, any>) {
  return request<ResultData<{ bid: string; name: string }[]>>(
    `/nty/api/v1/msg/content/category/list`,
    {
      method: 'POST',
      data,
    },
  );
}

/**  消息内容变量列表 */
export async function getNoticeVariableList(data?: Record<string, any>) {
  return request<ResultData<{ bid: string; name: string; nameDesc: string }[]>>(
    `/nty/api/v1/msg/content/variable/list`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 测试消息发送 */
export async function noticeTest(data?: Record<string, any>) {
  return request<ResultData<NoticeType[]>>('/nty/api/v1/msg/test', {
    method: 'POST',
    data,
  });
}
/** 短信模板 */
export async function getListSmsTemplate(data?: Record<string, any>) {
  return request<ResultData<NoticeType[]>>('/nty/api/v1/query/listSmsTemplate', {
    method: 'POST',
    data,
  });
}
/** 批量删除模板 */
export async function batchDeleteNotTemplate(data?: Record<string, any>) {
  return request<ResultData<void>>('/nty/api/v1/template/batchDelete', {
    method: 'POST',
    data,
  });
}

/** 消息分页列表 */
export async function getNoticeList(params?: Record<string, any>) {
  return request<ResultPageData<NoticeItemType>>('/notice/auth/mng/notice/page', {
    method: 'GET',
    params,
  });
}

/** 设置消息已读 */
export async function readNotice(id: string) {
  return request<ResultData<void>>(`/notice/auth/mng/notice/read/${id}`, {
    method: 'PUT',
  });
}

/** 批量设置消息已读 */
export async function batchReadNotice(ids: string[]) {
  return request<ResultData<void>>(`/notice/auth/mng/notice/read_batch`, {
    method: 'POST',
    data: { ids },
  });
}

/** 设置通知全部已读 */
export async function allReadNotice() {
  return request<ResultData<void>>(`/notice/auth/mng/notice/read_all`, {
    method: 'POST',
  });
}

/** 获取消息类型 */
export async function getNoticeTypes() {
  return request<ResultData<NoticeType[]>>('/notice/auth/mng/notice/all_type', {
    method: 'GET',
  });
}
