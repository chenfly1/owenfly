import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import SpaceTree from '@/components/SpaceTree';
import Island, { IslandRef } from '@/components/Island';
import { Card, Modal, Spin, message } from 'antd';
import { ReactComponent as BuildingSVG } from '@/assets/svg/device_map_building.svg';
import Style from './index.less';
import ActionGroup from '@/components/ActionGroup';
import { EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { generateGetUrl } from '@/services/file';
import { deviceBusiness } from '@/components/FileUpload/business';
import { getDeviceTypeList, getQueryByDevicePage, updateDeviceMapMark } from '@/services/device';
import { getTotalPageSource, patchReq } from '@/utils/Request';
import CreateDeviceModal, { SelectDeviceProps } from './device';
import { ModalFormRef } from '@/components/ModalForm';
import Tooltip from './tooltip';
import { useHistory } from 'umi';
import { cloneDeep } from 'lodash';

const findTreeNode = <T extends object>(
  data: T[],
  condition: (options: { node: T; parent: T[] }) => boolean,
  children = 'children',
  _parent: T[] = [],
): { node: T; parent: T[] } | null => {
  let res = null;
  const len = data.length;
  for (let i = 0; i < len; i++) {
    const params = { node: data[i], parent: _parent };
    if (condition(params)) {
      res = params;
    } else if (data[i][children]?.length > 0) {
      res = findTreeNode(data[i][children], condition, children, _parent.concat(data[i]));
    }
    if (res) break;
  }
  return res;
};

export default () => {
  const history = useHistory();
  const spaceRef = useRef<any>();
  const islandRef = useRef<IslandRef | null>(null);
  const addRef = useRef<ModalFormRef<SelectDeviceProps> | null>(null);
  const [loading, setLoading] = useState<{ render?: boolean; save?: boolean }>({
    render: false,
    save: false,
  });
  const [editable, setEditable] = useState<boolean>(false);
  // 编辑或新增操作的设备临时集合
  const [tempDevices, setTempDevices] = useState<devicesListType[]>([]);
  const [space, setSpace] = useState<{
    projectId: string;
    id: string;
    name: string;
    url: string;
    devices: devicesListType[];
  }>({ projectId: '', id: '', name: '', url: '', devices: [] });
  const cache = useRef<{
    spaceTree: TreeNodeType[];
    devices: devicesListType[];
    icons?: Record<string, HTMLImageElement>;
  }>({
    spaceTree: [],
    devices: [],
  });

  // 获取弹窗容器
  const getPopupContainer = () => {
    return islandRef.current?.getContainer() ?? document.body;
  };

  // 获取更新的位点
  const getChangedDevices = () => {
    const islands = islandRef.current?.query();
    const devices = cache.current.devices;
    const newList = (islands || []).reduce((prev, { name, extra }: any) => {
      const match = devices?.find((item) => item.id === name);
      if (!match || extra.x !== match.abscissa || extra.y !== match.ordinate) {
        return prev.concat({ id: name, abscissa: extra.x, ordinate: extra.y });
      }
      return prev;
    }, [] as { id: string; abscissa: number | null; ordinate: number | null }[]);
    const removeList = (devices || []).reduce((prev, curr) => {
      const match = islands?.find((island) => island?.name === curr.id);
      return match
        ? prev
        : prev.concat({
            id: curr.id,
            abscissa: -1,
            ordinate: -1,
          } as any);
    }, [] as { id: string; abscissa: number | null; ordinate: number | null }[]);
    console.log('map_changed', islands, devices, newList, removeList);
    return newList.concat(removeList);
  };

  // 确认是否离开页面
  const confirmLeave = (confirm: () => void, cancel?: () => void) => {
    const changeList = getChangedDevices();
    if (!changeList.length) {
      return confirm();
    }
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '页面存在数据变更未保存，请确认是否离开？',
      getContainer: () => islandRef.current?.getContainer() ?? document.body,
      centered: true,
      okText: '确认离开',
      cancelText: '退回',
      okButtonProps: {
        danger: true,
      },
      onOk: confirm,
      onCancel: cancel,
    });
    return false;
  };

  // 更新加载状态
  const updateLoading = (key: 'render' | 'save', value?: boolean) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value ?? !prev[key],
    }));
  };

  // 获取设备图片
  const getIcon = (type: string, newIcon?: boolean) => {
    const key = newIcon ? `${type}_new` : type;
    const icon = cache.current.icons?.[key];
    if (icon) return icon;
    return cache.current.icons?.[newIcon ? 'default_new' : 'default'];
  };

  // 绘制地图
  const renderMap = async (devices: devicesListType[], url?: string) => {
    if (url) await islandRef.current?.render({ src: url });
    islandRef.current?.remove();
    islandRef.current?.create(
      devices.map((item) => ({
        name: item.id,
        style: {
          image: getIcon(item.typeCode),
          x: item.abscissa,
          y: item.ordinate,
        },
        extra: {
          source: item, // 数据信息
          original: true, // 标记为原有的
        },
      })),
    );
  };

  // 设置拖拽状态
  const updateDraggable = (draggable: boolean) => {
    islandRef.current?.query()?.forEach((island) => {
      if (island?.name) {
        islandRef.current?.update(island.name, {
          draggable,
        });
      }
    });
  };

  // 生产设备点位图片元素
  const createIcons = async () => {
    const res = await getDeviceTypeList();
    const defaultImg = [document.createElement('img'), document.createElement('img')];
    defaultImg[0].src = `/images/device/device_icon_default.svg`;
    defaultImg[1].src = `/images/device/device_icon_default_new.svg`;
    const loadImg = (code: string, newImg = false): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = document.createElement('img');
        img.src = `/images/device/device_icon_${newImg ? `${code}_new` : code}.svg`;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(newImg ? defaultImg[1] : defaultImg[0]);
      });
    };
    const imgs = await Promise.all(
      res.data.map((item) => {
        return Promise.all([loadImg(item.code), loadImg(item.code, true)]);
      }),
    );
    cache.current.icons = res.data.reduce((prev, { code }, index) => {
      if (code) {
        return {
          ...prev,
          [code]: imgs[index][0],
          [`${code}_new`]: imgs[index][1],
        };
      }
      return prev;
    }, {} as Record<string, HTMLImageElement>);
  };

  // 获取已打点设备
  const getMarkedDevices = async (projectId: string, spaceId: string) => {
    const { items } = await getTotalPageSource(
      (params) => patchReq(() => getQueryByDevicePage(params)),
      {
        projectId,
        spaceId: spaceId,
        showSubordinates: true,
        pageNo: 1,
        pageSize: 1000,
      },
    );
    return items.filter((item) => item.isAssociated && item.abscissa + item.ordinate !== -2);
  };

  // 更新设备信息
  const updateDevices = (devices: devicesListType[]) => {
    cache.current.devices = devices;
    setTempDevices(devices);
  };

  // 切换空间节点
  const spaceChange = async (_: string[], { node }: any, parentPath?: string[]) => {
    confirmLeave(
      async () => {
        if (!node?.id || node.id === space.id) return;
        let path = parentPath;
        if (!path) {
          const match = findTreeNode<any>(
            cache.current.spaceTree,
            (item) => item.node?.id === node.id,
          );
          path = (match?.parent?.map((item: any) => item.name) ?? []).concat(match?.node?.name);
        }
        try {
          updateLoading('render');
          if (!cache.current.icons) await createIcons();
          const url = node?.spaceImgUrl
            ? await patchReq(() =>
                generateGetUrl({
                  bussinessId: deviceBusiness.id,
                  urlList: [{ objectId: node?.spaceImgUrl }],
                }),
              ).then((res) => res?.urlList?.[0]?.presignedUrl?.url)
            : '';
          if (!url) {
            updateLoading('render');
            spaceRef.current.setselectedKeys(space.id);
            return message.error({
              content: `${path?.[path?.length - 1] ?? ''}没有地图信息`,
              getPopupContainer,
            });
          }
          const devices = await getMarkedDevices(space.projectId, node?.id);
          await renderMap(devices, url);
          updateDevices(devices);
          setSpace((prev) => ({
            ...prev,
            id: node.id,
            name: (path || []).join('/'),
            url,
            devices,
          }));
          setEditable(false);
          updateLoading('render');
        } catch (err) {
          updateLoading('render');
        }
      },
      () => {
        spaceRef.current.setselectedKeys(space.id);
      },
    );
  };

  // 空间初始化
  const onSpaceInit = (data: any[]) => {
    cache.current.spaceTree = data;
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
    const spaceNode = findTreeNode(data, ({ node }) => node.spaceImgUrl);
    spaceRef.current.setselectedKeys(spaceNode?.node?.id);
    setSpace((prev) => ({ ...prev, projectId: project?.bid }));
    spaceChange(
      [],
      { node: spaceNode?.node },
      spaceNode?.parent?.map((item: any) => item.name).concat(spaceNode?.node?.name),
    );
  };

  // 编辑设备节点
  const edit = () => {
    setEditable(true);
    updateDraggable(true);
  };

  // 保存设备节点
  const save = async () => {
    setEditable(false);
    const list = getChangedDevices();
    if (list.length) {
      updateLoading('save');
      await updateDeviceMapMark(list);
      const devices = await getMarkedDevices(space.projectId, space.id);
      await renderMap(devices);
      updateDevices(devices);
      updateLoading('save');
      message.success({
        content: '保存成功',
        getPopupContainer,
      });
    }
    setEditable(false);
    updateDraggable(false);
  };

  // 新增设备节点
  const create = () => {
    addRef.current?.open({
      devices: tempDevices,
      spaceId: space.id,
      projectId: space.projectId,
    });
  };

  // 新增回调处理
  const createHandler = async ({ devices }: SelectDeviceProps, source?: SelectDeviceProps) => {
    if (source?.extra?.type === 'update') {
      const value = devices?.[0];
      const oldValue = source.extra?.record;
      islandRef.current?.remove([oldValue.id]);
      await islandRef.current?.create([
        {
          name: value.id,
          draggable: true,
          style: {
            image: getIcon(value.typeCode, true),
            x: oldValue.abscissa,
            y: oldValue.ordinate,
          },
          extra: {
            source: value,
          },
        },
      ]);
      const temp = cloneDeep(tempDevices);
      temp.splice(
        tempDevices.findIndex((item) => item.id === oldValue.id),
        1,
        value,
      );
      setTempDevices(temp);
      return true;
    }
    const max = 5;
    if (devices.length > max) {
      message.warning({
        content: `系统限制单次批量新增点位不超过${max}个`,
        getPopupContainer,
      });
      return false;
    }
    const islands = devices.map((item) => ({
      name: item.id,
      draggable: true,
      style: {
        image: getIcon(item.typeCode, true),
      },
      extra: {
        source: item,
      },
    }));
    await islandRef.current?.create(islands, [0, 0]);
    islandRef.current?.zoomOrigin();
    setTempDevices(tempDevices.concat(devices));
    return true;
  };

  // 取消操作
  const cancel = () => {
    confirmLeave(() => {
      setEditable(false);
      updateDraggable(false);
      islandRef.current?.remove();
      renderMap(cache.current.devices);
      setTempDevices(cache.current.devices);
    });
  };

  // 操作项
  const getActions = (fullscreen?: boolean) => {
    const type = fullscreen ? 'default' : 'primary';
    return (
      <ActionGroup
        scene="tableHeader"
        actions={[
          {
            key: 'edit',
            text: '编辑设备点',
            type,
            icon: <EditOutlined />,
            hidden: editable,
            disabled: loading.render,
            onClick: edit,
          },
          {
            key: 'save',
            text: '保存',
            type,
            hidden: !editable,
            loading: loading.save,
            disabled: loading.render,
            onClick: save,
          },
          {
            key: 'create',
            text: '新增点位',
            type,
            hidden: !editable,
            disabled: loading.render,
            onClick: create,
          },
          {
            key: 'cancel',
            text: '取消',
            hidden: !editable,
            disabled: loading.render,
            onClick: cancel,
          },
        ]}
      />
    );
  };

  // 移除岛屿操作
  const removeHandler = (value: devicesListType) => {
    islandRef.current?.remove([value.id]);
    const temp = cloneDeep(tempDevices);
    temp.splice(
      tempDevices.findIndex((item) => item.id === value.id),
      1,
    );
    setTempDevices(temp);
  };

  // 更新岛屿
  const updateHandler = (value: devicesListType) => {
    addRef.current?.open({
      devices: tempDevices,
      projectId: space.projectId,
      spaceId: space.id,
      type: 'radio',
      extra: { record: value, type: 'update' },
    });
  };

  useEffect(() => {
    const unblock = history.block((location: any) => {
      return confirmLeave(() => {
        unblock();
        history.push(location.pathname);
      });
    });
    const beforeUnloadHandler = (event: any) => {
      const changeList = getChangedDevices();
      if (changeList.length) {
        event.preventDefault();
        event.returnValue = '页面存在未保存的数据变更，请确认是否离开？';
      }
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      unblock();
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const DeviceModal = CreateDeviceModal({
    getContainer: () => islandRef.current?.getContainer?.() ?? document.body,
  });

  return (
    <PageContainer className={Style.device_map} header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px', height: 'calc(100vh - 103px)', overflowY: 'scroll' }}>
            <SpaceTree ref={spaceRef} onSelectChange={spaceChange} treeLoadComplate={onSpaceInit} />
          </div>
        </Pane>
        <Pane>
          <Card
            title={
              <>
                <BuildingSVG />
                <span className="ml-10">{space.name}</span>
              </>
            }
            extra={getActions(false)}
            className={Style.device_map_main}
          >
            <Spin spinning={loading.render}>
              <Island
                ref={islandRef}
                fullscreenExtra={() => (
                  <div className={Style.device_map_action}>{getActions(true)}</div>
                )}
                island={{
                  scaleable: true,
                  tooltip: {
                    placement: 'rightTop',
                    title: (extra) => {
                      return (
                        <Tooltip
                          source={(extra?.source || {}) as devicesListType}
                          editable={editable}
                          onRemove={removeHandler}
                          onUpdate={updateHandler}
                        />
                      );
                    },
                  },
                }}
              />
            </Spin>
          </Card>
        </Pane>
      </SplitPane>
      <DeviceModal ref={addRef} submit={createHandler} />
    </PageContainer>
  );
};
