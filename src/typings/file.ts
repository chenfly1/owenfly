type GenerateUrlParams = {
  bussinessId: string;
  urlList: {
    objectId: string;
    expireTime?: number;
    contentType?: string;
  }[];
};

interface GenerateUrl {
  bussinessId: string;
  urlList: {
    objectId: string;
    expireTime?: number;
    presignedUrl: {
      url: string;
      fileRecordId: string;
      headers: Record<string, string>;
    };
  }[];
}

interface DownloadTemplateParam {
  businessType: number;
}

interface DownloadTemplate {
  fileUrl: string;
}

interface ImportMainDataFileParams {
  projectBid?: string;
  fileName?: string;
  businessType?: number;
  objectId?: string;
}
interface ImportMainDataFile {
  correct: number;
  error: number;
  errorFileUrl: string;
}

interface ImportMainDataFileListParams extends ReqPage {
  projectBid?: number;
  businessType?: number;
  name?: string;
  start?: number;
  end?: number;
  operator?: string;
}

interface ImportMainDataFileList {
  id?: number;
  name?: number;
  businessType?: string;
  fileUrl?: string;
  gmtCreator?: string;
  gmtCreated?: string;
}
interface ImportMainDataFileListType {
  objectId: string;
  bid: string;
  genGetUrl: string;
}

interface userCheckParamsType {
  headRowNumber: number; // excel头所在的行号（从1开始）
  skipRowCount: number; //  headRowNumber后要跳过的行数
  excel: string; // 文件路径
  params: Record<string, any>; // excel头所在的行号（从1开始）
}
interface userCheckResultType {
  successCount: number; // 成功数量
  failureCount: number; //  失败数量
  errorFileUrl?: string;
}
