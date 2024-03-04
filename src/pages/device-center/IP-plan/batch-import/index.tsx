import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { generateGetUrl } from '@/services/file';
import FileUpload from '@/components/FileUpload';
import { exportExcel } from '@/pages/base-center/utils/constant';
import { ipSpaceImport, ipSpaceImportCheck, queryIpSpaceImportRecordPage } from '@/services/device';
import moment from 'moment';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { businessId, businessType, path, projectBid } = history.location.query as any;
  const downloadTemplateFn = async () => {
    const { HIDE_GETEWAY } = process.env;

    const base = HIDE_GETEWAY ? '' : '/base';
    exportExcel(
      `${base}/auth/mng/ipSpace/template`,
      'IP位置规划导入模板',
      { projectId: projectBid },
      'GET',
    );
  };
  const downloadFile = async (fileUrl: string) => {
    window.location.href = fileUrl;
  };
  const resultModal = (
    res: Record<string, any>,
    title: string,
    successText: string,
    errorText: string,
  ) => {
    if (res.code === 'SUCCESS' && res.data?.failureCount > 0) {
      Modal.confirm({
        title,
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            {successText}
            <a>{res.data?.successCount}</a>条{errorText}
            <a style={{ color: 'red' }}>{res.data.failureCount}</a>条
          </div>
        ),
        okText: '导出失败数据',
        async onOk() {
          const urlRes = await generateGetUrl({
            bussinessId: businessId,
            urlList: [
              {
                objectId: res.data?.errorFileUrl || '',
              },
            ],
          });
          downloadFile(urlRes?.data?.urlList[0]?.presignedUrl?.url);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      actionRef.current?.reload();
    } else if (res.code === 'SUCCESS' && res.data?.failureCount === 0) {
      actionRef.current?.reload();
      Modal.success({
        title,
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            成功处理数据<a>{res.data?.successCount}</a>条
          </div>
        ),
        onCancel() {
          console.log('Cancel');
        },
      });
    }
  };
  const batchImport = async (objectId: string, info?: File) => {
    message.success(`文件上传成功，正在校验数据...`);
    const res = await ipSpaceImport({
      projectId: projectBid,
      excelObjectId: objectId,
      businessId,
    });
    resultModal(res, '批量导入', '导入成功数据', '导入失败数据');
  };
  const batchVerification = async (objectId: string, info?: File) => {
    message.success(`文件上传成功，正在校验数据...`);
    const res = await ipSpaceImportCheck({
      projectId: projectBid,
      excelObjectId: objectId,
      businessId,
    });
    resultModal(res, '批量校验', '正确数据', '错误数据');
  };

  const columns: ProColumns<ImportMainDataFileList>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: '100px',
      hideInSearch: true,
    },
    {
      title: '导入文件名',
      dataIndex: 'fileName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: '导入文件名',
      dataIndex: 'name',
      valueType: 'text',
      search: false,
    },
    {
      title: '操作人',
      dataIndex: 'creator',
      valueType: 'text',
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      order: 3,
      hideInSearch: true,
      render: (text, record) => {
        const date = moment(record.gmtCreated).format('YYYY-MM-DD HH:mm:ss');
        return <>{date}</>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      order: 3,
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            startTime: value[0] + ' 00:00:00',
            endTime: value[1] + ' 23:59:59',
          };
        },
      },
    },

    {
      title: '操作',
      valueType: 'option',
      width: 100,
      key: 'option',
      search: false,
      render: (_, record) => [
        <a
          key="download1"
          onClick={async () => {
            const urlRes = await generateGetUrl({
              bussinessId: businessId,
              urlList: [
                {
                  objectId: record.fileUrl || '',
                },
              ],
            });
            downloadFile(urlRes?.data?.urlList[0]?.presignedUrl?.url);
          }}
        >
          下载
        </a>,
      ],
    },
  ];
  const routes = [
    {
      path: '/device-center',
      breadcrumbName: '设备中心',
    },
    {
      path: '/device-center/IP-plan',
      breadcrumbName: 'IP位置规划',
    },
    {
      path: '/device-center/IP-plan/batch-import',
      breadcrumbName: '批量导入',
    },
  ];
  return (
    <PageContainer
      header={{
        // title: '批量导入',
        title: null,
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },

        onBack: () => {
          return history.goBack();
        },
      }}
    >
      <ProTable<ImportMainDataFileList>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={async (params, sort, filter): Promise<any> => {
          params.pageNo = params.current;
          params.businessId = businessId;
          params.projectBid = projectBid;
          console.log(params, filter);
          const msg = await queryIpSpaceImportRecordPage({
            ...params,
          });
          return {
            data: msg.data?.items,
            success: true,
            total: msg.data?.page.totalItems,
          };
        }}
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
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        dateFormatter="string"
        headerTitle={
          <div>
            <FileUpload
              key="importData"
              buttonType="primary"
              onUploadSuccess={batchImport}
              buttonText="批量上传"
              fileType="file"
              listType="text"
              maxCount={1}
              showUploadList={false}
              business={{
                id: businessId,
                path,
              }}
            />
          </div>
        }
        toolBarRender={() => [
          <Button type="default" key="downloadTemplate" onClick={downloadTemplateFn}>
            下载模板
          </Button>,
          <FileUpload
            key="importData"
            onUploadSuccess={batchVerification}
            buttonText="批量校验"
            fileType="file"
            listType="text"
            maxCount={1}
            showUploadList={false}
            business={{
              id: businessId,
              path,
            }}
          />,
        ]}
      />
    </PageContainer>
  );
};
