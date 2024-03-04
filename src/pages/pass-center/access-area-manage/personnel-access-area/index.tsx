import { useEffect, useState, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message, Modal, List, Input, Tooltip, Space } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useSyncState } from 'react-sync-state-hook';
import {
  getAreaListByPage,
  getDeviceListByAreaId,
  delUserPassingArea,
} from '@/services/DoorManager';
import { Access, useAccess } from 'umi';
import Add from './add';
import style from './style.less';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { useMountedRef } from '@/hooks';
import Method from '@/utils/Method';

const endMessage = (
  <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
    我也是有底线的~
  </div>
);

export default () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const mountedRef = useMountedRef();

  // 新增/编辑弹框
  const [visible, setVisible] = useState<boolean>(false);
  const [modalData, setModalData] = useState({});
  const [title, setTitle] = useState<string>('编辑通行区域');
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // list左侧列表数据
  const [, setLoading] = useState(false);
  let pageNo = 1;
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  // 区域列表
  const [dataList, setDataList, curDataList] = useSyncState<areaListType[]>([]);
  const [headerTitle, setHeaderTitle] = useState<string>();
  // 当前选中的区域
  const [activeAreaId, setActiveAreaId] = useState<number>(0);

  // 搜索框
  const { Search } = Input;

  const projectBid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;

  const getAreaListPage = async (uid: any, name = '') => {
    setLoading(true);
    const res = await getAreaListByPage({
      pageNo,
      pageSize,
      type: 1,
      projectUid: uid,
      name,
    });
    if (res.code === 'SUCCESS') {
      setDataList([...curDataList.current, ...res.data.items]);
      setTotal(res.data.page.totalItems);
    }
    setLoading(false);
  };

  const loadMoreData = async (uid: any, name = '') => {
    if (mountedRef.current) {
      if (dataList.length < total) {
        pageNo++;
      }
      getAreaListPage(uid, name);
    }
  };

  const queryList = async (params: any) => {
    if (params.activeAreaId) {
      setActiveAreaId(params.activeAreaId);
      const res = await getDeviceListByAreaId(params.activeAreaId);
      return {
        data: res.data,
        success: res.code === 'SUCCESS' ? true : false,
        total: res.data.length,
      };
    }
    return {
      data: [],
      success: true,
      total: 0,
    };
  };

  useEffect(() => {
    pageNo = 1;
    curDataList.current = [];
    getAreaListPage(projectBid);
  }, []);

  useEffect(() => {
    const targe = dataList.find((item) => item.id === activeAreaId);
    setHeaderTitle(targe?.name ? `${targe?.name}-设备列表` : '设备列表');
  }, [activeAreaId, dataList]);

  // table
  const columns: ProColumns<devicesListType>[] = [
    {
      title: '设备名称',
      key: 'name',
      dataIndex: 'name',
      width: 280,
      ellipsis: true,
      fixed: 'left',
      hideInSearch: true,
    },
    {
      title: 'DID',
      key: 'did',
      width: 180,
      dataIndex: 'did',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '人脸',
      dataIndex: ['deviceAbility', 'face'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: 'IC卡',
      dataIndex: ['deviceAbility', 'icCard'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: 'ID卡',
      dataIndex: ['deviceAbility', 'idCard'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: '二维码',
      dataIndex: ['deviceAbility', 'qrcode'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: '蓝牙',
      dataIndex: ['deviceAbility', 'bluetooth'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: '远程',
      dataIndex: ['deviceAbility', 'remote'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
    {
      title: '梯控',
      dataIndex: ['deviceAbility', 'elevator'],
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: <CheckOutlined className={style.primaryText} />,
        },
        false: {
          text: '-',
        },
      },
    },
  ];

  // 新增数据
  const onSubmit = async (edit: boolean) => {
    pageNo = 1;
    curDataList.current = [];
    await getAreaListPage(projectBid);
    if (!edit) {
      setActiveAreaId(dataList.length && dataList[0].id);
    }
    actionRef.current?.reload();
    setVisible(false);
  };

  // 搜索框
  const onSearch = (value: string) => {
    pageNo = 1;
    curDataList.current = [];
    getAreaListPage(projectBid, value);
  };

  // 搜索框change
  const onChange = (e: any) => {
    onSearch(e.target.value);
  };

  // 删除通行区域
  const handleDelete = (row: any) => {
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除该通行区域吗？',
      content: '该操作会影响所绑定人员的门禁通行',
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: async () => {
        const res = await delUserPassingArea(row.id);
        if (res.code === 'SUCCESS') {
          pageNo = 1;
          curDataList.current = [];
          await getAreaListPage(projectBid);
          setActiveAreaId(dataList.length && dataList[0].id);
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  const editHandler = (item: any) => {
    setModalData(item);
    setTitle('编辑通行区域');
    setIsEdit(true);
    setVisible(true);
  };

  return (
    <PageContainer header={{ title: null }} className={style.page}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px 10px 20px 20px', height: 'calc(100vh - 110px)' }}>
            <Access key="add" accessible={access.functionAccess('alitaDoor_addPersonnelArea')}>
              <Button
                key="addArea"
                icon={<PlusOutlined />}
                style={{ width: '100%', marginBottom: '12px' }}
                onClick={() => {
                  setModalData({});
                  setTitle('创建通行区域');
                  setIsEdit(false);
                  setVisible(true);
                }}
              >
                新增通行区域
              </Button>
            </Access>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Search
                placeholder="请输入关键字"
                onSearch={onSearch}
                onChange={onChange}
                allowClear
              />
            </div>
            <div id="scrollableDiv" className={style.leftContent}>
              <InfiniteScroll
                dataLength={dataList.length}
                next={loadMoreData as any}
                hasMore={dataList.length < total}
                scrollableTarget="scrollableDiv"
                endMessage={dataList.length && dataList.length > 20 ? endMessage : null}
                loader={undefined}
              >
                <List
                  className={style.customList}
                  dataSource={dataList}
                  renderItem={(item: any) => (
                    <List.Item
                      key={item.id}
                      className={style.curson}
                      onClick={() => setActiveAreaId(item.id)}
                      actions={[
                        <Space key="editSpace" className={style.editSpace}>
                          <Access
                            key="edit"
                            accessible={access.functionAccess('alitaDoor_editPersonnelArea')}
                          >
                            <Tooltip placement="top" title="编辑">
                              <a onClick={() => editHandler(item)}>
                                <EditOutlined />
                              </a>
                            </Tooltip>
                          </Access>
                          <Access
                            key="delete"
                            accessible={access.functionAccess('alitaDoor_deletePersonnelArea')}
                          >
                            <Tooltip placement="top" title="删除">
                              <a onClick={() => handleDelete(item)}>
                                <DeleteOutlined className={style.errorColor} />
                              </a>
                            </Tooltip>
                          </Access>
                        </Space>,
                      ]}
                    >
                      <Tooltip title={item.name}>
                        <List.Item.Meta
                          className={activeAreaId === item.id ? style.itemColor : ''}
                          title={item.name}
                        />
                      </Tooltip>
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            </div>
          </div>
        </Pane>
        <Pane>
          <ProTable<devicesListType>
            className={style.cusTable}
            actionRef={actionRef}
            columns={columns}
            params={{ activeAreaId: activeAreaId || (dataList.length && dataList[0].id) }}
            cardBordered
            form={{
              colon: false,
            }}
            rowKey="id"
            search={false}
            request={queryList}
            scroll={{ x: 1160, y: 'calc(100vh - 250px)' }}
            headerTitle={headerTitle}
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
        data={modalData}
        title={title}
        isEdit={isEdit}
      />
    </PageContainer>
  );
};
