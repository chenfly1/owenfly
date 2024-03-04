import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getOperationLogByPage } from '@/services/auth';
import { Button } from 'antd';
// import { exportExcel } from '@/utils/Method/exportExcel';
import styles from './style.less';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Access, useAccess } from 'umi';
import ProjectSelect from '@/components/ProjectSelect';
import storageSy from '@/utils/Setting/storageSy';
import Details from './details';
import { exportExcel } from '@/pages/base-center/utils/constant';
import moment from 'moment';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [detailsVisit, setDetailsVisit] = useState<boolean>(false);
  const [veiwData, setveiwData] = useState<OperationType>();
  const projectInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectId, setProjectId] = useState<string>(projectInfo ? projectInfo.bid : '');
  const handleChange = (bid: string) => {
    setProjectId(bid);
    actionRef.current?.reload();
  };
  const columns: ProColumns<OperationType>[] = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInTable: true,
      order: 4,
      renderFormItem: () => {
        return <ProjectSelect name="projectId" allowClear={false} handleChange={handleChange} />;
      },
    },
    // {
    //   title: '日志编号',
    //   dataIndex: 'code',
    //   ellipsis: true,
    //   search: false,
    // },
    {
      title: '操作功能',
      dataIndex: 'operation',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'creator',
      ellipsis: true,
    },
    {
      title: '操作账号',
      dataIndex: 'account',
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            start: value[0],
            end: moment(value[1]).add(1, 'days').format('YYYY-MM-DD'),
          };
        },
      },
    },
    {
      title: '操作时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作IP',
      dataIndex: 'ip',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      render: (text, row) => {
        const viewBtn = (
          // <Access key="viewBtn" accessible={access.functionAccess('alitaMasdata_getStaffDetail')}>
          <a
            onClick={() => {
              setveiwData(row);
              setDetailsVisit(true);
            }}
          >
            查看
          </a>
          // </Access>
        );
        return viewBtn;
      },
    },
  ];

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    if (params.account === '') {
      delete params.account;
    }
    const msg = await getOperationLogByPage({
      ...params,
      projectId,
      pageNo: params.current,
    });
    return {
      data: msg.data.items,
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  const onExportClick = async () => {
    const params = formRef.current?.getFieldFormatValueObject!();
    params.pageNo = 1;
    params.pageSize = 100000;
    params.excel = 'export';
    exportExcel('/base/auth/mng/audit', '操作日志', params);
  };

  const headerTitle = () => {
    return (
      // <Access accessible={access.functionAccess('alitaMasdata_queryIpSpace')}>
      <Button
        key="button"
        icon={<VerticalAlignBottomOutlined />}
        onClick={() => {
          onExportClick();
        }}
      >
        导出
      </Button>
      // </Access>
    );
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<OperationType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        className={styles.tableStyle}
        form={{
          colon: false,
        }}
        headerTitle={headerTitle()}
        request={getByPage}
        rowKey="id"
        search={{
          labelWidth: 100,
        }}
        pagination={{
          showSizeChanger: true,
        }}
      />
      <Details modalVisit={detailsVisit} onOpenChange={setDetailsVisit} data={veiwData as any} />
    </PageContainer>
  );
};
