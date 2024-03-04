import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { orderState, refrePay } from '@/services/park';
import QRCode from 'qrcode.react';
import styles from './style.less';

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
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    setInfo(data);
    clearInterval(times);
    if (open) {
      if (data?.authId) {
        refrePay(data?.authId || '').then((res) => {
          if (res.code === 'SUCCESS') {
            setReqUrl(res.data?.reqUrl as string);
            times = setInterval(async () => {
              const detailRes = await orderState(res.data?.orderId as string);
              if (detailRes.data === '02') {
                message.success('支付成功');
                clearInterval(times);
                return true;
              }
            }, 1000);
          } else {
          }
        });
      } else {
        message.error('缺少授权ID');
      }
    }
  }, [open, data]);

  return (
    <>
      <ModalForm
        modalProps={{
          centered: true,
        }}
        {...rest}
        width={'450px'}
        onOpenChange={onOpenChange}
        title={'重新发起支付'}
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
        <div style={{ marginTop: '20px' }} />
        <div className={styles.cFromItem}>
          <label>订单编号：</label>
          <div>{info.code}</div>
        </div>
        <div className={styles.cFromItem}>
          <label>车牌号码：</label>
          <div>{info.plate}</div>
        </div>
        <div className={styles.cFromItem}>
          <label>订单创建时间：</label>
          <div>{info.gmtCreated}</div>
        </div>
        <div className={styles.cFromItem}>
          <label>待支付金额（元）：</label>
          <div>{info.price}</div>
        </div>
      </ModalForm>
    </>
  );
};

export default PostponeModal;
