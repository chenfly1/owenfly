import { ModalForm } from '@ant-design/pro-components';
import { useState, type ReactNode, useEffect } from 'react';
import { useModel } from 'umi';

type Props = {
  time?: number;
  children?: ReactNode;
};
export default (props: Props & Record<string, any>) => {
  const { time = 20, onOpenChange, children, ...rest } = props;
  const [count, setCount] = useState<number>(time);
  const { initialState } = useModel('@@initialState');
  const [countShow] = useState<boolean>(
    initialState?.currentUser?.userName === '公安三所认证租户管理员',
  );
  let timer: any = null;
  console.log(rest);
  useEffect(() => {
    if (!countShow) return undefined;
    if (count === 0) {
      onOpenChange(false);
    }
    if (rest.open) {
      timer = setInterval(() => {
        console.log(count);
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
    <ModalForm
      {...rest}
      onOpenChange={onOpenChange}
      modalProps={{
        ...rest.modalProps,
        cancelText: countShow ? '取消 ' + count + 'S' : '取消',
      }}
    >
      {children}
    </ModalForm>
  );
};
