import { ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { generateGetUrl } from '@/services/file';
import { excelRecord, importMainData } from '@/services/payment';
import FileUpload from '@/components/FileUpload';
import { Method } from '@/utils';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { businessId, businessType, path, projectBid, billType } = history.location.query as any;
  const [exporting, setExporting] = useState(false);

  const downloadTemplateFn = async () => {
    setExporting(true);
    let url: string = '';
    let name: string = '';
    if (billType === '0') {
      url = '/content/mng/bill_list/water/tmp';
      name = '水费账单模板';
    } else if (billType === '1') {
      url = '/content/mng/bill_list/electric/tmp';
      name = '电费账单模板';
    } else if (billType === '2') {
      url = '/content/mng/bill_list/manage/tmp';
      name = '物业费账单模板';
    }
    Method.exportExcel(
      url,
      `${name}_${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      {
        excel: 'export',
      },
      'GET',
    ).finally(() => {
      setExporting(false);
    });
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
    res: ResultData<ImportErrorFileType>,
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
          downloadFile(res.data.errorFileUrl);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      actionRef.current?.reload();
    } else if (res.code === 'SUCCESS' && res.data?.failureCount === 0) {
      Modal.success({
        title,
        icon: <ExclamationCircleFilled />,
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
    const res = await importMainData({
      excelObjectId: objectId,
      businessId: businessId,
      type: billType,
      params: {
        checkOrImport: 'import',
      },
    });
    resultModal(res, '批量导入', '导入成功数据', '导入失败数据');
  };
  const batchVerification = async (objectId: string, info?: File) => {
    message.success(`文件上传成功，正在校验数据...`);
    const res = await importMainData({
      excelObjectId: objectId,
      businessId: businessId,
      type: billType,
      params: {
        checkOrImport: 'check',
      },
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
      dataIndex: 'creator',
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
            startTime: value[0] + ' 00:00:00',
            endTime: value[1] + ' 23:59:59',
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
  return (
    <PageContainer
      header={{
        title: '批量导入',
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
          // params.businessType = businessType;
          params.projectBid = projectBid;
          console.log(params, filter);
          const msg = await excelRecord({
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
        }}
        rowKey="id"
        search={
          {
            labelWidth: 90,
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
          <Button
            type="default"
            key="downloadTemplate"
            onClick={downloadTemplateFn}
            loading={exporting}
          >
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
