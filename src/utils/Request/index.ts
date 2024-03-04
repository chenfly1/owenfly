import { notification, message } from 'antd';
import type { ResponseError } from 'umi-request';
import { storageSy } from '@/utils/Setting';
import { HttpMessage, CodeMessage } from './constant';
import { history, request } from 'umi';
import { stringify } from 'querystring';
import JSONbig from 'json-bigint';

const JSONbigString = JSONbig({ storeAsString: true });
/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    localStorage.clear();
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};

/**请求拦截 */
export const requestInterceptors: any = (url: string, options: RequestInit) => {
  const token = JSON.parse(localStorage.getItem(storageSy.token) as string);
  const urlList = url.split('https://');
  const urlReplace = urlList.length > 2 ? urlList[2] : urlList[1];
  options.headers = {
    access_token: token ? token : '',
    xtoken: token ? token : '',
    ...options.headers,
  };
  return { url: `https://${urlReplace}`, options };
};

// 响应拦截
export const responseInterceptors: any = async (response: Response, options: any) => {
  if (!response) {
    notification.error({
      description: '你的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
    return;
  }
  if (options.responseType === 'blob') {
    return response.blob();
  }

  const data = JSONbigString.parse(await response.clone().text());
  if (
    [CodeMessage.TKN0003, CodeMessage.TKN0001, CodeMessage.NOT_AUTHENTICATION].includes(data.code)
  ) {
    localStorage.clear();
    loginOut();
    return message.error(data.message);
  }

  if (data.code !== CodeMessage.SUCCESS) {
    message.error(data.message);
  }
  return data;
};

// return JSONbig.parse(await response.clone().text());

const codeMessage = HttpMessage;

/**
 * 异常处理程序
 */
export const errorHandler = (error: ResponseError) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }
  if (!response) {
    notification.error({
      description: '你的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};

/** 适用标准请求响应数据场景，消除 code 判断逻辑 */
export const simpleReq = <T>(url: any, options: Record<string, any>) => {
  return new Promise<T>((resolve, reject) => {
    request<ResultData<T>>(url, options)
      .then((res: any) => {
        if (res.code === 'SUCCESS') {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((err: any) => reject(err));
  });
};

// 转为标准响应格式
export const patchReq = <T extends { data: any }>(
  req: (params?: any) => Promise<T>,
): Promise<T['data']> => {
  return new Promise((resolve, reject) => {
    req()
      .then((res: any) => {
        if (res.code === 'SUCCESS') {
          resolve(res.data as T['data']);
        } else {
          reject(res);
        }
      })
      .catch((err: any) => reject(err));
  });
};

/** 获取全量的分页数据 */
export const getTotalPageSource = async <T>(
  pageReq: (
    params: { pageNo: number; pageSize: number } & Record<string, any>,
  ) => Promise<ResultPageData<T>['data']>,
  params: { pageNo: number; pageSize: number } & Record<string, any>,
  source: T[] = [],
): Promise<ResultPageData<T>['data']> => {
  try {
    const res = await pageReq(params);
    const newSource = source.concat(res?.items || []);
    if (res?.page?.totalItems) {
      if (res.page.totalItems > newSource.length) {
        await getTotalPageSource<T>(pageReq, { ...params, pageNo: params.pageNo + 1 }, newSource);
      }
    }
    return {
      items: newSource,
      page: res.page,
    };
  } catch (err) {
    console.log(err);
    return {
      items: source,
      page: {
        page: 0,
        pageSize: 0,
        totalItems: 0,
        totalPage: 0,
      },
    };
  }
};
