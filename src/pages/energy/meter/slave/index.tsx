import { createRef, useEffect, useRef, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import { ModalFormRef } from '@/components/ModalForm';
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';
import LazyTree, { LazyTreeNodeType, LazyTreeRef } from '@/components/LazyTree';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import {
  bindMeterRelation,
  getMeterList,
  getTotalPageSource,
  getTotoalSource,
  unbindMeterRelation,
} from '@/services/energy';
import ActionGroup from '@/components/ActionGroup';
import MeterTree, { MeterTreeFormProps } from '../../meterTree';
import Style from './index.less';
import { meterTypeEnum } from '../../config';

type MeterTreeItemType = MeterItemType & { children?: MeterItemType[]; parent?: boolean };
type FilterOptions = {
  syncId?: string;
  cnName?: string;
  insTagId?: string;
};
export const MasterMeter = MeterTree({
  title: '添加主路电表',
  params: {
    insType: meterTypeEnum.electric,
    parentInsId: -1, // 标记筛查为无绑定关系的表
  },
});
export const SlaveMeter = MeterTree({
  title: '添加支路电表',
  params: {
    insType: meterTypeEnum.electric,
    parentInsId: -1, // 标记筛查为无绑定关系的表
  },
});

const SlaveList = () => {
  const [source, setSource] = useState<LazyTreeNodeType<MeterItemType>>();
  const [list, setList] = useState<MeterItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const masterRef = createRef<ModalFormRef<MeterTreeFormProps>>();
  const slaveRef = createRef<ModalFormRef<MeterTreeFormProps>>();
  const formRef = useRef<ProFormInstance>();
  const tableRef = useRef<ActionType>();
  const lazyTreeRef = useRef<LazyTreeRef<MeterItemType> | null>(null);
  const { meterRootNode } = useInitState<EnergyState>('useEnergy', ['meterRootNode']);

  /** 筛选列表 */
  const filterList = (children: MeterItemType[], options: FilterOptions) => {
    if (!children?.length) return [];
    const hasOptions = Object.values(options).some((item) => item);
    if (hasOptions) {
      return children?.filter(({ syncId, cnName, insTagId }) => {
        let match = true;
        if (options.syncId) match = syncId.indexOf(options.syncId) > -1;
        if (match && options.cnName) match = cnName.indexOf(options.cnName) > -1;
        if (match && options.insTagId) match = `${insTagId}` === options.insTagId;
        return match;
      });
    }
    return children;
  };

  /** 获取列表数据 */
  const getList = async (data?: LazyTreeNodeType<MeterItemType>) => {
    if (data) {
      const { children, ...master } = data;
      const childList = filterList(
        (children || []).map((item) => item.data),
        formRef.current?.getFieldsValue(),
      );
      // notice: 提升 meterRootNode 任务优先级
      if (meterRootNode.value.key === '' || `${master.key}` === `${meterRootNode.value.key}`)
        return setList(childList);
      setList([{ ...master.data, parent: true } as any].concat(childList));
    } else {
      setList([]);
    }
  };

  /** 更新树及列表 */
  const refresh = async (key: string) => {
    const slaves = await getTotalPageSource<MeterItemType>(getMeterList, {
      parentInsId: key,
      insType: meterTypeEnum.electric,
      pageNo: 1,
      pageSize: 999,
    });
    lazyTreeRef.current?.updateSource((mapValues, done) => {
      mapValues[key] = {
        ...mapValues[key],
        loaded: true,
        children: slaves.items.map((item) => ({
          data: item,
          key: item.id,
          title: item.cnName,
          children: [],
        })),
      };
      done(mapValues);
      if (source?.key === key) {
        getList(mapValues[key] as any);
      }
    });
  };

  /** 绑定主从表 */
  const bindHandler = async (values: MeterTreeFormProps) => {
    if (values.id === undefined) return false;
    if (!values?.leafValues?.length) {
      message.warning('请勾选仪表数据');
      return false;
    }
    try {
      await bindMeterRelation(values.id, {
        insIds: values.leafValues,
      });
      await refresh(values.id);
      return true;
    } catch (err) {
      return false;
    }
  };

  const columns: ProColumns<MeterTreeItemType>[] = [
    {
      title: '仪表表号',
      key: 'syncId',
      dataIndex: 'syncId',
      order: -1,
      width: 200,
      ellipsis: true,
    },
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      order: 0,
      width: 100,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '仪表名称',
      key: 'cnName',
      dataIndex: 'cnName',
      order: -2,
      width: 200,
      ellipsis: true,
    },
    {
      title: '计量位置',
      key: 'meterSpaceFullName',
      dataIndex: 'meterSpaceFullName',
      hideInSearch: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: '安装位置',
      key: 'installationSpaceName',
      dataIndex: 'installationSpaceName',
      hideInSearch: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: '分项名称',
      key: 'insTagName',
      dataIndex: 'insTagName',
      request: async () => {
        try {
          const res = await getTotoalSource('TAG', {
            param: {
              insType: meterTypeEnum.electric,
            },
          });
          return Object.keys(res).map((key) => ({
            value: key,
            label: res[key],
          }));
        } catch (err) {
          return [];
        }
      },
      formItemProps: { name: 'insTagId' },
      order: -3,
      width: 100,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInSearch: true,
      width: 100,
      render: (_, row) => {
        return row.parent ? (
          <ActionGroup
            limit={1}
            actions={[
              {
                key: 'add',
                text: '添加支表',
                onClick: () => {
                  slaveRef?.current?.open({
                    id: row.id,
                  });
                },
              },
            ]}
          />
        ) : (
          <ActionGroup
            limit={1}
            actions={[
              {
                key: 'remove',
                text: '解除关系',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定解除仪表 ${row.cnName} 主从关系吗？`,
                    centered: true,
                    onOk: async () => {
                      await unbindMeterRelation({
                        insIds: [row.id],
                      });
                      if (source?.key) await refresh(source.key);
                      return true;
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  // 主从表树加载
  const request = async (node: LazyTreeNodeType<MeterItemType>): Promise<MeterItemType[]> => {
    const res = await getTotalPageSource<MeterItemType>(getMeterList, {
      parentInsId: node.key,
      pageNo: 1,
      pageSize: 999,
      insType: meterTypeEnum.electric,
    });
    return res?.items;
  };

  useEffect(() => {
    setLoading(true);
    if (meterRootNode.inited) {
      request(meterRootNode.value)
        .then((res) => {
          const data = { ...meterRootNode.value.data, children: res, loaded: true };
          lazyTreeRef?.current?.initSource?.([data], () => {
            lazyTreeRef?.current?.updateSelectedKey(meterRootNode.value.key);
            lazyTreeRef?.current?.updateExpandedKeys([meterRootNode.value.key]);
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [meterRootNode]);

  return (
    <PageContainer
      className={Style.meter_slave}
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%" minSize={'280px'}>
          <LazyTree
            showRootNode
            loading={loading}
            rootStyle={{
              height: 'calc(100vh - 110px)',
              padding: '20px 20px 0',
              overflowY: 'scroll',
            }}
            getRef={(ref) => {
              lazyTreeRef.current = ref;
            }}
            request={request}
            fieldNames={{ key: 'id', title: 'cnName' }}
            extraAction={(node) => {
              return node.key === meterRootNode.value.key ? (
                <Button
                  size="small"
                  type="link"
                  onClick={(event) => {
                    event.stopPropagation();
                    masterRef.current?.open({
                      id: meterRootNode.value.key,
                    });
                  }}
                >
                  添加
                </Button>
              ) : null;
            }}
            onSelect={(value) => {
              setSource(value);
              getList(value);
            }}
          />
        </Pane>
        <Pane>
          <ProTable<MeterTreeItemType>
            formRef={formRef}
            actionRef={tableRef}
            columns={columns}
            dataSource={list}
            cardBordered
            form={{ colon: false }}
            tableAlertRender={false}
            pagination={{
              showSizeChanger: true,
            }}
            onSubmit={() => {
              getList(source);
            }}
            onReset={() => {
              getList(source);
            }}
          />
          <MasterMeter ref={masterRef} submit={bindHandler} />
          <SlaveMeter ref={slaveRef} submit={bindHandler} />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default SlaveList;
