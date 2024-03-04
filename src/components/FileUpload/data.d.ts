import type { UploadProps } from 'antd/es/upload';
import type { BusinessType } from './business';
declare const ButtonTypes: ['default', 'primary', 'ghost', 'dashed', 'link', 'text'];
export type ButtonType = (typeof ButtonTypes)[number];
type IProps = {
  onUploadSuccess?: (objectId: string, file?: File) => any;
  buttonText?: string;
  buttonType?: ButtonType;
  imgUrl?: string;
  fileType?: file | avatar | image; // 上传文件类型
  maxCount?: number;
  business: BusinessType; //
  checkFile?: (info: UploadFile) => any;
  buttonStyle?: Record<string, any>;
  buttonProps?: Record<string, any>;
  cropImgProps?: Record<string, any>;
} & UploadProps;
