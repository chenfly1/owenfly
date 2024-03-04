import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import {
  downloadTemplate,
  generateGetUrl,
  getImportMainDataFileList,
  getMainDataErroFile,
  importMainData,
  importMainDataVerifiction,
} from '@/services/file';
import FileUpload from '@/components/FileUpload';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { businessId, businessType, path, projectBid } = history.location.query as any;
  const downloadTemplateFn = async () => {
    const res = await downloadTemplate({ businessType });
    window.location.href = res.data.fileUrl;
  };
  const downloadFile = async (objectId?: string) => {
    if (!objectId) {
      return;
    }
    const res = await generateGetUrl({
      bussinessId: businessId,
      urlList: [
        {
          objectId,
        },
      ],
    });
    window.location.href = res.data.urlList[0].presignedUrl.url;
  };
  const downloadErrorFile = (content: any, filename: string) => {
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  };
  const resultModal = (
    res: ResultData<ImportMainDataFile>,
    title: string,
    successText: string,
    errorText: string,
  ) => {
    if (res.code === 'SUCCESS' && res.data?.error > 0) {
      Modal.confirm({
        title,
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: (
          <div>
            {successText}
            <a>{res.data?.correct}</a>条{errorText}
            <a style={{ color: 'red' }}>{res.data.error}</a>条
          </div>
        ),
        okText: '导出失败数据',
        async onOk() {
          const errorRes = await getMainDataErroFile(res.data.errorFileUrl);
          downloadErrorFile(errorRes, `${new Date().toISOString()}.xlsx`);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      actionRef.current?.reload();
    } else if (res.code === 'SUCCESS' && res.data?.error === 0) {
      Modal.success({
        title,
        icon: <ExclamationCircleFilled />,
        content: (
          <div>
            成功处理数据<a>{res.data?.correct}</a>条
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
    const res = await importMainData({
      businessType,
      fileName: info?.name || '',
      projectBid: projectBid,
      objectId,
    });
    resultModal(res, '批量导入', '导入成功数据', '导入失败数据');
  };
  const batchVerification = async (objectId: string, info?: File) => {
    message.success(`文件上传成功，正在校验数据...`);
    const res = await importMainDataVerifiction({
      businessType,
      fileName: info?.name || '',
      projectBid: projectBid,
      objectId,
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
      dataIndex: 'name',
      valueType: 'text',
      width: '400px',
    },
    {
      title: '操作人',
      dataIndex: 'gmtCreator',
      valueType: 'text',
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',

      order: 3,
      hideInSearch: true,
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
            start: value[0],
            end: value[1],
          };
        },
      },
    },

    {
      title: '操作',

      key: 'option',
      width: '100px',
      search: false,
      render: (_, record) => [
        <a
          key="download"
          onClick={() => {
            downloadFile(record.fileUrl);
          }}
        >
          下载
        </a>,
      ],
    },
  ];
  console.log(history.location);
  const routes = [
    {
      path: '/base-center',
      breadcrumbName: '资源中心',
    },
    {
      path: '/base-center/parking-space',
      breadcrumbName:
        history.location.pathname === '/base-center/parking-space/batch-import'
          ? '产权管理'
          : '客户管理',
    },
    {
      path: '/base-center/parking-space/batch-import',
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
          params.businessType = businessType;
          params.projectBid = projectBid;
          console.log(params, filter);
          const msg = await getImportMainDataFileList({
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
            labelWidth: 68,
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
