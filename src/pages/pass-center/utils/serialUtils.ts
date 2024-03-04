import { message } from 'antd';

let port: any;
let reader: any;
let writer: any;
export type ConnectResult = 'CONNECTED' | 'DISCONNECTED';
export type CardIdRes = {
  id?: string[];
  result: 'NODATA' | 'SUCCESS';
};

export const initSerial = async (cb: (res: ConnectResult, portInfo?: string) => void) => {
  if ('serial' in navigator) {
    //向用户请求选择端口
    const serial = navigator.serial as any;
    console.log('init serial');
    try {
      port = await serial!.requestPort();
      const portInfo = JSON.stringify(port.getInfo());

      await port.open({ baudRate: 4800, dataBits: 8, stopBits: 1, parity: 'none' });

      writer = port.writable.getWriter();
      reader = port.readable.getReader();
      const data = new Uint8Array([
        0xca, 0x0a, 0x0a, 0x00, 0x00, 0x03, 0x03, 0x05, 0x4a, 0x81, 0xce, 0xac,
      ]);
      await writer.write(data);
      const serialResponse: number[] = [];
      while (true) {
        const { value, done } = await reader.read();
        value.map((item: number) => {
          serialResponse.push(item);
        });
        const length: number = serialResponse[4] - 2;
        if (
          serialResponse.length >= 7 + length + 2 &&
          serialResponse[6] === 0 &&
          serialResponse[serialResponse.length - 1] === 90
        ) {
          cb('CONNECTED', portInfo);
          break;
        }
        if (done) {
          reader.releaseLock();
          break;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      cb('DISCONNECTED');
      console.log('finally1223');
    }
  } else {
    message.error('浏览器不支持串口');
  }
};
export const sendCommand = (block: number[]) => {
  return new Promise(async (resolve, reject) => {
    const data = new Uint8Array(block);
    console.log(block);
    // const data = new Uint8Array([0xca, 0x0a, 0x0a, 0x00, 0x00, 0x01, 0x01, 0x10, 0x10, 0xac]);
    // reader = port.readable.getReader();
    await writer.write(data);
    const responseData: number[] = [];
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // |reader| has been canceled.
          break;
        }
        value.map((item: number) => {
          responseData.push(item);
        });
        console.log(responseData);
        const status: number = responseData[6];
        const length: number = responseData[4] - 2;
        const idNumber = responseData.slice(7, 7 + length);
        if (
          responseData.length >= 7 &&
          status !== 0 &&
          responseData[responseData.length - 1] === 90
        ) {
          resolve({
            result: 'NODATA',
          });
          break;
        } else if (
          responseData.length >= 7 + length + 2 &&
          status === 0 &&
          responseData[responseData.length - 1] === 90
        ) {
          resolve({
            id: idNumber
              .map((i) => (i.toString(16).length > 1 ? i.toString(16) : '0' + i.toString(16)))
              .slice(),
            result: 'SUCCESS',
          });
          break;
        }
      }
    } catch (error) {
      // Handle |error|...
    } finally {
      console.log('finally2');
      // reader.releaseLock();
    }
  });
};

export const close = async () => {
  reader.releaseLock();
  writer.releaseLock();
  console.log('允许稍后关闭串口。');
  await port.close();
};
