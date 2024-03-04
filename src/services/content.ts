import { request } from 'umi';

/** 文章分页列表 */
export async function queryArticlePage(
  params: Record<string, any>,
): Promise<ResultPageData<ArticleContentPageType>> {
  return request<ResultPageData<ArticleContentPageType>>('/content/auth/content/article/page', {
    method: 'GET',
    params,
  });
}

/** 文章保存 */
export async function saveArticle(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/article/save', {
    method: 'POST',
    data,
  });
}

/** 文章详情 */
export async function getArticleDetails(id: number): Promise<ResultData<ArticleContentPageType>> {
  return request<ResultData<ArticleContentPageType>>(`/content/auth/content/article/detail/${id}`, {
    method: 'GET',
  });
}

/** 文章上下线 */
export async function onlineArticle(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/article/online', {
    method: 'POST',
    data,
  });
}

/** 文章关联话题 */
export async function relateArticle(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/article/relate', {
    method: 'POST',
    data,
  });
}

/** 文章列表 */
export async function articleList(
  params: Record<string, any>,
): Promise<ResultData<ArticleContentPageType[]>> {
  return request<ResultData<ArticleContentPageType[]>>('/content/auth/content/article/list', {
    method: 'GET',
    params,
  });
}

/** 话题分页列表 */
export async function queryTopicPage(
  params: Record<string, any>,
): Promise<ResultPageData<TopicContentPageType>> {
  return request<ResultPageData<TopicContentPageType>>('/content/auth/content/topic/page', {
    method: 'GET',
    params,
  });
}

/** 话题保存 */
export async function saveTopic(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/topic/save', {
    method: 'POST',
    data,
  });
}

/** 话题详情 */
export async function getTopicDetails(id: number): Promise<ResultData<TopicContentPageType>> {
  return request<ResultData<TopicContentPageType>>(`/content/auth/content/topic/detail/${id}`, {
    method: 'GET',
  });
}

/** 话题上下线 */
export async function onlineTopic(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/topic/online', {
    method: 'POST',
    data,
  });
}

/** 话题在线列表 */
export async function getTopicList(
  params: Record<string, any>,
): Promise<ResultData<TopicContentPageType[]>> {
  return request<ResultData<TopicContentPageType[]>>(`/content/auth/content/topic/list`, {
    method: 'GET',
    params: params,
  });
}

/** 内部作者分页列表 */
export async function queryAuthorPage(
  params: Record<string, any>,
): Promise<ResultPageData<authorContentPageType>> {
  return request<ResultPageData<authorContentPageType>>('/content/auth/content/author/page', {
    method: 'GET',
    params,
  });
}

/** 内部作者保存 */
export async function saveAuthor(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/author/save', {
    method: 'POST',
    data,
  });
}

/** 内部作者详情 */
export async function getAuthorDetails(id: number): Promise<ResultData<authorContentPageType>> {
  return request<ResultData<authorContentPageType>>(`/content/auth/content/author/detail/${id}`, {
    method: 'GET',
  });
}

/** 内部作者在线列表 */
export async function getAuthorList(
  params: Record<string, any>,
): Promise<ResultData<authorContentPageType[]>> {
  return request<ResultData<authorContentPageType[]>>(`/content/auth/content/author/list`, {
    method: 'GET',
    params,
  });
}

/** 内部作者上下线 */
export async function onlineAuthor(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/author/online', {
    method: 'POST',
    data,
  });
}

/** 营销计划分页列表 */
export async function queryPlanPage(
  params: Record<string, any>,
): Promise<ResultPageData<planContentPageType>> {
  return request<ResultPageData<planContentPageType>>('/content/auth/content/plan/page', {
    method: 'GET',
    params,
  });
}

/** 营销计划保存 */
export async function savePlan(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/plan/save', {
    method: 'POST',
    data,
  });
}

/** 营销计划详情 */
export async function getPlanDetails(id: number): Promise<ResultData<planContentPageType>> {
  return request<ResultData<planContentPageType>>(`/content/auth/content/plan/detail/${id}`, {
    method: 'GET',
  });
}

/** 营销计划上下线 */
export async function onlinePlan(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/content/plan/online', {
    method: 'POST',
    data,
  });
}

/** 营销计划检查 */
export async function planCheck(params: Record<string, any>) {
  return request<ResultData<planCheckType[]>>('/content/auth/content/plan/check', {
    method: 'GET',
    params,
  });
}

/** 活动保存 */
export async function saveActivity(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/content/activity/save', {
    method: 'POST',
    data,
  });
}

/** 活动分页列表 */
export async function queryActivityPage(
  params: Record<string, any>,
): Promise<ResultPageData<ActivityType>> {
  return request<ResultPageData<ActivityType>>('/content/auth/mng/content/activity/page', {
    method: 'GET',
    params,
  });
}

/** 活动详情 */
export async function getActivityDetails(id: string): Promise<ResultData<ActivityType>> {
  return request<ResultData<ActivityType>>(`/content/auth/mng/content/activity/detail/${id}`, {
    method: 'GET',
  });
}

/** 活动上下线 */
export async function activityOnline(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/content/activity/online', {
    method: 'POST',
    data,
  });
}

/** 活动成员分页列表 */
export async function queryActivityUserPage(
  params: Record<string, any>,
): Promise<ResultPageData<ActivityType>> {
  return request<ResultPageData<ActivityType>>('/content/auth/mng/content/activity_user/page', {
    method: 'GET',
    params,
  });
}

/** 批量帮业主报名 */
export async function activitySignUpBatch(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/mng/content/activity_user/sign_up_batch', {
    method: 'POST',
    data,
  });
}

/** 校验是否符合报名条件 */
export async function activitySignUpCheck(data: Record<string, any>): Promise<ResultData<any>> {
  return request<ResultData<any>>('/content/auth/mng/content/activity_user/sign_up_check', {
    method: 'POST',
    data,
  });
}

/** 活动取消报名 */
export async function activitySignUpCancel(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/app/content/activity_user/sign_up/cancel', {
    method: 'POST',
    data,
  });
}

/** 活动签到 */
export async function activitySignIn(data: Record<string, any>): Promise<Result> {
  return request<Result>('/content/auth/app/content/activity_user/sign_in', {
    method: 'POST',
    data,
  });
}
