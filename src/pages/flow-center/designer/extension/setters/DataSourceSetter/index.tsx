/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useMemo, useState } from 'react';
import cls from 'classnames';
import { Modal, Button } from 'antd';
import { Form } from '@formily/core';
import { observable } from '@formily/reactive';
import { observer } from '@formily/reactive-react';
import { usePrefix, useTheme, TextWidget } from '@designable/react';
import { DataSettingPanel } from './DataSettingPanel';
import { TreePanel } from './TreePanel';
import { transformDataToValue, transformValueToData } from './shared';
import { IDataSourceItem, ITreeDataSource } from './types';
import './styles.less';
export interface IDataSourceSetterProps {
  className?: string;
  style?: React.CSSProperties;
  onChange: (dataSource: IDataSourceItem[]) => void;
  value: IDataSourceItem[];
  allowTree?: boolean;
  allowExtendOption?: boolean;
  defaultOptionValue?: {
    label: string;
    value: any;
  }[];
  effects?: (form: Form<any>) => void;
}

export const DataSourceSetter: React.FC<IDataSourceSetterProps> = observer((props) => {
  const {
    className,
    value = [],
    onChange,
    allowTree = true,
    allowExtendOption = true,
    defaultOptionValue,
    effects = () => {},
  } = props;
  const theme = useTheme();
  const prefix = usePrefix('data-source-setter');
  const [modalVisible, setModalVisible] = useState(false);
  const treeDataSource: ITreeDataSource = useMemo(
    () =>
      observable({
        dataSource: transformValueToData(value),
        selectedKey: '',
      }),
    [value, modalVisible],
  );
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  return (
    <Fragment>
      <Button block onClick={openModal}>
        <TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />
      </Button>
      <Modal
        title={<TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />}
        width="500px"
        bodyStyle={{ padding: 10 }}
        transitionName=""
        maskTransitionName=""
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => {
          onChange(transformDataToValue(treeDataSource.dataSource));
          closeModal();
        }}
      >
        <div className={`${cls(prefix, className)} ${prefix + '-' + theme} ${prefix + '-layout'}`}>
          <div className={`${prefix + '-layout-item left'}`} style={{ width: '100%' }}>
            <TreePanel
              defaultOptionValue={defaultOptionValue}
              allowTree={allowTree}
              treeDataSource={treeDataSource}
            />
          </div>
        </div>
      </Modal>
    </Fragment>
  );
});
