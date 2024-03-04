import { createRef, useRef } from 'react';
import { Button, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ActionType, ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';
import { createCategory, deleteCategory, getCategoryList, updateCategory } from '@/services/energy';
import { EnergyState, getFirstValue } from '@/models/useEnergy';
import { DrawerFormRef } from '@/components/DrawerForm';
import ActionGroup from '@/components/ActionGroup';
import { useInitState } from '@/hooks/useInitState';
import { Update, Create, UpdateCategoryFormProps } from './update';
import Check from './check';

export default () => {
  const { insTypeMap } = useInitState<EnergyState>('useEnergy', ['insTypeMap']);
  const addRef = createRef<DrawerFormRef<UpdateCategoryFormProps>>();
  const updateRef = createRef<DrawerFormRef<UpdateCategoryFormProps>>();
  const checkRef = createRef<DrawerFormRef<any>>();
  const tableRef = useRef<ActionType>();

  const columns: ProColumns<CategoryItemType>[] = [
    {
      title: '仪表类型',
      key: 'insTypeName',
      dataIndex: 'insTypeName',
      valueEnum: insTypeMap.value,
      formItemProps: { name: 'insType' },
      fieldProps: { loading: insTypeMap.loading },
      order: 0,
    },
    {
      title: '分项名称',
      key: 'cnName',
      dataIndex: 'cnName',
      formItemProps: {
        name: 'insTagName',
      },
      order: -1,
    },
    {
      title: '创建人',
      key: 'creator',
      dataIndex: 'creator',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      hideInSearch: true,
    },
    {
      title: '备注',
      key: 'remark',
      dataIndex: 'remark',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, row) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  updateRef.current?.open({
                    id: row.id,
                    insType: `${row.insType}`,
                    insTagName: row.cnName,
                    remark: row.remark,
                  });
                },
              },
              {
                key: 'category',
                text: '查看关联仪表',
                onClick() {
                  checkRef.current?.open(row);
                },
              },
              {
                key: 'remove',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    icon: <ExclamationCircleFilled />,
                    title: `确定删除 ${row.cnName} 分项吗？`,
                    centered: true,
                    onOk: async () => {
                      const res = await deleteCategory(`${row.id}`);
                      tableRef.current?.reloadAndRest?.();
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

  /** 获取分项列表 */
  const getList = async ({ current, ...params }: ParamsType) => {
    const options = { ...params, pageNo: current };
    const res = await getCategoryList(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  /** 更新分项 */
  const update = async (values: UpdateCategoryFormProps) => {
    try {
      await (values.id ? updateCategory(values) : createCategory(values));
      tableRef.current?.reloadAndRest?.();
      return true;
    } catch (err) {
      return false;
    }
  };

  /**  */

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<CategoryItemType>
        actionRef={tableRef}
        columns={columns}
        form={{ colon: false }}
        tableAlertRender={false}
        pagination={{ showSizeChanger: true }}
        request={getList}
        headerTitle={''}
        cardBordered
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              addRef.current?.open({
                insType: getFirstValue(insTypeMap.value),
              });
            }}
          >
            新增
          </Button>,
        ]}
      />
      <Update ref={updateRef} submit={update} />
      <Create ref={addRef} submit={update} />
      <Check ref={checkRef} submit={() => Promise.resolve(true)} />
    </PageContainer>
  );
};
