import { request } from 'umi';

const { HIDE_GETEWAY } = process.env;

const security = HIDE_GETEWAY ? '' : '/security';

export async function login(data: string, options?: Record<string, any>) {
  return request<ResultData<LoginResult>>(`${security}/oauth2/token`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function getUserInfo(options?: Record<string, any>): Promise<ResultData<UserInfo>> {
  return request<ResultData<UserInfo>>(`${security}/oauth2/userinfo`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取手机验证码 */
export async function getCaptcha(data: Record<string, any>): Promise<ResultData<string>> {
  return request<ResultData<string>>('/wps/api/v1/tenantInfo/captcha', {
    method: 'POST',
    data,
  });
}

/**
 * 获取手机验证码
 */
export async function verifyCode(params: VerifyCode): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/verify_code`, {
    method: 'GET',
    params,
  });
}

/**
 * 校验手机验证码
 */
export async function checkVerifyCode(data: VerifyCode): Promise<ResultData<string>> {
  return request<ResultData<string>>(`${security}/verify_code`, {
    method: 'POST',
    data,
  });
}

/**
 *根据验证码设置密码
 * @param params
 * @returns
 */
export async function captchaPassword(data: ForgetPassword): Promise<Result> {
  return request<Result>(`${security}/account/update/captcha/password`, {
    method: 'POST',
    data,
  });
}

/*
登录校验
*/
export async function loginAuthVerify(
  data: string,
  options?: Record<string, any>,
): Promise<ResultData<LoginAuthVerifyRes>> {
  return request<ResultData<LoginAuthVerifyRes>>(`${security}/login_auth/verify`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 *选择账号登录
 * @param params
 * @returns
 */
export async function loginAuthLogin(data: {
  preLoginCode: string;
  userBid: string;
}): Promise<Result> {
  return request<Result>(`${security}/login_auth/login`, {
    method: 'POST',
    data,
  });
}

/**
 * 查询所有账号信息
 * @param params
 * @returns
 */
export async function authAccountList(): Promise<ResultData<AccountListRes[]>> {
  return request<ResultData<AccountListRes[]>>(`${security}/auth/account/list`, {
    method: 'GET',
  });
}

/**
 * 选择账号登录
 * @param params
 * @returns
 */
export async function loginAuth(data: { userBid: string }): Promise<ResultData<LoginResult>> {
  return request<ResultData<LoginResult>>(`${security}/auth/account/switch`, {
    method: 'POST',
    data,
  });
}
