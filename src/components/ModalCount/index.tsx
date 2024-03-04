import { Button, Modal } from 'antd';
import { useState, type ReactNode, useEffect } from 'react';
import { useModel } from 'umi';

type Props = {
  time?: number;
  children?: ReactNode;
};
export default (props: Props & Record<string, any>) => {
  const { time = 20, onCancel, footer, children, ...rest } = props;
  const [count, setCount] = useState<number>(time);
  const { initialState } = useModel('@@initialState');
  const [countShow] = useState<boolean>(
    initialState?.currentUser?.userName === '公安三所认证租户管理员',
  );
  console.log(footer);
  let timer: any = null;
  console.log(rest);
  useEffect(() => {
    if (!countShow) return undefined;
    if (count === 0) {
      onCancel(false);
    }
    if (rest.open) {
      timer = setInterval(() => {
        setCount(count - 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setCount(time);
    }
    // 监听鼠标事件
    document.onmousemove = () => {
      setCount(20);
    };
    // 监听键盘事件
    document.onkeydown = () => {
      setCount(20);
    };
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [count, rest.open]);

  return (
    <Modal
      {...rest}
      centered
      onCancel={() => onCancel(false)}
      footer={
        countShow
          ? [
              <Button
                key="back"
                onClick={() => {
                  onCancel(false);
                }}
              >
                {footer[0].props.children + ' ' + count + 'S'}
              </Button>,
              ...footer.slice(1),
            ]
          : footer
      }
    >
      {children}
    </Modal>
  );
};
