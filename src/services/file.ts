import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const filesv = HIDE_GETEWAY ? '' : '/filesv';

/** 获取临时上传文件的URL */
export async function generatePutUrl(data: GenerateUrlParams) {
  type NewType = ResultData<GenerateUrl>;

  return request<NewType>(`${filesv}/api/v1/op/generatePutUrl `, {
    method: 'POST',
    data,
  });
}

export async function generateGetUrl(data: GenerateUrlParams) {
  return request<ResultData<GenerateUrl>>(`${filesv}/api/v1/op/generateGetUrl `, {
    method: 'POST',
    data,
  });
}

export async function downloadTemplate(data: DownloadTemplateParam) {
  return request<ResultData<DownloadTemplate>>('/wmda/api/v1/import_template/downloadTemplate', {
    method: 'POST',
    data,
  });
}

export async function importMainData(data: ImportMainDataFileParams) {
  return request<ResultData<ImportMainDataFile>>('/mda/api/v1/import_record/importExcel', {
    method: 'POST',
    data,
  });
}

export async function importMainDataVerifiction(data: ImportMainDataFileParams) {
  return request<ResultData<ImportMainDataFile>>('/mda/api/v1/import_record/checkExcel', {
    method: 'POST',
    data,
  });
}

export async function getImportMainDataFileList(
  data: Record<string, any>,
): Promise<ResultPageData<ImportMainDataFileList>> {
  return request('/mda/api/v1/import_record/queryByPage', {
    method: 'POST',
    data,
  });
}

export async function getSucccessFileList(
  data: Record<string, any>,
): Promise<ResultData<ImportMainDataFileListType[]>> {
  return request('/filesv/api/v1/op/successFileList', {
    method: 'POST',
    data,
  });
}

export async function getMainDataErroFile(key: string) {
  return request(`/mda/api/v1/import_record/exportError/${key}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/xlsx; charset=UTF-8',
    },
    responseType: 'blob',
  });
}
