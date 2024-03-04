import Island, { IslandRef } from '@/components/Island';
import { Modal, Spin, message } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Style from './index.less';
import Tooltip from './tooltip';
import { getDeviceTypeList, getQueryByDevicePage } from '@/services/device';
import { getTotalPageSource, patchReq } from '@/utils/Request';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { generateGetUrl } from '@/services/file';
import { deviceBusiness } from '@/components/FileUpload/business';

type IProps = {
  // spaceId: string;
  ref?: any;
  setSelect: (id: any) => void;
};

const App: React.FC<IProps> = forwardRef(({ setSelect }, ref) => {
  const [loading, setLoading] = useState<{ render?: boolean; save?: boolean }>({});
  const islandRef = useRef<IslandRef | null>(null);
  const [mapUrl, setMapUrl] = useState<string>();
  const cache = useRef<{
    spaceTree: TreeNodeType[];
    devices: devicesListType[];
    icons?: Record<string, HTMLImageElement>;
  }>({
    spaceTree: [],
    devices: [],
  });
  const [space, setSpace] = useState<{
    projectId: string;
    id: string;
    name: string;
    url: string;
    devices: devicesListType[];
  }>({ projectId: '', id: '', name: '', url: '', devices: [] });

  // 更新加载状态
  const updateLoading = (key: 'render' | 'save', value?: boolean) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value ?? !prev[key],
    }));
  };

  // 生产设备点位图片元素
  const createIcons = async () => {
    const res = await getDeviceTypeList();
    cache.current.icons = res.data.reduce((prev, { code }) => {
      if (code) {
        const [img, newImg] = [document.createElement('img'), document.createElement('img')];
        img.src = `/images/device/device_icon_${code}.svg`;
        newImg.src = `/images/device/device_icon_${code}_new.svg`;
        return {
          ...prev,
          [code]: img,
          [`${code}_new`]: newImg,
        };
      }
      return prev;
    }, {} as Record<string, HTMLImageElement>);
  };

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

  // 更新设备信息
  const updateDevices = (devices: devicesListType[]) => {
    cache.current.devices = devices;
  };

  // 切换空间节点
  const spaceChange = async (_: string[], { node }: any, parentPath?: string[]) => {
    if (!node?.id || node.id === space.id) return;
    let path = parentPath;
    if (!path) {
      const match = findTreeNode<any>(cache.current.spaceTree, (item) => item.node?.id === node.id);
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
      setMapUrl(url);
      if (!url) {
        // updateLoading('render');
        // setSelect(space.id);
        // return false;
        // message.error(`${path?.[path?.length - 1] ?? ''}没有地图信息`);
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
      updateLoading('render');
    } catch (err) {
      updateLoading('render');
    }
  };

  // 空间初始化
  const onSpaceInit = (data: any[]) => {
    cache.current.spaceTree = data;
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
    // const spaceNode = findTreeNode(data, ({ node }) => node.spaceType !== SpaceTypeEnum.project);
    const spaceNode = findTreeNode(data, ({ node }) => node.spaceImgUrl);
    // spaceRef.current.setselectedKeys(spaceNode?.node?.id);
    setSelect(spaceNode?.node?.id);
    setSpace((prev) => ({ ...prev, projectId: project?.bid }));
    spaceChange(
      [],
      { node: spaceNode?.node },
      spaceNode?.parent?.map((item: any) => item.name).concat(spaceNode?.node?.name),
    );
  };

  useImperativeHandle(ref, () => {
    return {
      spaceChange,
      onSpaceInit,
    };
  });

  return (
    <div className={Style.cusSpin}>
      <Spin spinning={loading.render}>
        {mapUrl && (
          <Island
            ref={islandRef}
            // fullscreenExtra={() => <div className={Style.device_map_action}>{getActions(true)}</div>}
            island={{
              scaleable: true,
              tooltip: {
                placement: 'rightTop',
                title: (extra) => {
                  return (
                    <Tooltip source={(extra?.source || {}) as devicesListType} editable={false} />
                  );
                },
              },
            }}
          />
        )}
        {!mapUrl && <div className={Style.noData}>暂无电子地图</div>}
      </Spin>
    </div>
  );
});

export default App;
