import { request } from 'umi';

/** 适用标准请求响应数据场景，消除 code 判断逻辑 */
const simpleReq = <T>(url: any, options: Record<string, any>) => {
  return new Promise<T>((resolve, reject) => {
    request<ResultData<T>>(url, options)
      .then((res) => {
        if (res.code === 'SUCCESS') {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((err) => reject(err));
  });
};
