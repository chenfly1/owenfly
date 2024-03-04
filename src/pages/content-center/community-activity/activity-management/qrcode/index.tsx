import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import { ProFormSelect } from '@ant-design/pro-form';
import { getProjectAllList } from '@/services/mda';
import Print from 'react-print-html';

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
  const printRef = useRef(null);
  const [title, setTitle] = useState<string>();
  const [qrcode, setQrcode] = useState<string>('');
  const [qrcodeImgSrc, setQrcodeImgSrc] = useState<string>('');
  const formRef = useRef<ProFormInstance>();
  const id = data?.id;

  const changeCanvasToPic = () => {
    const img = new Image();
    img.src = qrcodeImgSrc;
    const downLink = document.getElementById('down_link') as any;
    downLink.href = img.src;
    downLink.download = '二维码'; // 图片name
  };

  const handlePrint = () => {
    Print(printRef.current);
    // const printContent = printRef.current;
    // console.log(printContent);
    // const originalContents = document.body.innerHTML;

    // document.body.innerHTML = (printContent as any).innerHTML;
    // window.print();
    // document.body.innerHTML = originalContents;
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('活动签到码');

      if (id) {
        setQrcode(data.qrcode);
        formRef?.current?.setFieldsValue({
          ...data,
        });
        const timer = setTimeout(() => {
          const canvasImg = document.getElementById('qrCode') as HTMLCanvasElement; // 获取canvas类型的二维码
          const src = canvasImg?.toDataURL('image/png'); // 将canvas对象转换为图片的data url
          setQrcodeImgSrc(src);
          clearTimeout(timer);
        }, 50);
      }
    }
  }, [open]);
  return (
    <DrawerForm
      {...rest}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={560}
      title={title}
      formRef={formRef}
      open={open}
      readonly
      submitter={{
        searchConfig: {
          resetText: '关闭', //修改ProForm重置文字
        },
        render: (_: any, dom: any) => {
          return dom[0];
        },
      }}
    >
      <ProFormSelect
        label="关联项目"
        name="projectBid"
        readonly
        request={async () => {
          const res = await getProjectAllList();
          console.log(res);
          return (res.data.items as any).map((i: any) => ({
            value: i.bid,
            label: i.name,
          }));
        }}
      />
      <ProFormText name="title" label="活动标题" />
      <ProFormText name="qrcode" label="活动签到码">
        <div>
          <QRCode
            id="qrCode"
            value={qrcode}
            size={200} // 二维码的大小
            fgColor="#000000" // 二维码的颜色
            style={{ border: '1px solid #000000', padding: '10px' }}
            imageSettings={{
              // 二维码中间的logo图片
              src: 'logoUrl',
              height: 50,
              width: 50,
              excavate: true, // 中间图片所在的位置是否镂空
            }}
          />
        </div>
        <div style={{ width: '150px', display: 'flex', justifyContent: 'space-between' }}>
          <a id="down_link" onClick={changeCanvasToPic}>
            下载为图片
          </a>
          <a id="down_link" onClick={handlePrint}>
            打印
          </a>
        </div>
      </ProFormText>
      <div style={{ position: 'absolute', right: '-100%', top: 0 }}>
        <div ref={printRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}>
          <img
            style={{
              position: 'absolute',
              width: '200px',
              border: '1px solid #000000',
              padding: '10px',
              height: '200px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            src={qrcodeImgSrc}
          />
        </div>
      </div>
    </DrawerForm>
  );
};

export default Add;
