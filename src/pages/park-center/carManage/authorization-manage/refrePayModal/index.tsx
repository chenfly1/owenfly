import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { orderState, refrePay } from '@/services/park';
import QRCode from 'qrcode.react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};
let times: any = null;
const PostponeModal: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const [reqUrl, setReqUrl] = useState<string>('');

  useEffect(() => {
    clearInterval(times);
    if (open) {
      refrePay(data?.id || '').then((res) => {
        console.log(res);
        setReqUrl(res.data?.reqUrl as string);
        times = setInterval(async () => {
          const detailRes = await orderState(res.data?.orderId as string);
          if (detailRes.data === '02') {
            message.success('支付成功');
            clearInterval(times);
            return true;
          }
        }, 1000);
      });
    }
  }, [open]);

  return (
    <>
      <ModalForm
        modalProps={{
          centered: true,
        }}
        {...rest}
        width={'350px'}
        onOpenChange={onOpenChange}
        title={'支付二维码'}
        formRef={formRef}
        open={open}
        submitter={{
          render: () => {
            return (
              <Button
                type="ghost"
                onClick={() => {
                  onSubmit();
                }}
              >
                返回
              </Button>
            );
          },
        }}
      >
        <QRCode
          id="qrCode"
          value={reqUrl}
          size={200} // 二维码的大小
          fgColor="#000000" // 二维码的颜色
          style={{ margin: '0 auto' }}
          imageSettings={{
            // 二维码中间的logo图片
            src: 'logoUrl',
            height: 100,
            width: 100,
            excavate: true, // 中间图片所在的位置是否镂空
          }}
        />
      </ModalForm>
    </>
  );
};

export default PostponeModal;
