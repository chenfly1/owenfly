// import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import { parkQrcode } from '@/services/park';
import { Method } from '@/utils';
// import styles from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const [qrType, setQrType] = useState<string>('WP');
  const formRef = useRef<ProFormInstance>();
  // const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}' as string);
  const [qrCode, setQrcode] = useState<string>('');
  const changeCanvasToPic = () => {
    const canvasImg = document.getElementById('qrCode') as HTMLCanvasElement; // 获取canvas类型的二维码
    const img = new Image();
    img.src = canvasImg?.toDataURL('image/png'); // 将canvas对象转换为图片的data url
    const downLink = document.getElementById('down_link') as any;
    downLink.href = img.src;
    downLink.download = '二维码'; // 图片name
  };

  useEffect(() => {
    if (open) {
      if (data?.id) {
        setTitle('车场二维码');

        parkQrcode({ id: data?.id, qrType: qrType }).then((res) => {
          setQrcode(res.data?.url);
          formRef?.current?.setFieldsValue({
            ...data,
          });
        });
      }
    } else {
      setQrType('WP');
    }
  }, [open, qrType]);
  return (
    <ModalForm
      {...rest}
      modalProps={{
        centered: true,
      }}
      colon={false}
      labelCol={{ flex: '78px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={450}
      title={title}
      formRef={formRef}
      open={open}
      submitter={{
        searchConfig: {
          resetText: '关闭', //修改ProForm重置文字
        },
        render: (props, dom) => {
          return dom[0];
        },
      }}
    >
      <ProFormText
        name="name"
        width={300}
        label="车场名称"
        readonly={true}
        placeholder="车场名称"
      />
      <ProFormText
        name="code"
        width={300}
        label="车场编号"
        readonly={true}
        placeholder="车场编号"
      />
      <ProFormSelect
        name="qrType"
        label="二维码类型"
        readonly={false}
        options={[
          {
            label: '小程序',
            value: 'WP',
          },
          {
            label: 'H5',
            value: 'H5',
          },
        ]}
        fieldProps={{
          value: qrType,
          onChange: (newVal) => {
            setQrType(newVal);
          },
        }}
      />
      <Card
        bordered
        bodyStyle={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div>
          <QRCode
            id="qrCode"
            // value="https://www.jianshu.com/u/992656e8a8a6"
            value={qrCode}
            size={200} // 二维码的大小
            fgColor="#000000" // 二维码的颜色
            style={{ margin: '10px 0' }}
            imageSettings={{
              // 二维码中间的logo图片
              src: 'logoUrl',
              height: 100,
              width: 100,
              excavate: true, // 中间图片所在的位置是否镂空
            }}
          />
          <div style={{ width: '200px', display: 'flex', justifyContent: 'space-between' }}>
            <a
              onClick={() => {
                Method.copyText(qrCode);
              }}
            >
              复制路径
            </a>
            <a>
              <a id="down_link" onClick={changeCanvasToPic}>
                下载二维码
              </a>
            </a>
          </div>
        </div>
      </Card>
    </ModalForm>
  );
};

export default Add;
