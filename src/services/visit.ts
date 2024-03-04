import { request } from 'umi';
import { getProjectBid } from '@/utils/project';

export enum passEnum {
  empty = '',
  ic = 'IC',
  bluetooth = '蓝牙',
  qrcode = '二维码',
  face = '人脸',
  id = 'ID',
}

function deleteEmptyKey(params: any) {
  params.pageNo = params.current;
  params.ownerProjectCode = getProjectBid();
  for (const key in params) {
    if (params[key] == '' || key == 'current') {
      delete params[key];
    }
  }
}

export function getPassTypeString(type: number): string {
  const passType = Object.values(passEnum);
  return type < 20 && type > 0 ? passType[type] : '-';
}

export async function visitApplyByPage(params: any) {
  deleteEmptyKey(params);

  const res = await request<ResultPageData<visitApplyItem>>('/door/auth/visitor/list', {
    method: 'GET',
    params,
  });
  return {
    data: res.data?.items || [],
    success: res.code === 'SUCCESS' ? true : false,
    total: res.data?.page?.totalItems,
  };
}

export async function visitApplyDetail(uuid: string) {
  return request<ResultData<visitApplyItem>>(`/door/auth/visitor/${uuid}`, {
    method: 'GET',
  });
}

export async function visitPassByPage(params: any) {
  deleteEmptyKey(params);

  const res = await request<ResultPageData<visitPassItem>>(
    '/door/auth/visitor/access_record/list',
    {
      method: 'GET',
      params,
    },
  );
  return {
    data: res.data?.items || [],
    success: res.code === 'SUCCESS' ? true : false,
    total: res.data?.page?.totalItems,
  };
}

export async function visitPassDetail(id: number) {
  return request<ResultData<visitPassItem>>(`/door/auth/visitor/access_record/${id}`, {
    method: 'GET',
  });
}
