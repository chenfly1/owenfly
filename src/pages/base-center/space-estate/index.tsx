import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import ActionGroup from '@/components/ActionGroup';
import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Dropdown,
  MenuProps,
  Modal,
  Row,
  Select,
  Space,
  UploadFile,
  message,
  notification,
} from 'antd';
import {
  autoBindPropertySpace,
  bindPropertySpace,
  getPhysicalSpaceList,
  getPropertySpaceList,
  getPropertySpaceListSearch,
  importBind,
  importPhysicalSpace,
  unbindPropertySpace,
} from '@/services/space';
import {
  CloseCircleOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { storageSy } from '@/utils/Setting';
import Dragger from 'antd/lib/upload/Dragger';
import { Method } from '@/utils';
import { buildingHouseBind } from '@/components/FileUpload/business';
import { exportExcel } from '../utils/constant';
import moment from 'moment';
import { generateGetUrl } from '@/services/file';
import { debounce } from 'lodash';
import { Access, useAccess } from 'umi';

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [objectId, setObjectId] = useState<string>();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [isBindModalOpen, setIsBindModalOpen] = useState<boolean>(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState<boolean>(false);
  const [selectedEstate, setSelectedEstate] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<Record<string, any>[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Record<string, any>>();
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [autoResult, setAutoResult] = useState<{ failed: number; success: number }>();
  const [isResModalOpen, setIsResModalOpen] = useState<boolean>(false);
  const [importResData, setImportResData] = useState<ImportPhysicalSpaceType>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const access = useAccess();

  const reload = () => {
    actionRef.current?.reload();
  };

  const { confirm } = Modal;

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true, // 翻页记录上一页数据
    defaultSelectedRowKeys: [],
    getCheckboxProps: (record: DataType) => ({
      disabled: record.bindResult !== 1,
    }),
    onChange: onSelectChange,
  };

  const columns: ProColumns<any>[] = [
    {
      title: '产权',
      dataIndex: 'roomName',
      ellipsis: true,
      search: false,
    },
    {
      title: '空间',
      dataIndex: 'spaceName',
      hideInTable: true,
      ellipsis: true,
      order: 3,
    },
    {
      title: '空间',
      dataIndex: 'spaceAllName',
      hideInSearch: true,
      ellipsis: true,
      order: 3,
    },
    {
      title: '绑定结果',
      dataIndex: 'bindResult',
      ellipsis: true,
      valueEnum: {
        0: {
          text: '未绑定',
          status: 'Error',
        },
        1: {
          text: '绑定成功',
          status: 'Success',
        },
        2: {
          text: '解绑成功',
          status: 'Warning',
        },
        3: {
          text: '绑定失败',
          status: 'Error',
        },
      },
      order: 1,
    },
    {
      title: '绑定时间',
      valueType: 'date',
      dataIndex: 'bindTime',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '绑定时间',
      dataIndex: 'gmtBind',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
      search: {
        transform: (value) => {
          return {
            startTime: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment(value[1]).add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      width: 150,
      key: 'option',
      search: false,
      render: (_, record) => {
        return (
          <ActionGroup
            actions={[
              {
                key: 'bind',
                text: '绑定',
                accessKey: 'alitaBaseConfig_property_space_single_bind',
                hidden: record.bindResult === 1,
                onClick: async () => {
                  const res = await getPhysicalSpaceList({
                    projectBid: project.bid,
                    spaceType: 'ROOM',
                    pageNo: 1,
                    pageSize: 500,
                  });
                  setSelectedOption(res.data?.items);
                  setCurrentRecord(record);
                  setIsBindModalOpen(true);
                },
              },
              {
                key: 'off-bind',
                text: '解除绑定',
                accessKey: 'alitaBaseConfig_property_space_unbind_s',
                hidden: record.bindResult !== 1,
                danger: true,
                onClick() {
                  confirm({
                    title: '你确定要解除绑定吗',
                    icon: <InfoCircleOutlined style={{ color: 'red' }} />,
                    okText: '解除绑定',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: async () => {
                      const res = await unbindPropertySpace({
                        projectId: project.bid,
                        propertyBids: [record.propertyBid],
                      });
                      if (res.code === 'SUCCESS') {
                        message.success(res.message);
                        reload();
                      }
                    },
                    onCancel() {
                      console.log('Cancel');
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

  const downloadItems: MenuProps['items'] = [
    access.functionAccess('alitaBaseConfig_property_page_query')
      ? {
          label: '下载产权数据',
          key: '1',
          icon: <UserOutlined />,
        }
      : null,
    access.functionAccess('alitaBaseConfig_property_space_page_query_0')
      ? {
          label: '下载空间-产权绑定列表',
          key: '2',
          icon: <UserOutlined />,
        }
      : null,
  ];

  const headerTitle = () => {
    return (
      <ActionGroup
        scene="tableHeader"
        selection={{
          count: selectedRowKeys.length,
        }}
        actions={[
          {
            key: 'batchOffBind',
            text: '批量解除绑定',
            accessKey: 'alitaBaseConfig_property_space_unbind_b',
            disabled: selectedRowKeys.length === 0,
            onClick: () => {
              confirm({
                title: `你确定要解除绑定这 ${selectedRowKeys.length} 项吗`,
                icon: <InfoCircleOutlined style={{ color: 'red' }} />,
                okText: '解除绑定',
                okType: 'danger',
                cancelText: '取消',
                onOk: async () => {
                  const res = await unbindPropertySpace({
                    projectId: project.bid,
                    propertyBids: selectedRowKeys,
                  });
                  if (res.code === 'SUCCESS') {
                    setSelectedRowKeys([]);
                    message.success(res.message);
                    reload();
                  }
                },
                onCancel() {
                  console.log('Cancel');
                },
              });
            },
          },
          {
            key: 'batchImport',
            text: '批量导入',
            accessKey: 'alitaBaseConfig_property_space_import_bind',
            onClick: () => {
              setImportModalOpen(true);
              // Modal.success({
              //   content: '导入成功',
              // });
            },
          },
        ]}
      />
    );
  };

  const getByPage = async (params: Record<string, any>) => {
    const tParams = {
      ...params,
      pageNo: params.current,
      current: undefined,
      projectId: project.bid,
    };
    const res = await getPropertySpaceList(tParams);
    return {
      data: res.data?.items,
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const handleDownloadClick: MenuProps['onClick'] = (e) => {
    message.loading('下载中...');
    if (e.key === '1') {
      Method.exportExcel(
        '/masdata/mng/property_space/bind/property/queryByPage',
        '产权',
        { excel: 'export', projectId: project.bid },
        'POST',
      ).finally(() => {
        message.destroy();
      });
    } else {
      Method.exportExcel(
        '/masdata/mng/property_space/bind/queryByPage',
        '产权-空间绑定',
        { excel: 'export', projectId: project.bid },
        'POST',
      ).finally(() => {
        message.destroy();
      });
    }
  };

  const handleBindOk = async () => {
    message.loading('绑定中...');
    const res = await bindPropertySpace({
      houseBid: currentRecord?.propertyBid,
      spaceId: selectedEstate,
      projectId: project.bid,
    });
    if (res.code === 'SUCCESS') {
      message.success('绑定成功');
      setIsBindModalOpen(false);
      setSelectedEstate('');
      reload();
    }
    message.destroy();
  };

  const importModalOk = async () => {
    message.loading('导入中...');
    const res = await importBind({
      excelObjectId: objectId,
      businessId: 'building_house',
      type: 'import',
    });
    message.destroy();
    if (res.code === 'SUCCESS') {
      message.success('导入成功');
      setImportResData(res.data);
      setImportModalOpen(false);
      setIsResModalOpen(true);
      setFileList([]);
      setObjectId('');
    }
    reload();
  };

  const uploadFile = async (options: any) => {
    const { file, onSuccess } = options;
    Method.uploadFile(file, buildingHouseBind).then(async (url: any) => {
      const _response = { name: file.name, status: 'done', path: url };
      setObjectId(url);
      setFileList([file]);
      onSuccess(_response, file);
    });
  };

  return (
    <PageContainer header={{ title: null }}>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        headerTitle={headerTitle()}
        tableAlertRender={false}
        rowSelection={rowSelection}
        cardBordered
        request={getByPage}
        rowKey="propertyBid"
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access
            key="button"
            accessible={
              access.functionAccess('alitaBaseConfig_property_space_page_query_0') &&
              access.functionAccess('alitaBaseConfig_property_page_query')
            }
          >
            <Dropdown
              key="download"
              menu={{
                items: downloadItems,
                onClick: handleDownloadClick,
              }}
            >
              <Button>
                <Space>
                  下载
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Access>,
          <Access
            key="button"
            accessible={access.functionAccess('alitaBaseConfig_property_space_auto_bind')}
          >
            <Button
              key="match"
              type="primary"
              onClick={async () => {
                message.loading('比对中...');
                const res = await autoBindPropertySpace({ projectId: project.bid });
                message.destroy();
                setAutoResult(res.data);
                setIsAutoModalOpen(true);
              }}
            >
              自动比对
            </Button>
          </Access>,
        ]}
      />
      <Modal
        title="绑定"
        open={isBindModalOpen}
        onOk={handleBindOk}
        onCancel={() => {
          setIsBindModalOpen(false);
          setSelectedEstate('');
        }}
      >
        <Row align="middle" gutter={16}>
          <Col>选择空间</Col>
          <Col>
            <Select
              showSearch
              value={selectedEstate}
              style={{ width: 360 }}
              filterOption={false}
              onSearch={debounce(async (value) => {
                const res = await getPhysicalSpaceList({
                  projectBid: project.bid,
                  name: value,
                  spaceType: 'ROOM',
                  pageNo: 1,
                  pageSize: value ? 5000 : 500,
                });
                setSelectedOption(res.data?.items);
              }, 300)}
              onChange={(value) => {
                setSelectedEstate(value);
              }}
              options={(selectedOption || []).map((item) => ({ value: item.id, label: item.name }))}
            />
          </Col>
        </Row>
      </Modal>
      <Modal
        title="选择导入文件"
        open={importModalOpen}
        width={600}
        onOk={importModalOk}
        onCancel={() => {
          setImportModalOpen(false);
          setFileList([]);
          setObjectId('');
        }}
      >
        <Row justify="end">
          <Button
            type="link"
            onClick={async () => {
              message.loading('下载中...');
              Method.exportExcel(
                '/masdata/mng/property_space/bind/import/template',
                '导入模版',
                {},
                'GET',
              ).finally(() => {
                message.destroy();
              });
            }}
          >
            下载导入模版
          </Button>
        </Row>
        <Dragger
          maxCount={1}
          customRequest={(options) => uploadFile(options)}
          onRemove={() => {
            setFileList([]);
          }}
          fileList={fileList}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
        </Dragger>
      </Modal>
      <Modal
        title="自动比对结果"
        open={isAutoModalOpen}
        footer={null}
        onCancel={() => setIsAutoModalOpen(false)}
      >
        <Row style={{ marginBottom: '20px' }}>
          {`空间共 ${
            (autoResult?.success || 0) + (autoResult?.failed || 0)
          } 条，空间-产权比对成功 ${autoResult?.success || 0} 条`}
        </Row>
        <Row style={{ marginBottom: '40px' }}>
          <Button
            type={'link'}
            onClick={() => {
              message.loading('下载中...');
              Method.exportExcel(
                '/masdata/mng/property_space/bind/auto_bind/export',
                '空间信息',
                {
                  projectId: project.bid,
                },
                'GET',
              ).finally(() => {
                message.destroy();
              });
            }}
          >
            下载比对结果
          </Button>
        </Row>
        <Row>
          <Row align={'middle'} gutter={16}>
            <Col>
              <ExclamationCircleOutlined />
            </Col>
            <Col>比对结果不会导入到系统中，请下载检查后手动导入</Col>
          </Row>
        </Row>
      </Modal>

      <Modal
        title="批量导入结果"
        open={isResModalOpen}
        onCancel={() => setIsResModalOpen(false)}
        onOk={() => {
          setIsResModalOpen(false);
          setImportModalOpen(true);
        }}
        okText="继续批量导入"
        cancelText="关闭"
      >
        <Row style={{ marginBottom: '20px' }}>
          {`导入 ${
            (importResData?.successCount || 0) + (importResData?.failureCount || 0)
          } 条空间数据，成功 ${importResData?.successCount || 0} 条，失败 ${
            importResData?.failureCount || 0
          } 条`}
        </Row>
        {(importResData?.failureCount || 0) > 0 && (
          <Row style={{ marginBottom: '40px' }}>
            <Button
              type={'link'}
              onClick={async () => {
                const urlRes = await generateGetUrl({
                  bussinessId: 'alita_device',
                  urlList: [
                    {
                      objectId: importResData?.errorFileUrl || '',
                    },
                  ],
                });
                window.location.href = urlRes?.data?.urlList[0]?.presignedUrl?.url;
              }}
            >
              下载不符合要求的列表
            </Button>
          </Row>
        )}
      </Modal>
    </PageContainer>
  );
};
