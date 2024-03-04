import React, { Component } from 'react';
import styled from 'styled-components';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './style.less';
import classNames from 'classnames';
const Wrapper = styled.div`
  background: rgba(5, 5, 5, 0.06);
  z-index: 1;
  box-sizing: border-box;
  background-clip: padding-box;

  :hover {
    transition: all 2s ease;
  }
`;
const HorizontalWrapper = styled(Wrapper)`
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;

  .disabled {
    cursor: not-allowed;
  }
  .disabled:hover {
    border-color: transparent;
  }
`;

const VerticalWrapper = styled(Wrapper)`
  width: 11px;
  margin: 0 -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;

  .disabled {
    cursor: not-allowed;
  }
  .disabled:hover {
    border-color: transparent;
  }
`;
class Resizer extends Component {
  render() {
    const {
      index,
      split = 'vertical',
      onClick = () => {},
      onDoubleClick = () => {},
      onMouseDown = () => {},
      onTouchEnd = () => {},
      onTouchStart = () => {},
      onClosePane = () => {},
      onOpenPane = () => {},
    } = this.props;
    const props = {
      ref: (_) => (this.resizer = _),
      'data-attribute': split,
      'data-type': 'Resizer',
      onMouseDown: (event) => onMouseDown(event, index),
      onTouchStart: (event) => {
        event.preventDefault();
        onTouchStart(event, index);
      },
      onTouchEnd: (event) => {
        event.preventDefault();
        onTouchEnd(event, index);
      },
      onClick: (event) => {
        if (onClick) {
          event.preventDefault();
          onClick(event, index);
        }
      },
      onDoubleClick: (event) => {
        if (onDoubleClick) {
          event.preventDefault();
          onDoubleClick(event, index);
        }
      },
    };
    const onClosePaneFn = (event) => {
      if (onClosePane) {
        onClosePane(event, index);
      }
    };
    const onOpenPaneFn = (event) => {
      if (onOpenPane) {
        onOpenPane(event, index);
      }
    };
    return split === 'vertical' ? (
      <>
        {this.props.closed ? (
          <MenuUnfoldOutlined className={styles.ResizeIcon} onClick={onOpenPaneFn} />
        ) : (
          <MenuFoldOutlined className={styles.ResizeIcon} onClick={onClosePaneFn} />
        )}
        <VerticalWrapper {...props} />
      </>
    ) : (
      <>
        {/* {this.props.closed ? (
          <MenuUnfoldOutlined className={styles.ResizeIcon} onClick={onOpenPaneFn} />
        ) : (
          <MenuFoldOutlined className={styles.ResizeIcon} onClick={onClosePaneFn} />
        )} */}
        <HorizontalWrapper {...props} />
      </>
    );
  }
}

export default Resizer;
