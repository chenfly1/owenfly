// import { storageSy } from '../Setting';

/** 获取当前项目bid */
export const getProjectBid = () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  return project?.bid || '';
};

/** 清除无用key */
export function deleteEmptyKey(params: any) {
  params.pageNo = params.current;
  for (const key in params) {
    if (params[key] == '' || key == 'current') {
      delete params[key];
    }
  }
}
