import { Card, CardProps } from 'antd';
import { PropsWithChildren } from 'react';
import Style from './index.less';

const Wrapper: React.FC<PropsWithChildren<CardProps>> = ({ children, className, ...cardProps }) => {
  return (
    <Card {...cardProps} className={`${Style.statistic_wrapper} ${className || ''}`}>
      {children}
    </Card>
  );
};

export default Wrapper;
