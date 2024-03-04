import React from 'react';
import { Input } from 'antd';
import { clone, toArr } from '@formily/shared';
import { observer } from '@formily/reactive-react';
import { IconWidget, usePrefix } from '@designable/react';
import { uid } from '@formily/shared';
import { INodeItem, ITreeDataSource } from './types';
import { traverseTree } from './shared';
import './styles.less';
export interface ITitleProps extends INodeItem {
  treeDataSource: ITreeDataSource;
  change: () => void;
}

export const Title: React.FC<ITitleProps> = observer((props) => {
  const prefix = usePrefix('data-source-setter-node-title');
  const getTitleValue = (dataSource) => {
    const optionalKeys = ['label', 'title', 'header'];
    let nodeTitle: string;
    optionalKeys.some((key) => {
      const title = toArr(dataSource).find((item) => item.label === key)?.value;
      if (title !== undefined) {
        nodeTitle = title;
        return true;
      }
      return false;
    });
    if (nodeTitle === undefined) {
      toArr(dataSource || []).some((item) => {
        if (item.value && typeof item.value === 'string') {
          nodeTitle = item.value;
          return true;
        }
        return false;
      });
    }
    return nodeTitle;
  };

  const renderTitle = (dataSource: any) => {
    const nodeTitle = getTitleValue(dataSource);
    if (nodeTitle === undefined) return '';
    else return nodeTitle + '';
  };

  return (
    <div className={prefix}>
      <Input
        size="small"
        style={{ marginRight: '40px' }}
        value={renderTitle(props?.map || [])}
        onChange={(event) => {
          const newDataSource = clone(props?.treeDataSource?.dataSource);
          traverseTree(newDataSource || [], (dataItem, i, data) => {
            if (data[i].key === props.duplicateKey) {
              const valueItem = data[i].map.find((item: any) => item.label === 'value');
              data[i].map = [
                {
                  label: 'label',
                  value: event.target.value,
                },
                valueItem,
              ];
            }
          });
          props.treeDataSource.dataSource = newDataSource;
          props.change?.();
        }}
      />
      <div style={{ marginTop: '-5px' }}>
        <IconWidget
          className={prefix + '-icon'}
          style={{ marginRight: '8px' }}
          infer="Add"
          onClick={() => {
            const newDataSource = clone(props?.treeDataSource?.dataSource);
            traverseTree(newDataSource || [], (dataItem, i, data) => {
              if (data[i].key === props.duplicateKey) {
                data[i].children = data[i].children || [];
                const uuid = uid();
                const values = {
                  key: uuid,
                  duplicateKey: uuid,
                  map: [
                    {
                      label: 'label',
                      value: `选项${(data[i].children?.length || 0) + 1}`,
                    },
                    { label: 'value', value: uuid },
                  ],
                  children: [],
                };
                data[i].children = data[i].children?.concat(values);
              }
            });
            props.treeDataSource.dataSource = newDataSource;
            props.change?.();
          }}
        />
        <IconWidget
          className={prefix + '-icon'}
          infer="Remove"
          onClick={() => {
            const newDataSource = clone(props?.treeDataSource?.dataSource);
            traverseTree(newDataSource || [], (dataItem, i, data) => {
              if (data[i].key === props.duplicateKey) toArr(data).splice(i, 1);
            });
            props.treeDataSource.dataSource = newDataSource;
          }}
        />
      </div>
    </div>
  );
});
