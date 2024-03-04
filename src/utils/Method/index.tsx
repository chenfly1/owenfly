import { Moment, getDate } from './date';
import { ExportExcel } from './tools';
import { request } from 'umi';
import Compressor from 'compressorjs';
import { generatePutUrl } from '@/services/file';
import { Modal, message } from 'antd';
/**
 * @module 公用方法
 *
 */
class Method {
  /**
   * @module 将数据转化为FormData对象
   * @param obj
   * @returns
   */
  static convertToFormData = (obj: any) => {
    const data = new FormData();
    Object.keys(obj).forEach((i) => {
      if (obj[i] === undefined) return;
      if (obj[i] instanceof FileList) {
        [].map.call(obj[i], (file) => data.append(i, file));
      } else if (
        obj[i] instanceof Array &&
        (obj[i][0] instanceof File ||
          (typeof obj[i][0] === 'string' && obj[i][0].indexOf('data') === 0) ||
          obj[i][0] instanceof FileList)
      ) {
        // 多张图片
        obj[i].forEach((item: any) => {
          if (item instanceof FileList) [].map.call(item, (file) => data.append(i, file));
          else data.append(i, item);
        });
      } else if ((typeof obj[i]).indexOf('object') >= 0) {
        if (
          obj[i] instanceof Array &&
          (obj[i][0] instanceof File || obj[i][0] instanceof FileList)
        ) {
          // 上传多张图片
          obj[i].forEach((item: any) => {
            if (item instanceof File) data.append(i, item);
            else [].map.call(item, (file) => data.append(i, file));
          });
        } else data.append(i, JSON.stringify(obj[i]));
      } else {
        data.append(i, obj[i]);
      }
    });
    return data;
  };

  /**
   * @module 树形数组
   *
   * @param arrList 数组集合
   * @param id 子id
   * @param fid 父id
   * @param children 将子id放入fid的名字，默认children
   */
  static ArrayTree = (allList: any[], id: string, fid: string, children: string = 'children') => {
    const deepList = JSON.parse(JSON.stringify(allList));
    let filterArr: any = [];
    const tree = deepList.map((parent: any) => {
      const item = deepList.filter((child: any) => parent[id] == child[fid]);
      if (item.length > 0) {
        parent[children] = item;
        filterArr = [...filterArr, ...item];
      }
      return parent;
    });

    const result: any = Method.ArrayTree(tree, filterArr, id);
    return result;
  };

  //base64转换为file类型
  /**
   * @module base64转换为file类型
   *
   * @param base64 base64
   * @param filename 文件名字
   */
  static base64toFile(base64: string, filename: string) {
    const arr: any = base64.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * @param image 图片
   * @param backType 需要返回的类型blob,file
   * @param quality 图片压缩比 0-1,数字越小，图片压缩越小
   * @param options 自定义压缩配置
   * @returns
   */
  static compressorImage(
    image: File,
    backType?: string,
    quality?: number,
    options?: Record<string, any>,
  ) {
    return new Promise((resolve, reject) => {
      new Compressor(image, {
        quality: quality || 0.8,
        success(result: any) {
          const file = new File([result], image.name, { type: image.type });

          if (!backType || backType == 'blob') {
            resolve(result);
          } else if (backType == 'file') {
            resolve(file);
          } else {
            resolve(file);
          }
        },
        ...options,
        error(err: any) {
          console.log('图片压缩失败---->>>>>', err);
          reject(err);
        },
      });
    });
  }

  /**
   * @param file 图片
   * @param maxSize 最大尺寸 默认500 单位kb
   * @return 返回新文件 file
   */

  static compressorImageBySize = async (file: File, maxSize = 500, fileType = 'file') => {
    const getImageSize = (yImage: File) => {
      return new Promise((resolve) => {
        const _URL = window.URL || window.webkitURL;
        const img = new window.Image();
        img.onload = () => {
          resolve(img);
        };
        img.src = _URL.createObjectURL(yImage);
      });
    };
    if (file.size > maxSize * 1024) {
      let time = 1;
      const fn: any = async (image: File, scale: number) => {
        const imageSize: any = await getImageSize(image);
        console.log('图片宽度', imageSize.width + 'px', '图片高度', imageSize.height + 'px');
        const newFile: any = await Method.compressorImage(image, fileType, 0.8, {
          width: imageSize.width * scale,
          height: imageSize.height * scale,
        });
        if (newFile.size > maxSize * 1024) {
          console.log(`第${time}次压缩后大小 比例`, parseInt(newFile.size / 1024) + 'kb', scale);
          time += 1;
          if (time < 10) {
            return await fn(newFile, scale * 0.9);
          } else {
            return Promise.resolve(newFile);
          }
        } else {
          return Promise.resolve(newFile);
        }
      };
      return await fn(file, 0.9);
    } else {
      return file;
    }
  };

  /**
   * @module 手机号脱敏、名字脱敏
   *
   * @param str 脱敏数据
   * @param type 脱敏类型
   */
  static onlySeeSome(str: string, type: string) {
    //str文本-type类型：name/姓名；phone/手机号
    //脱敏
    if (type == 'name') {
      return new Array(str?.length).join('*') + str?.substr(-1);
    } else if (type == 'phone') {
      return str?.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
    } else if (type == 'idCard') {
      return str?.replace(/^(.{6})(?:\d+)(.{4})$/, '$1****$2');
    }
  }

  /**
   * @module 造uuid
   *
   */
  static getUuid = () => {
    const s: any[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 32; i++) {
      const dic = Math.floor(Math.random() * 0x10);
      s[i] = hexDigits.slice(dic, dic + 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.slice((s[19] & 0x3) | 0x8, ((s[19] & 0x3) | 0x8) + 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23];
    const uuid = s.join('');
    return uuid;
  };

  // 获取文件扩展信息
  static getFileExtra = (file: any) => {
    const extra = file?.name?.slice(file?.name?.lastIndexOf('.') + 1);
    const extraMap = {
      img: 'application/x-img',
      zip: 'application/zip',
      bin: 'application/octet-stream',
      hex: 'application/octet-stream',
      swu: 'application/octet-stream',
    };
    return {
      extra,
      contentType: extraMap[extra],
    };
  };

  /**
   * @module 上传文件
   *
   * @param file 文件
   * @param publicMaterialLib 文件id
   */
  static uploadFile = (file: any, publicMaterialLib: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        const _objectId = `${publicMaterialLib.path}/${this.getUuid()}/${file.name}`;
        let fileType = file.type;
        if (fileType === '') {
          const extra = Method.getFileExtra(file);
          if (extra.contentType) {
            fileType = extra.contentType;
          }
        }
        const res = await generatePutUrl({
          bussinessId: publicMaterialLib.id,
          urlList: [{ objectId: _objectId, contentType: fileType }],
        });
        if (res.code === 'SUCCESS') {
          const url = res.data.urlList[0].presignedUrl.url;
          const contentType = res.data.urlList[0].presignedUrl.headers['Content-Type'];
          const xOssCallback = res.data.urlList[0].presignedUrl.headers['x-oss-callback'];
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', url, true);

          xhr.setRequestHeader('Content-Type', contentType || 'application/json');
          xhr.setRequestHeader('x-oss-callback', xOssCallback);
          xhr.onreadystatechange = async () => {
            if (xhr.readyState === 4 && xhr.status == 200) {
              resolve(_objectId);
            }
          };
          xhr.send(file);
        } else {
          reject(res.message);
        }
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  };

  static exportExcel(url: string, name: string, params: Record<string, any>, method?: string) {
    const _method = method || 'GET';
    return request(url, {
      method: _method,
      responseType: 'blob',
      params: params,
      data: params,
    }).then((res: any) => {
      const blob = new Blob([res], {
        type: 'application/vnd.ms-excel;charset=utf-8',
      });
      const fileName = name + '.xlsx';
      if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    });
  }

  static passwordFormatCheck(password: string) {
    // 检查字符串长度
    if (password.length < 8 || password.length > 32) {
      message.error('密码长度必须大于8位小于32位');
      return false;
    }

    // 检查是否包含大写字母、小写字母、数字和特殊符号中的至少3种
    let uppercase = 0;
    let lowercase = 0;
    let number = 0;
    let special = 0;

    for (let i = 0; i < password.length; i++) {
      if (password[i].match(/[A-Z]/)) {
        uppercase = 1;
      } else if (password[i].match(/[a-z]/)) {
        lowercase = 1;
      } else if (password[i].match(/[0-9]/)) {
        number = 1;
      } else {
        special = 1;
      }
    }

    if (uppercase + lowercase + number + special < 3) {
      message.error('密码必须包含大写字母、小写字母、数字和特殊符号至少3种');
      return false;
    }

    return true;
  }

  static copyText = (text: string) => {
    const textValue = document.createElement('textarea');
    textValue.setAttribute('readonly', 'readonly'); //设置只读属性防止手机上弹出软键盘
    textValue.value = text;
    document.body.appendChild(textValue); //将textarea添加为body子元素
    textValue.select();
    const res = document.execCommand('copy');
    document.body.removeChild(textValue); //移除DOM元素
    message.success('复制成功');
    return res;
  };

  /**
   * @module 弹框倒计时
   *
   * @param params 弹框参数
   * @param time 倒计时间
   */
  static countDownConfirm(params: any, time: number = 20) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const countShow = userInfo?.tenantId === 'uzvvv5lc';
    let num = time;
    let timer: any = null;
    const modal = Modal.confirm({
      ...params,
      onCancel: () => {
        if (params.onCancel) params.onCancel();
        if (timer) clearInterval(timer);
      },
      onOk: () => {
        params.onOk();
        if (timer) clearInterval(timer);
      },
      cancelText: countShow ? '取消 ' + num + 'S' : '取消',
    });

    if (!countShow) return;

    timer = setInterval(() => {
      console.log(num);
      if (num === 0) {
        clearInterval(timer);
        modal.destroy();
      }
      num -= 1;
      modal.update({
        ...params,
        onCancel: () => {
          if (params.onCancel) params.onCancel();
          if (timer) clearInterval(timer);
        },
        onOk: () => {
          params.onOk();
          if (timer) clearInterval(timer);
        },
        cancelText: '取消 ' + num + 'S',
      });
    }, 1000);

    // 监听鼠标事件
    document.onmousemove = () => {
      num = 21;
    };
    // 监听键盘事件
    document.onkeydown = () => {
      num = 21;
    };
  }

  /**
   * @module 日期转化

   */
  static Moment = Moment;

  // 时间转化
  static getDate = getDate;

  // 导出数据
  static ExportExcel = ExportExcel;
}

export default Method;
