export function ReadSerialNumber() {
  const commond = [
    0xca,
    0x0a,
    0x0a,
    0x00,
    0x00, //帧头
    0x01,
    0x01, //数据长度
    0x10, //控制码
    0x00, //异或校验
    0xac,
  ]; //帧尾;
  return bbc(commond);
}

export function ReadBlock(block: number) {
  const commond = [
    0xca,
    0x0a,
    0x0a,
    0x00,
    0x00, //帧头
    0x02,
    0x02, //数据长度
    0x08, //控制码
    0x00,
    0x00, //异或校验
    0xac,
  ]; //帧尾;
  commond[8] = block;
  return bbc(commond);
}
export function WriteBlock(data: number[]) {
  if (data.length != 17) {
    throw new Error('data length is not 17');
  }
  const commond = [
    0xca,
    0x0a,
    0x0a,
    0x00,
    0x00, //帧头
    0x12,
    0x12, //数据长度
    0x09, //控制码
    ...data, //数据内容
    0x00, //异或校验
    0xac,
  ]; //帧尾;
  return bbc(commond);
}
/**
 * 加载发卡器密码
 * @param password 密码
 * @returns
 */
export function LoadPassword(password: number[]) {
  if (password.length != 6) {
    throw new Error('password length is not 6');
  }
  const commond = [
    0xca,
    0x0a,
    0x0a,
    0x00,
    0x00, //帧头
    0x07,
    0x07, //数据长度
    0x14, //控制码
    ...password, //数据内容
    0x00, //异或校验
    0xac,
  ]; //帧尾;
  return bbc(commond);
}
/**
 * 发命令异或校验
 * @param commond 命令
 * @returns 添加异或校验后的命令
 */
export function bbc(commond: number[]) {
  if (commond.length < 10) {
    throw new Error('commond length is too short');
  }
  let a: number = 0;
  for (let i = 7; i < commond.length - 2; i++) {
    a = a ^ commond[i];
  }
  commond[commond.length - 2] = a;
  return commond;
}
/**
 * 接收数据异或校验
 * @param commond 命令
 * @returns 添加异或校验后的命令
 */
export function responseBbc(commond: number[]) {
  if (commond.length < 10) {
    throw new Error('commond length is too short');
  }
  let a: number = 0;
  for (let i = 5; i < commond.length - 2; i++) {
    a = a ^ commond[i];
  }
  commond[commond.length - 2] = a;
  return commond;
}
/**
 * @description: 16进制字符串转10进制
 * @param {string} str 字符串
 * @return {*}
 */
export function HexStringToBytes(str: string) {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }
  return parseInt(bytes.join(''));
}
