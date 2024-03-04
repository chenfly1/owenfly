interface Result {
  code: string;
  message: string;
}

// * 请求响应参数(包含data)
interface ResultData<T> extends Result {
  data: T;
}

// * 请求响应参数(包含data)
interface ResultPageData<T> extends Result {
  data: {
    items: T[];
    page: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPage: number;
    };
  };
}

// * 分页响应参数
interface ResultDataPage<T> extends Result {
  data?: {
    items?: T[];
    list?: T[];
    page: ReqPage;
  };
}

// * 分页请求参数
interface ReqPage {
  totalPage?: number;
  totalItems?: number;
  page: number;
  pageSize: number;
}
