import { useEffect, useState, useRef } from 'react';
import { ExclamationCircleFilled, PlusOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space, Modal, message, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { queryByPageEnterprise, deleteEnterprise, deleteAllEnterprise } from '@/services/mda';
import ProjectSelect from '@/components/ProjectSelect';
import { history, Access, useAccess } from 'umi';
import { storageSy } from '@/utils/Setting';
import { enterpriseCustomer } from '@/components/FileUpload/business';
import DataMasking from '@/components/DataMasking';
import style from './style.less';
const { confirm } = Modal;

export default () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [projectBid, setProjectBid] = useState<string>();
  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    if (project) {
      setProjectBid(project.bid);
    }
  }, []);

  const handleChange = (bid: string) => {
    setProjectBid(bid);
    actionRef.current?.reload();
  };

  const columns: ProColumns<EnterpriseType>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectBid',
      hideInTable: true,
      order: 4,
      initialValue: projectBid,
      renderFormItem: () => {
        return <ProjectSelect allowClear={false} name="projectBid" handleChange={handleChange} />;
      },
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      order: 4,

      ellipsis: true,
    },
    {
      title: '证件号码',
      dataIndex: 'identityCard',
      order: 4,

      ellipsis: true,
      render: (_, record) => {
        if (record.identityType === 'id_card') {
          return [<DataMasking key="onlysee" text={record.identityCard} type="idCard" />];
        }
        return <span>{record.identityCard}</span>;
      },
    },
    {
      title: '企业管理员名称',
      dataIndex: 'managerName',
      order: 4,

      search: false,
      ellipsis: true,
    },
    {
      title: '企业管理员手机号',
      dataIndex: 'managerPhone',
      order: 4,

      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.managerPhone} />],
    },
    {
      title: '关联房产',
      dataIndex: 'housePropertyList',
      order: 4,

      ellipsis: true,
      search: false,
      render: (_, row: any) => {
        const text =
          row.propertyRelList &&
          row.propertyRelList
            .map((i: any) => {
              return `${i.propertyName} ${i.roleName}`;
            })
            .join(';');
        return (
          <Tooltip key="detail" placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',

      key: 'option',
      search: false,
      render: (_, record) => {
        const edit = (
          <Access key="edit" accessible={access.functionAccess('masdata_editCrmEnterprise')}>
            <Button
              key="edit"
              type="link"
              onClick={() => {
                history.push({
                  pathname: '/base-center/customer-management/enterprise/edit',
                  query: {
                    isEdit: 'true',
                    bid: record.bid,
                  },
                });
              }}
            >
              编辑
            </Button>
          </Access>
        );
        const edit2 = (
          <Access
            key="edit2"
            accessible={access.functionAccess('masdata_deleteEnterpriseCustomer')}
          >
            <Button
              key="del"
              type="link"
              onClick={() => {
                confirm({
                  icon: <ExclamationCircleFilled />,
                  centered: true,
                  title: '确定删除客户',
                  content: (
                    <div>
                      <span>删除客户后在当前项目下无法找回</span>
                    </div>
                  ),
                  onOk: async () => {
                    const res = await deleteEnterprise({ bid: record.bid });
                    if (res.code === 'SUCCESS') {
                      message.success(res.message);
                      if (actionRef.current) {
                        actionRef.current.reload();
                      }
                    }
                  },
                  onCancel() {
                    console.log('Cancel');
                  },
                });
              }}
            >
              删除
            </Button>
          </Access>
        );

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: edit,
                },
                {
                  key: 'edit2',
                  label: edit2,
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                更多
                <CaretDownOutlined />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const handleDelSelection = async () => {
    confirm({
      icon: <ExclamationCircleFilled />,
      centered: true,
      title: '提示',
      content: '确定删除全部企业客户吗',
      onOk: async () => {
        const res = await deleteAllEnterprise({ projectBid });
        if (res.code === 'SUCCESS') {
          message.success(res.message);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Access accessible={access.functionAccess('masdata_batchDeleteEnterpriseCustomer')}>
          <span onClick={handleDelSelection}>全部删除</span>
        </Access>
      ),
    },
    {
      key: '2',
      label: <span>导出</span>,
    },
  ];

  return (
    <ProTable<EnterpriseType>
      className={style.tableStyle}
      columns={columns}
      actionRef={actionRef}
      cardBordered
      ghost={true}
      request={async (params = {}) => {
        const pageNo = params.current;
        delete params.current;
        const msg = await queryByPageEnterprise({
          ...params,
          projectBid: projectBid,
          pageNo,
        });
        return {
          data: msg.data.items,
          // success 请返回 true， 不然 table 会停止解析数据，即使有数据
          success: true,
          // 不传会使用 data 的长度，如果是分页一定要传
          total: msg.data.page.totalItems,
        };
      }}
      rowSelection={{
        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
        // 注释该行则默认不显示下拉选项
        defaultSelectedRowKeys: [],
      }}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space size={24}>
          <span>已选 {selectedRowKeys.length} 项</span>
          <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
            取消选择
          </a>
        </Space>
      )}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        onChange(value) {
          console.log('value: ', value);
        },
      }}
      rowKey="id"
      search={
        {
          labelWidth: 68,
          // defaultColsNumber: 7,
          labelAlign: 'left',
        } as any
      }
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      form={{
        colon: false,
      }}
      dateFormatter="string"
      headerTitle={
        <div>
          <Access key="edit" accessible={access.functionAccess('masdata_batchImportCrmEnterprise')}>
            <Button
              key="button"
              onClick={() => {
                history.push({
                  pathname: `/base-center/customer-management/batch-import`,
                  query: {
                    businessId: enterpriseCustomer.id,
                    businessType: '4',
                    path: enterpriseCustomer.path,
                    projectBid: projectBid || '',
                  },
                });
              }}
              type="default"
            >
              批量导入
            </Button>
          </Access>
          &nbsp;&nbsp;
          <Dropdown key="Dropdown" menu={{ items }} placement="bottomLeft">
            <Button>
              更多操作
              <CaretDownOutlined />
            </Button>
          </Dropdown>
        </div>
      }
      toolBarRender={() => [
        <Access key="edit" accessible={access.functionAccess('masdata_addCrmEnterprise')}>
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              history.push({
                pathname: '/base-center/customer-management/enterprise/add',
                query: {
                  isEdit: 'false',
                },
              });
            }}
          >
            新建企业客户
          </Button>
        </Access>,
      ]}
    />
  );
};
