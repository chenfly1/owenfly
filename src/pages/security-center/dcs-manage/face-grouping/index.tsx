import { useEffect, useState, useRef, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message, Modal, List, Input, Row, Col, Tooltip, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd/es/menu';
import {
  CaretDownOutlined,
  ExclamationCircleFilled,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Access, useAccess } from 'umi';
import Add from './add';
import AddGroup from './addGroup';
import style from './style.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import styles from './style.less';
import { deleteFaceGroup, deleteFaceInfo, getFaceInfoPage } from '@/services/monitor';
import ProCard from '@ant-design/pro-card';
import { getFaceGroupPage } from '@/services/monitor';
import OssImage from '@/components/OssImage';
import { monitorBusiness } from '@/components/FileUpload/business';
import DataMasking from '@/components/DataMasking';
import ActionGroup from '@/components/ActionGroup';

export default () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  // 新增/编辑弹框
  const [visible, setVisible] = useState<boolean>(false);
  const [modalData, setModalData] = useState({});
  const [groupData, setGroupData] = useState<Record<string, any>>();
  // 当前选中的区域
  const [faceGroupId, setFaceGroupId] = useState<number>();
  const [groupType, setGroupType] = useState<string>();

  // list左侧列表数据
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  // 区域列表
  const [dataList, setDataList] = useState<FaceGroupType[]>([]);

  // 搜索框
  const { Search } = Input;

  const projectBid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;

  const loadMoreData = async (name = '') => {
    setLoading(true);
    if (dataList.length < total) {
      setPageNo(pageNo + 1);
    }
    const res = await getFaceGroupPage({
      pageNo,
      pageSize,
      name,
    });
    if (res.code === 'SUCCESS') {
      setDataList(res.data.items);
      setTotal(res.data?.page.totalItems);
      if (res.data.items.length > 0) {
        setFaceGroupId(res.data.items[0].id);
        setGroupType(res.data.items[0].code);
      }
    }
    setLoading(false);
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    if (params.faceGroupId) {
      const res = await getFaceInfoPage(params);
      return {
        data: res.data.items || [],
        success: res.code === 'SUCCESS' ? true : false,
        total: res.data.page.totalItems || 0,
      };
    } else {
      return {
        data: [],
        success: true,
        total: 0,
      };
    }
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  // 删除行数据
  const deleteRow = async (row: FaceInfoType) => {
    try {
      const res = await deleteFaceInfo({ ids: [row?.id] });
      if (res.code === 'SUCCESS') {
        message.success('删除成功！');
        actionRef.current?.reload();
        return true;
      }
      return false;
    } catch (err) {
      message.error('请求失败，请重试！');
      return false;
    }
  };

  const columns = useMemo(() => {
    if (groupType === 'STAFF') {
      return [
        {
          title: '姓名',
          dataIndex: 'name',
          hideInTable: true,
        },
        {
          title: '性别',
          dataIndex: 'sex',
          hideInTable: true,
          valueEnum: {
            1: '男',
            2: '女',
          },
        },
        {
          title: '工号',
          dataIndex: 'jobNum',
          hideInTable: true,
        },
        {
          title: '工号',
          dataIndex: 'jobNum',
          hideInSearch: true,
          ellipsis: true,
        },
        {
          title: '姓名',
          key: 'name',
          dataIndex: 'name',
          ellipsis: true,
          hideInSearch: true,
        },

        {
          title: '性别',
          dataIndex: 'sex',
          hideInSearch: true,
          valueType: 'select',
          valueEnum: {
            1: '男',
            2: '女',
          },
        },
        {
          title: '归属部门',
          dataIndex: 'departmentName',
          hideInSearch: true,
        },
        {
          title: '手机号码',
          dataIndex: 'phone',
          hideInSearch: true,
          render: (_, row: any) => {
            return <DataMasking text={row.phone} />;
          },
        },
        {
          title: '人脸照片',
          dataIndex: 'faceUrl',
          hideInSearch: true,
          render: (_, row: any) => {
            if (row.faceUrl) {
              return (
                <OssImage
                  business={monitorBusiness.id}
                  objectId={row.faceUrl}
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              );
            } else {
              return _;
            }
          },
        },
        {
          title: '创建时间',
          dataIndex: 'gmtCreated',
          hideInSearch: true,
          valueType: 'dateTime',
        },
      ];
    } else {
      return [
        {
          title: '姓名',
          dataIndex: 'name',
          hideInTable: true,
        },
        {
          title: '性别',
          dataIndex: 'sex',
          hideInTable: true,
          valueEnum: {
            1: '男',
            2: '女',
          },
        },
        {
          title: '证件号码',
          dataIndex: 'idCard',
          hideInTable: true,
        },

        {
          title: '姓名',
          key: 'name',
          dataIndex: 'name',
          ellipsis: true,
          hideInSearch: true,
        },

        {
          title: '性别',
          dataIndex: 'sex',
          hideInSearch: true,
          valueType: 'select',
          valueEnum: {
            1: '男',
            2: '女',
          },
        },
        {
          title: '证件号',
          dataIndex: 'idCard',
          hideInSearch: true,
          ellipsis: true,
        },
        {
          title: '手机号码',
          dataIndex: 'phone',
          hideInSearch: true,
          render: (_, row: any) => {
            return <DataMasking text={row.phone} />;
          },
        },
        {
          title: '人脸照片',
          dataIndex: 'faceUrl',
          hideInSearch: true,
          render: (_, row: any) => {
            if (row.faceUrl) {
              return (
                <OssImage
                  business={monitorBusiness.id}
                  objectId={row.faceUrl}
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              );
            } else {
              return _;
            }
          },
        },
        {
          title: '下发结果',
          dataIndex: 'downRes',
          hideInSearch: true,
        },
        {
          title: '创建时间',
          dataIndex: 'gmtCreated',
          hideInSearch: true,
          valueType: 'dateTime',
        },
        {
          title: '操作',
          valueType: 'option',
          key: 'option',
          width: 120,
          render: (_, row: any) => {
            return (
              <ActionGroup
                limit={2}
                actions={[
                  {
                    key: 'edit',
                    text: '编辑',
                    accessKey: 'alitaMonitor_modifyFaceInfo',
                    onClick() {
                      setModalData(row);
                      setVisible(true);
                    },
                  },
                  {
                    key: 'delete',
                    text: '删除',
                    danger: true,
                    accessKey: 'alitaMonitor_deleteFaceInfo',
                    onClick() {
                      Modal.confirm({
                        icon: <ExclamationCircleFilled />,
                        title: '确定删除吗？',
                        centered: true,
                        onOk: async () => {
                          return deleteRow(row);
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
    }
  }, [groupType]);
  // table

  // 新增数据
  const onSubmit = async () => {
    actionRef.current?.reload();
    setVisible(false);
  };

  // 搜索框
  const onSearch = (value: string) => {
    loadMoreData(value);
  };

  // 搜索框change
  const onChange = (e: any) => {
    onSearch(e.target.value);
  };

  // 删除人脸组
  const handleDelete = (row: any) => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除该人脸组吗？',
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await deleteFaceGroup({ ids: [row.id] });
        if (res.code === 'SUCCESS') {
          await loadMoreData();
          // setActiveList(dataList.length && dataList[0].id);
          message.success('删除成功');
          return true;
        } else {
          message.error(res.message);
          return false;
        }
      },
    });
  };
  const addGroupSubmit = async (name: string) => {
    loadMoreData();
  };

  const items: MenuProps['items'] = [];
  if (access.functionAccess('alitaMonitor_modifyFaceGroup')) {
    items.push({
      key: 'edit',
      label: (
        <AddGroup key="edit" onSubmit={addGroupSubmit} type="link" data={groupData}>
          编辑
        </AddGroup>
      ),
    });
  }
  if (access.functionAccess('alitaMonitor_deleteFaceGroup')) {
    items.push({
      key: 'del',
      label: (
        <Button
          type="link"
          key="del"
          style={{ color: 'red' }}
          onClick={() => handleDelete(groupData)}
        >
          删除
        </Button>
      ),
    });
  }

  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px', height: 'calc(100vh - 155px)' }}>
            <ProCard bodyStyle={{ padding: 0 }} loading={loading}>
              <Search
                placeholder="请输入关键字"
                onSearch={onSearch}
                onBlur={onChange}
                allowClear
                style={{ width: '100%' }}
              />
              <div id="scrollableDiv" className={style.leftContent}>
                <InfiniteScroll
                  dataLength={dataList.length}
                  next={() => loadMoreData}
                  hasMore={dataList.length < total}
                  scrollableTarget="scrollableDiv"
                  loader={undefined}
                >
                  <List
                    className={style.customList}
                    dataSource={dataList}
                    renderItem={(item) => {
                      if (item.code !== 'STAFF') {
                        return (
                          <List.Item
                            key={item.id}
                            className={style.curson}
                            actions={[
                              <Dropdown
                                onOpenChange={() => setGroupData(item)}
                                menu={{ items }}
                                key="drow"
                                placement="bottomRight"
                              >
                                <a onClick={(e) => e.preventDefault()}>
                                  <MoreOutlined />
                                </a>
                              </Dropdown>,
                            ]}
                          >
                            <Tooltip title={item.name}>
                              <List.Item.Meta
                                title={
                                  <div
                                    onClick={() => {
                                      setFaceGroupId(item.id);
                                      setGroupType(item.code);
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                }
                              />
                            </Tooltip>
                          </List.Item>
                        );
                      } else {
                        return (
                          <List.Item
                            key={item.id}
                            className={style.curson}
                            // actions={}
                          >
                            <Tooltip title={item.name}>
                              <List.Item.Meta
                                title={
                                  <div
                                    onClick={() => {
                                      setFaceGroupId(item.id);
                                      setGroupType(item.code);
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                }
                              />
                            </Tooltip>
                          </List.Item>
                        );
                      }
                    }}
                  />
                </InfiniteScroll>
              </div>
            </ProCard>
          </div>
          <Access key="add" accessible={access.functionAccess('alitaMonitor_createFaceGroup')}>
            <AddGroup
              onSubmit={addGroupSubmit}
              style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
              // type="primary"
              icon={<PlusOutlined />}
            >
              新增人脸组
            </AddGroup>
          </Access>
        </Pane>
        <Pane>
          <ProTable<FaceInfoType>
            className={style.cusTable}
            params={{ faceGroupId }}
            actionRef={actionRef}
            columns={columns}
            cardBordered
            form={{
              colon: false,
            }}
            rowKey="id"
            request={queryList}
            toolBarRender={() => {
              if (groupType === 'STAFF') {
                return [null];
              } else {
                return [
                  <Access
                    key="add"
                    accessible={access.functionAccess('alitaMonitor_createFaceInfo')}
                  >
                    <Button
                      key="1"
                      type="primary"
                      onClick={() => {
                        setModalData({ faceGroupId });
                        setVisible(true);
                      }}
                    >
                      新增人脸
                    </Button>
                  </Access>,
                ];
              }
            }}
            options={{
              setting: {
                listsHeight: 400,
              },
            }}
          />
        </Pane>
      </SplitPane>
      <Add
        open={visible}
        onOpenChange={setVisible}
        onSubmit={onSubmit}
        readonly={false}
        data={modalData}
      />
    </PageContainer>
  );
};
