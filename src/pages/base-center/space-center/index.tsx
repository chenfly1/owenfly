import type { TreeProps } from 'antd/es/tree';
import styles from './style.less';
import DraggableSpaceTree from '@/components/DraggableSpaceTree';
import { PageContainer } from '@ant-design/pro-layout';
import { storageSy } from '@/utils/Setting';
import { useRef, useState } from 'react';
import { deleteSpace, importPhysicalSpace } from '@/services/space';
import { deviceBusiness } from '@/components/FileUpload/business';
import { message, Button, Dropdown, Tag, Modal, Checkbox, Row, UploadFile } from 'antd';
import {
  MoreOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { MenuProps } from 'antd/es/menu';
import { ReactComponent as AreaSVG } from '@/assets/svg/AREA.svg';
import { ReactComponent as BuildingSVG } from '@/assets/svg/BUILDING.svg';
import { ReactComponent as CarparkSVG } from '@/assets/svg/CARPARK.svg';
import { ReactComponent as FloorSVG } from '@/assets/svg/FLOOR.svg';
import { ReactComponent as PassageSVG } from '@/assets/svg/PASSAGE.svg';
import { ReactComponent as ProjectStageSVG } from '@/assets/svg/PROJECT_STAGE.svg';
import { ReactComponent as ProjectSVG } from '@/assets/svg/PROJECT.svg';
import { ReactComponent as PublicAreaSVG } from '@/assets/svg/PUBLIC_AREA.svg';
import { ReactComponent as RoomSVG } from '@/assets/svg/ROOM.svg';
import { ReactComponent as UnitSVG } from '@/assets/svg/UNIT.svg';
import SpaceForm from './space-form';
import Dragger from 'antd/lib/upload/Dragger';
import { Method } from '@/utils';
import RenameForm from './rename';
import ImageForm from './view-image';
import { generateGetUrl } from '@/services/file';
import ActionGroup from '@/components/ActionGroup';

const TableList: React.FC = () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [projectBid, setProjectBid] = useState<string>(project ? project.bid : '');
  const [objectId, setObjectId] = useState<string>();
  const [treeNode, setTreeNode] = useState<any>();
  const treeRef = useRef<any>();
  const [rightPaneStatus, setRightPaneStatus] = useState<string>('');
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importResData, setImportResData] = useState<ImportPhysicalSpaceType>();
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportModalData, setExportModalData] = useState<any>([]);
  const [isResModalOpen, setIsResModalOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  let popupSelect = '';

  const { confirm } = Modal;

  const confirmAbort = (onOk: () => void, onCancel: () => void = () => {}) => {
    confirm({
      title: '确认放弃当前编辑吗？',
      icon: <ExclamationCircleFilled />,
      content: '放弃后当前编辑内容将不会保存',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk,
      onCancel,
    });
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    if (popupSelect === 'DEL') {
      popupSelect = '';
      return;
    }
    setTreeNode(info.node as any);
    if (popupSelect !== '') {
      setRightPaneStatus(popupSelect);
      popupSelect = '';
    } else {
      setRightPaneStatus('RENAME');
    }
  };

  const spaceTypeMap = {
    PROJECT: '项目',
    PROJECT_STAGE: '分期',
    BUILDING: '楼栋',
    UNIT: '单元',
    FLOOR: '楼层',
    ROOM: '住宅',
    ROOM_DEVICE: '设备房',
    ROOM_BUSINESS: '商业',
    PUBLIC_AREA: '公区',
    CARPARK: '车场 ',
    AREA: '区域',
    PASSAGE: '通道',
  };

  const getItems = (item: any) => {
    const ail = [
      // 0
      {
        key: 'PROJECT_STAGE',
        label: (
          <a
            onClick={() => {
              popupSelect = 'PROJECT_STAGE';
            }}
          >
            分期
          </a>
        ),
      },
      // 1
      {
        key: 'BUILDING',
        label: (
          <a
            onClick={() => {
              popupSelect = 'BUILDING';
            }}
          >
            楼栋
          </a>
        ),
      },
      // 2
      {
        key: 'UNIT',
        label: (
          <a
            onClick={() => {
              popupSelect = 'UNIT';
            }}
          >
            单元
          </a>
        ),
      },
      // 3
      {
        key: 'FLOOR',
        label: (
          <a
            onClick={() => {
              popupSelect = 'FLOOR';
            }}
          >
            楼层
          </a>
        ),
      },
      // 4
      {
        key: 'ROOM',
        label: (
          <a
            onClick={() => {
              popupSelect = 'ROOM';
            }}
          >
            房间
          </a>
        ),
      },
      // 5
      {
        key: 'PUBLIC_AREA',
        label: (
          <a
            onClick={() => {
              popupSelect = 'PUBLIC_AREA';
            }}
          >
            公区
          </a>
        ),
      },
    ];

    const addItems = {
      PROJECT: [ail[0], ail[1], ail[4], ail[5]],
      PROJECT_STAGE: [ail[1], ail[4], ail[5]],
      BUILDING: [ail[2], ail[3], ail[4], ail[5]],
      UNIT: [ail[3], ail[5]],
      FLOOR: [ail[4], ail[5]],
      PUBLIC_AREA: [ail[5]],
    };

    const items: MenuProps['items'] = [
      {
        key: 'rename',
        label: (
          <a
            onClick={() => {
              popupSelect = 'RENAME';
            }}
          >
            重命名
          </a>
        ),
      },
      {
        key: 'add',
        label: '新建',
        children: addItems[item.spaceType as string],
      },
      {
        key: 'image',
        label: (
          <a
            onClick={() => {
              popupSelect = 'IMAGE';
            }}
          >
            查看图片
          </a>
        ),
      },
      {
        key: 'del',
        danger: true,
        disabled: ['PROJECT'].includes(item.spaceType),
        label: (
          <a
            onClick={() => {
              popupSelect = 'DEL';
              confirm({
                title: '确认删除空间吗？',
                icon: <ExclamationCircleFilled />,
                content: '删除后可能影响设备和产权的绑定，请谨慎操作',
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk: async () => {
                  const msg = await deleteSpace({ id: item.id });
                  if (msg.code === 'SUCCESS') {
                    message.success('删除成功');
                    treeRef.current.getTreeList();
                  }
                },
                onCancel() {},
              });
            }}
          >
            删除
          </a>
        ),
      },
    ];
    return addItems[item.spaceType as string] ? items : [...items.slice(0, 1), ...items.slice(2)];
  };

  const SvgRender = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <ProjectSVG className={styles.icon} />;
      case 'PROJECT_STAGE':
        return <ProjectStageSVG className={styles.icon} />;
      case 'BUILDING':
        return <BuildingSVG className={styles.icon} />;
      case 'UNIT':
        return <UnitSVG className={styles.icon} />;
      case 'FLOOR':
        return <FloorSVG className={styles.icon} />;
      case 'ROOM':
        return <RoomSVG className={styles.icon} />;
      case 'ROOM_BUSINESS':
        return <RoomSVG className={styles.icon} />;
      case 'ROOM_DEVICE':
        return <RoomSVG className={styles.icon} />;
      case 'PUBLIC_AREA':
        return <PublicAreaSVG className={styles.icon} />;
      case 'CARPARK':
        return <CarparkSVG className={styles.icon} />;
      case 'AREA':
        return <AreaSVG className={styles.icon} />;
      case 'PASSAGE':
        return <PassageSVG className={styles.icon} />;
      default:
        return <ProjectSVG className={styles.icon} />;
    }
  };

  const onTitleRender = (item: any) => {
    return (
      <div className={styles.treeRender}>
        {SvgRender(item.spaceType as string)}
        <div className={styles.content}>
          <div>{item.name}</div>
          <Dropdown
            // onOpenChange={() => setModalData(item)}
            className={styles.spaceDropdown}
            menu={{ items: getItems(item) }}
            placement="bottomRight"
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>
    );
  };

  const importModalOk = async () => {
    message.loading('导入中...');
    const res = await importPhysicalSpace({
      projectId: projectBid,
      excelObjectId: objectId,
      businessId: 'alita_device',
    });
    message.destroy();
    if (res.code === 'SUCCESS') {
      message.success('导入成功');
      treeRef.current.getTreeList();
      setImportResData(res.data);
      setImportModalOpen(false);
      setIsResModalOpen(true);
      setFileList([]);
      setObjectId('');
    }
  };

  const exportModalOk = async () => {
    message.loading('导出中...');
    Method.exportExcel(
      '/base/auth/space/physical_space/export',
      '空间信息',
      {
        projectId: projectBid,
        spaceTypes: exportModalData,
      },
      'GET',
    ).finally(() => {
      message.destroy();
      setExportModalOpen(false);
    });
  };

  const uploadFile = async (options: any) => {
    const { file, onSuccess } = options;
    Method.uploadFile(file, deviceBusiness).then(async (url: any) => {
      const _response = { name: file.name, status: 'done', path: url };
      setObjectId(url);
      setFileList([file]);
      onSuccess(_response, file);
    });
  };

  const renderForm = () => {
    switch (rightPaneStatus) {
      case 'RENAME':
        return (
          <RenameForm
            treeNode={treeNode}
            onSubmit={() => {
              treeRef.current.getTreeList();
              setRightPaneStatus('');
            }}
            onCancel={() => {
              confirmAbort(() => {
                setRightPaneStatus('');
              });
            }}
          />
        );
      case 'IMAGE':
        return (
          <ImageForm
            treeNode={treeNode}
            onSubmit={() => {
              treeRef.current.getTreeList();
              setRightPaneStatus('');
            }}
            onCancel={() => {
              confirmAbort(() => {
                setRightPaneStatus('');
              });
            }}
          />
        );
      case 'PROJECT_STAGE':
      case 'BUILDING':
      case 'UNIT':
      case 'FLOOR':
      case 'ROOM':
      case 'PUBLIC_AREA':
      default:
        return (
          <SpaceForm
            treeNode={treeNode}
            selectedSpaceType={rightPaneStatus}
            onSubmit={() => {
              treeRef.current.getTreeList();
              setRightPaneStatus('');
            }}
            onCancel={() => {
              confirmAbort(() => {
                setRightPaneStatus('');
              });
            }}
          />
        );
    }
  };

  // const handleChange = (bid: string) => {
  //   setProjectBid(bid);
  //   treeRef.current.getTreeList();
  //   setRightPaneStatus('');
  // };

  return (
    <PageContainer
      header={{
        // title: (
        //   <div className={styles.topTitle} style={{ display: 'flex', alignItems: 'center' }}>
        //     <div style={{ marginRight: '20px' }}>空间管理</div>
        //     <ProjectSelect name="projectBid" allowClear={false} handleChange={handleChange} />
        //   </div>
        // ),
        title: '空间管理',
        extra: (
          <ActionGroup
            actions={[
              {
                key: 'import',
                type: 'default',
                style: { padding: '5px 10px', height: 'auto' },
                text: '导入空间信息',
                accessKey: 'alitaMasdata_importPhysicalSpace',
                icon: <DownloadOutlined />,
                onClick: () => {
                  setImportModalOpen(true);
                },
              },
              {
                key: 'export',
                type: 'default',
                style: { padding: '5px 10px', height: 'auto' },
                text: '导出空间信息',
                accessKey: 'alitaMasdata_importPhysicalSpace',
                icon: <UploadOutlined />,
                onClick: () => {
                  setExportModalOpen(true);
                },
              },
            ]}
          />
        ),
      }}
    >
      <div style={{ marginBottom: '50px' }}>
        <SplitPane>
          <Pane initialSize={'400px'} maxSize="50%">
            <div
              style={{
                padding: '20px 0 20px 20px',
                height: 'calc(100vh - 103px)',
                overflowY: 'scroll',
              }}
            >
              <DraggableSpaceTree
                ref={treeRef}
                titleRender={onTitleRender}
                projectBid={projectBid || ''}
                cardProps={{ bodyStyle: { padding: '0' } }}
                onSelectChange={onSelect}
              />
            </div>
          </Pane>
          <Pane>
            {rightPaneStatus !== '' && (
              <div className={styles.rightPaneContent}>
                <div className={styles.top}>
                  <div className={styles.title}>{treeNode?.rowName || '请选择空间'}</div>
                  <Tag>{spaceTypeMap[treeNode?.spaceType] || '-'}</Tag>
                </div>
                {renderForm()}
              </div>
            )}
          </Pane>
        </SplitPane>
      </div>

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
                '/base/auth/space/physical_space/template',
                '导入模版',
                {
                  projectId: projectBid,
                },
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
            setObjectId('');
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

      <Modal
        title="选择导出模版"
        open={exportModalOpen}
        width={600}
        onOk={exportModalOk}
        onCancel={() => {
          setExportModalOpen(false);
        }}
      >
        <Checkbox.Group
          style={{ width: '100%' }}
          onChange={(checkedValues) => {
            setExportModalData(checkedValues);
          }}
        >
          <Checkbox value="ROOM" style={{ marginBottom: 20 }}>
            住宅
            <span style={{ color: '#aaa' }}>
              （导出所有空间类型是住宅房屋节点，一般用于<strong>导出后补充产权信息</strong>）；
            </span>
          </Checkbox>
          <br />
          <Checkbox value="PUBLIC_AREA" style={{ marginBottom: 20 }}>
            公区
            <span style={{ color: '#aaa' }}>
              （导出空间类型是公区的节点，一般用于<strong>公区IP-点位规划</strong>）；
            </span>
          </Checkbox>
          <br />
          <Checkbox value="ROOM_DEVICE" style={{ marginBottom: 20 }}>
            设备房<span style={{ color: '#aaa' }}>（导出空间类型是设备房的节点）；</span>
          </Checkbox>
          <br />
          <Checkbox value="ROOM_BUSINESS">
            商业<span style={{ color: '#aaa' }}>（导出空间类型是商业的节点）；</span>
          </Checkbox>
        </Checkbox.Group>
      </Modal>
    </PageContainer>
  );
};

export default TableList;
