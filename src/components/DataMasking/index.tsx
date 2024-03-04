import Method from '@/utils/Method';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { useState, useMemo } from 'react';
type Props = {
  text?: string;
  type?: string; // phone手机号 name名字 idCard身份证
  showIcon?: boolean;
};
export default (props: Props) => {
  const { text, type = 'phone', showIcon = true } = props;
  const [show, setShow] = useState<boolean>(true);

  const msg = useMemo(() => Method.onlySeeSome(text as string, type), [text, type]);

  return (
    <Space>
      {text ? (
        show ? (
          <>
            <span>{msg}</span>
            {showIcon && <EyeInvisibleOutlined onClick={() => setShow(false)} />}
          </>
        ) : (
          <>
            <span>{text}</span>
            {showIcon && <EyeOutlined onClick={() => setShow(true)} />}
          </>
        )
      ) : (
        '-'
      )}
    </Space>
  );
};
