import { createRef, useRef, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import ActionGroup from '@/components/ActionGroup';
import { DrawerFormRef } from '@/components/DrawerForm';
import { useInitState } from '@/hooks/useInitState';
import { EnergyState } from '@/models/useEnergy';
import { batchRemoveMeasure, createMeasure, removeMeasure, updateMeasure } from '@/services/energy';
import { Create, CreateMeasureFormProps, Update, UpdateMeasureFormProps } from './update';
import MeasureTree from '../../measureTree';
import { Method } from '@/utils';
import dayjs from 'dayjs';

interface SourceState {
  list: MeasureItemType[];
  total: number;
}

interface Options {
  meterSpaceName?: string;
}

const transformMeasureList = (data: MeasureTreeType[], options?: Options): MeasureItemType[] => {
  return data.reduce((prev, curr) => {
    const { children, ...rest } = curr;
    if (options?.meterSpaceName && rest.data.meterSpaceName.indexOf(options.meterSpaceName) < 0) {
      return prev.concat(transformMeasureList(children || [], options));
    }
    return prev.concat(rest.data, transformMeasureList(children || [], options));
  }, [] as MeasureItemType[]);
};

const MeterList = () => {
  const [selectedNode, setSelectedNode] = useState<MeasureTreeType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [source, setSource] = useState<SourceState>();
  const [exporting, setExporting] = useState(false);
  const { measureTree, updateState } = useInitState<EnergyState>('useEnergy', ['measureTree']);
  const addRef = createRef<DrawerFormRef<CreateMeasureFormProps>>();
  const updateRef = createRef<DrawerFormRef<UpdateMeasureFormProps>>();
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const columns: ProColumns<MeasureItemType>[] = [
    {
      title: '计量位置名称',
      key: 'meterSpaceName',
      dataIndex: 'meterSpaceName',
      formItemProps: {
        labelCol: { flex: '100px' },
      },
    },
    {
      title: '创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '创建人',
      key: 'creator',
      dataIndex: 'creator',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 100,
      render: (_, row) => {
        return Number(row.id) === 0 ? (
          <ActionGroup
            limit={1}
            actions={[
              {
                key: 'create',
                text: '新建下级',
                onClick: () => {
                  addRef.current?.open({
                    id: row.id,
                    name: row.meterSpaceName,
                    meterSpaceName: undefined,
                  });
                },
              },
            ]}
          />
        ) : (
          <ActionGroup
            limit={2}
            actions={[
              {
                key: 'create',
                text: '新建下级',
                onClick: () => {
                  addRef.current?.open({
                    id: row.id,
                    name: row.meterSpaceName,
                    meterSpaceName: undefined,
                  });
                },
              },
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  updateRef.current?.open({
                    id: row.id,
                    meterSpaceName: row.meterSpaceName,
                  });
                },
              },
              {
                key: 'remove',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除 ${row.meterSpaceName} 计量位置吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await removeMeasure(`${row.id}`);
                      updateState('measureTree', false);
                      return res;
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

  const getSource = (node: MeasureTreeType[]) => {
    const list = node?.length ? transformMeasureList(node, formRef.current?.getFieldsValue()) : [];
    setSource({
      list,
      total: list.length,
    });
  };

  const exportHandler = () => {
    if (selectedNode?.key === undefined) return;
    setExporting(true);
    Method.exportExcel(
      `/energy/mng/meter_space/all`,
      `计量位置记录_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        excel: 'export',
      },
    ).finally(() => {
      setExporting(false);
    });
  };

  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} minSize={'280px'} maxSize="50%">
          <MeasureTree
            rootStyle={{
              height: 'calc(100vh - 180px)',
              overflow: 'scroll',
            }}
            select={(node) => {
              setSelectedNode(node);
              getSource(node ? [node] : []);
            }}
          />
        </Pane>
        <Pane>
          <ProTable<MeasureItemType>
            rowKey={'id'}
            columns={columns}
            cardBordered
            actionRef={tableRef}
            formRef={formRef}
            form={{ colon: false }}
            tableAlertRender={false}
            pagination={{
              showSizeChanger: true,
              total: source?.total,
            }}
            onSubmit={() => {
              getSource(selectedNode ? [selectedNode] : []);
            }}
            onReset={() => {
              getSource(selectedNode ? [selectedNode] : []);
            }}
            loading={measureTree?.loading}
            dataSource={source?.list}
            rowSelection={{
              type: 'checkbox',
              alwaysShowAlert: false,
              selectedRowKeys,
              onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys);
              },
            }}
            toolBarRender={() => [
              <Button key="export" type="primary" loading={exporting} onClick={exportHandler}>
                全量导出
              </Button>,
            ]}
            headerTitle={
              <ActionGroup
                scene="tableHeader"
                selection={{
                  count: selectedRowKeys.length,
                }}
                actions={[
                  {
                    key: 'batchRemove',
                    text: '批量删除',
                    onClick: () => {
                      if (selectedRowKeys.length === 0) {
                        message.warning('请勾选行数据');
                        return;
                      }
                      Modal.confirm({
                        icon: <ExclamationCircleFilled />,
                        title: `确定批量删除选中计量位置吗？`,
                        centered: true,
                        onOk: async () => {
                          const res = await batchRemoveMeasure({
                            ids: selectedRowKeys,
                          });
                          updateState('measureTree', false);
                          return res;
                        },
                      });
                    },
                  },
                ]}
              />
            }
          />
          <Create
            ref={addRef}
            submit={async (values) => {
              try {
                await createMeasure(values.id, { meterSpaceName: values.meterSpaceName });
                updateState('measureTree', false);
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
          <Update
            ref={updateRef}
            submit={async ({ id, ...values }) => {
              try {
                await updateMeasure(id, values);
                updateState('measureTree', false);
                return true;
              } catch (err) {
                return false;
              }
            }}
          />
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};

export default MeterList;
