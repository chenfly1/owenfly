import React, { ReactNode, CSSProperties } from 'react';

const ItemWrapper: React.FC<{ children?: ReactNode; style?: CSSProperties }> = (props) => {
  const { style = {}, ...restProps } = props;
  return (
    <div
      style={{
        width: 24,
        height: 24,
        border: '1px solid #F2F3F5',
        borderRadius: '50%',
        textAlign: 'center',
        lineHeight: '24px',
        cursor: 'pointer',
        ...(style || {}),
      }}
      {...restProps}
    />
  );
};

export default ItemWrapper;
