import {
  QuestionCircleOutlined,
  RedoOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Tooltip, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from './style.less';
import { Access, useAccess, history } from 'umi';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { getQueryStaff, getStaffSync } from '@/services/base';
import ProjectSelect from '@/components/ProjectSelect';
import storageSy from '@/utils/Setting/storageSy';
import DepartmentTree from '@/components/DepartmentTree';
import { exportExcel } from '../utils/constant';
import Details from './details';
import DataMasking from '@/components/DataMasking';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const treeRef = useRef();
  const access = useAccess();
  const [loading, setLoading] = useState<boolean>(false);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectId, setProjectBid] = useState<string>(project ? project.bid : '');
  const [orgId, setOrgId] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<staffType>();
  const queryList = async (params: any) => {
    params.pageNo = params.current;
    params.projectId = projectId;
    params.orgId = orgId;
    const res = await getQueryStaff(params);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data.page?.totalItems,
    };
  };
  const onSelect = (selectedKeys: React.Key[]) => {
    setOrgId(selectedKeys && selectedKeys.length ? (selectedKeys[0] as string) : '');
    (actionRef.current as any).reset();
  };
  const handleChange = (bid: string) => {
    setProjectBid(bid);
    (actionRef.current as any).reset();
  };
  const syncTo = async () => {
    setLoading(true);
    const res = await getStaffSync({ projectId: project.bid });
    setLoading(false);
    if (res.code === 'SUCCESS') {
      (treeRef?.current as any).getTreeList();
      actionRef.current?.reload();
      message.success('同步成功');
    }
  };
  const columns: ProColumns<staffType>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInTable: true,
      renderFormItem: () => {
        return <ProjectSelect name="projectId" allowClear={false} handleChange={handleChange} />;
      },
    },
    {
      title: '员工姓名',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '所属部门',
      key: 'orgName',
      dataIndex: 'orgName',
      ellipsis: true,
      search: false,
    },
    {
      title: '手机号',
      key: 'mobile',
      dataIndex: 'mobile',
      ellipsis: true,
      render: (_, record) => [<DataMasking key="onlysee" text={record.mobile} />],
    },
    {
      title: '工号',
      key: 'empNo',
      dataIndex: 'empNo',
      ellipsis: true,
    },
    {
      title: '邮箱',
      key: 'workEmail',
      dataIndex: 'workEmail',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '在离职状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '在职',
        },
        2: {
          text: '离职',
        },
        3: {
          text: '未入职',
        },
        4: {
          text: '未知',
        },
      },
    },
    {
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      ellipsis: true,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      render: (text, row) => {
        const viewBtn = (
          <Access key="viewBtn" accessible={access.functionAccess('alitaMasdata_getStaffDetail')}>
            <a
              onClick={() => {
                setData(row);
                setOpen(true);
              }}
            >
              查看
            </a>
          </Access>
        );
        return viewBtn;
      },
    },
  ];

  const exportClick = async () => {
    const params = formRef?.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 1000000;
    params.excel = 'export';
    exportExcel('/staff/mng/staff', '员工信息', params, 'GET');
  };
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px' }}>
            <DepartmentTree projectBid={projectId} ref={treeRef} onSelectChange={onSelect} />
          </div>
        </Pane>
        <Pane>
          <ProTable<staffType>
            className={styles.tableStyle}
            columns={columns}
            actionRef={actionRef}
            formRef={formRef}
            cardBordered
            form={{
              colon: false,
            }}
            request={queryList}
            pagination={{
              showSizeChanger: true,
            }}
            rowKey="id"
            search={
              {
                labelWidth: 78,
                labelAlign: 'left',
                // defaultColsNumber: 7,
              } as any
            }
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
            dateFormatter="string"
            headerTitle={
              <Access key="export" accessible={access.functionAccess('alitaMasdata_downloadStaff')}>
                <Button key="export" icon={<VerticalAlignBottomOutlined />} onClick={exportClick}>
                  导出
                </Button>
              </Access>
            }
            toolBarRender={() => [
              <Access key="button" accessible={access.functionAccess('alitaMasdata_syncStaff')}>
                <Space>
                  <Button type="primary" loading={loading} onClick={syncTo} icon={<RedoOutlined />}>
                    {loading ? '同步中' : '同步员工数据'}
                  </Button>
                  {loading ? (
                    <Tooltip title="数据同步中，请同步完成后再点击">
                      <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  ) : null}
                </Space>
              </Access>,
            ]}
          />
        </Pane>
      </SplitPane>
      <Details open={open} onOpenChange={setOpen} data={data} />
    </PageContainer>
  );
};
