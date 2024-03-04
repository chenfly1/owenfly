/* eslint-disable @typescript-eslint/no-shadow */
import {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { uniqueId } from 'lodash';
import * as ZR from 'zrender';
// 避免 tree-shaking 后核心方法丢失
import { registerPainter } from 'zrender';
import CanvasPainter from 'zrender/lib/canvas/Painter';
import SVGPainter from 'zrender/lib/svg/Painter';
registerPainter('canvas', CanvasPainter);
registerPainter('svg', SVGPainter);
import { exitFullscreen, getImgSize, loadImg, optimizeSize, requestFullscreen } from './help';
import Style from './index.less';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { merge } from 'lodash';
import { Tooltip, TooltipProps } from 'antd';

interface SeaOptions {
  src: string;
  scaleMax?: number;
  scaleMin?: number;
  scaleStep?: number;
  showScaler?: boolean;
}

interface IslandOptions {
  scaleable?: boolean;
  tooltip?: TooltipProps & {
    title: (island?: ZR.Image['extra']) => ReactNode;
  };
}

export interface IslandPros {
  width?: number;
  height?: number;
  sea?: SeaOptions;
  island?: IslandOptions;
  afterRender?: (error?: Error) => void;
  afterUpdate?: (island: ZR.Image) => void;
  fullscreenExtra?: () => React.ReactNode;
}

export type IslandRef = {
  render: (seaOptions: SeaOptions) => Promise<void>;
  query: (names?: string[]) => (ZR.Element<ZR.ElementProps> | undefined)[]; // 查询岛屿
  create: (islands: ZR.ImageProps[], coordinate?: [number, number]) => Promise<ZR.Image[]>; // 添加岛屿
  remove: (names?: string[]) => void; // 移除岛屿
  update: (name: string, island: ZR.ImageProps) => void; // 更新岛屿
  zoomOrigin: () => void; // 重置画布位置
  getContainer: () => HTMLDivElement | null; // 获取容器元素
};

export default forwardRef<IslandRef, IslandPros>(
  (
    {
      width,
      height,
      afterRender,
      afterUpdate,
      sea = { src: '' },
      island: islandOptions = {},
      fullscreenExtra,
    },
    ref,
  ) => {
    sea.scaleMax = sea.scaleMax || 5;
    sea.scaleMin = sea.scaleMin || 0.1;
    sea.scaleStep = sea.scaleStep || 0.05;
    islandOptions.scaleable = islandOptions?.scaleable ?? true;
    const instance = useRef<ZR.ZRenderType>();
    const seaGroup = useRef<ZR.Group>();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const seaRef = useRef<HTMLDivElement | null>(null);
    const tipRef = useRef<HTMLElement | null>(null);
    const cache = useRef<{
      option?: IslandPros['sea'];
      zoomInfo: {
        scale: number;
      };
      dragInfo: {
        drag: boolean;
        x: number;
        y: number;
        group: ZR.Group | null;
      };
    }>({
      zoomInfo: { scale: 1 },
      dragInfo: { drag: false, x: 0, y: 0, group: null },
    });
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    const [tooltip, setTooltip] = useState<{
      inited?: boolean;
      visible?: boolean;
      over?: boolean;
      style?: CSSProperties;
      extra?: ZR.Image['extra'];
    }>({});

    const scaleHandler = ({ scale, offsetX, offsetY }: any) => {
      const [min, max] = [
        cache.current.option?.scaleMin ?? sea.scaleMin!,
        cache.current.option?.scaleMax ?? sea.scaleMax!,
      ];
      const newScale = Math.min(Math.max(scale, min), max);
      const dx = (offsetX - seaGroup.current!.x) * (1 - newScale / cache.current.zoomInfo.scale);
      const dy = (offsetY - seaGroup.current!.y) * (1 - newScale / cache.current.zoomInfo.scale);
      cache.current.zoomInfo.scale = newScale;
      seaGroup.current?.attr({
        scaleX: newScale,
        scaleY: newScale,
        x: seaGroup.current?.x + dx,
        y: seaGroup.current?.y + dy,
      });
      if (!islandOptions?.scaleable) {
        // 避免缩放
        seaGroup.current?.children().forEach((item) => {
          if (item.extra?.type === 'island') {
            item.attr(
              merge(item, {
                style: {
                  width: (item.extra.width as number) / newScale,
                  height: (item.extra.height as number) / newScale,
                },
              }),
            );
          }
        });
      }
    };

    const zoomHandler = (event: ZR.ElementEvent) => {
      const step = cache.current.option?.scaleStep ?? sea.scaleStep!;
      scaleHandler({
        scale: cache.current.zoomInfo.scale + (event.wheelDelta > 0 ? step : -step),
        offsetX: event.offsetX,
        offsetY: event.offsetY,
      });
    };

    const listenDragEvent = () => {
      cache.current.dragInfo = {
        drag: false,
        x: 0,
        y: 0,
        group: null,
      };
      instance.current?.on('mousedown', (event: any) => {
        if (event.target === undefined || event.target?.extra?.type === 'island') {
          cache.current.dragInfo.drag = false;
        } else if (event.target.parent && event.target.parent.type === 'group') {
          cache.current.dragInfo.x = event?.event?.zrX;
          cache.current.dragInfo.y = event?.event?.zrY;
          cache.current.dragInfo.drag = true;
          cache.current.dragInfo.group = event.target.parent;
        }
      });
      // 鼠标抬起事件 关闭拖拽  将拖拽的目标元素设置为空
      instance.current?.on('mouseup', () => {
        cache.current.dragInfo.drag = false;
        cache.current.dragInfo.group = null;
      });
      // 鼠标移出事件 关闭拖拽
      instance.current?.on('mouseout', () => {
        cache.current.dragInfo.drag = false;
        cache.current.dragInfo.group = null;
      });
      // 鼠标移动事件
      instance.current?.on('mousemove', (event: any) => {
        if (cache.current.dragInfo.drag !== true) return;
        const pos = [
          event.event.zrX - cache.current.dragInfo.x,
          event.event.zrY - cache.current.dragInfo.y,
        ];
        if (cache.current.dragInfo.group != null) {
          cache.current.dragInfo.group.x += pos[0];
          cache.current.dragInfo.group.y += pos[1];
          cache.current.dragInfo.group.dirty();
        } else {
          seaGroup.current!.x = pos[0];
          seaGroup.current!.y = pos[1];
        }
        cache.current.dragInfo.x = event.event.zrX;
        cache.current.dragInfo.y = event.event.zrY;
      });
    };

    // 查询岛屿
    const query = (names?: string[]) => {
      const match = names
        ? names.map((name) => seaGroup.current?.childOfName(name))
        : seaGroup.current?.children();
      return match?.filter((item) => item?.extra?.type === 'island') ?? [];
    };

    // 获取坐标，支持依序生产坐标
    const getCoordinate = (
      {
        x,
        y,
        coordinate,
        auto,
      }: {
        x?: number;
        y?: number;
        coordinate: [number, number];
        auto?: boolean;
      },
      islands?: ZR.Image[],
    ): { x?: number; y?: number; coordinate: [number, number]; auto: boolean } => {
      if (!auto && (x || y || !coordinate)) return { x, y, coordinate, auto: false };
      const containIsland = islands?.find((island) => {
        return island?.getBoundingRect().contain(coordinate[0], coordinate[1]);
      });
      let newX = coordinate[0];
      let newY = coordinate[1];
      if (containIsland) {
        newX = coordinate[0] + containIsland.getWidth();
        return getCoordinate({ x: newX, y: newY, coordinate: [newX, newY], auto: true }, islands);
      }
      if (newX > (instance.current?.getWidth() ?? 0)) {
        newX = 0;
        newY = coordinate[1] + 50;
        return getCoordinate({ x, y, coordinate: [newX, newY], auto: true }, islands);
      } else {
        return { x: newX, y: newY, coordinate, auto: true };
      }
    };

    const patchImages = async (
      images: ZR.ImageProps[],
      coordinate: [number, number] = [0, 0],
    ): Promise<ZR.ImageProps[]> => {
      let nextCoor = coordinate;
      const seaExtra: any = seaGroup.current?.childOfName('sea')?.extra;
      const islands = query() as ZR.Image[];
      const sizes = await Promise.all(images.map((item) => getImgSize(item.style || {})));
      return images
        .filter((item) => {
          return !item.name || !seaGroup.current?.childOfName(item.name);
        })
        .map((item, index) => {
          // name 处理
          item.name = item.name || uniqueId();
          // level 处理
          item.zlevel = item.zlevel ?? 1;
          // 以包围块作为交互元素
          item.rectHover = item.rectHover ?? true;
          // size 处理
          const size = sizes[index];
          // 坐标 处理
          item.style = { ...item.style, ...size };
          const res = getCoordinate(
            { x: item.style?.x, y: item.style?.y, coordinate: nextCoor },
            islands,
          );
          item.style.x = res.x;
          item.style.y = res.y;
          nextCoor = [res.coordinate?.[0] + (res.auto ? size?.width ?? 0 : 0), res.coordinate?.[1]];
          // 额外属性处理
          item.extra = {
            ...item.extra,
            ...item.style,
            _x: item.style.x,
            _y: item.style.y,
            rangeX: [
              -((item.style?.width || 0) / 2) - (item.style?.x || 0),
              (seaExtra.width || 0) - (item.style?.width || 0) / 2 - (item.style?.x || 0),
            ],
            rangeY: [
              -((item.style?.height || 0) / 2) - (item.style?.y || 0),
              (seaExtra.height || 0) - (item.style?.height || 0) / 2 - (item.style?.y || 0),
            ],
            name: item.name,
            type: 'island',
          };
          return item;
        });
    };

    // 添加岛屿
    const create = async (islands: ZR.ImageProps[], coordinate?: [number, number]) => {
      const newIslands = await patchImages(islands, coordinate);
      const res = newIslands.map((item) => {
        const island = new ZR.Image(item);
        seaGroup.current?.add(island);
        island.on('mouseover', () => {
          const extra: any = island.extra;
          const sizeScale = islandOptions.scaleable ? cache.current.zoomInfo.scale : 1;
          setTooltip((prev) => {
            return {
              ...prev,
              visible: prev.visible ?? true,
              extra,
              style: {
                position: 'absolute',
                width: `${(extra?.width ?? 0) * sizeScale}px`,
                height: `${(extra?.height ?? 0) * sizeScale}px`,
                top: (extra?.y ?? 0) * cache.current.zoomInfo.scale + (seaGroup.current?.y ?? 0),
                left: (extra?.x ?? 0) * cache.current.zoomInfo.scale + (seaGroup.current?.x ?? 0),
              },
            };
          });
        });
        island.on('mouseup', () => {
          if (island.draggable) {
            setTooltip((prev) => ({ ...prev, visible: undefined }));
          }
          const extra: any = island.extra;
          island.attr({
            extra: {
              ...extra,
              x: extra._x + island.x,
              y: extra._y + island.y,
            },
          });
        });
        island.on('mousedown', () => {
          if (island.draggable) {
            setTooltip((prev) => ({ ...prev, visible: false }));
          }
        });
        island.on('mouseout', () => {
          setTimeout(() => {
            setTooltip((prev) => {
              if (prev.extra?.name !== island.name) return prev;
              return {
                ...prev,
                visible: !island.draggable || prev.visible === true ? undefined : prev.visible,
              };
            });
          }, 100);
        });
        island.on('drag', () => {
          const extra: any = island.extra;
          const x = Math.max(Math.min(island.x, extra.rangeX[1]), extra.rangeX[0]);
          const y = Math.max(Math.min(island.y, extra.rangeY[1]), extra.rangeY[0]);
          if (x !== island.x || y !== island.y) {
            island
              .attr({
                x,
                y,
                extra: {
                  ...island.extra,
                  x: extra._x + x,
                  y: extra._y + y,
                },
              })
              .dirty();
          }
        });
        if (afterUpdate) {
          island.afterUpdate = () => {
            afterUpdate?.(island);
          };
        }
        return island;
      });
      return res;
    };

    // 移除岛屿
    const remove = (names?: string[]) => {
      if (!names) {
        setTooltip({ inited: true });
        seaGroup.current?.children().forEach((item) => {
          if (item.extra.type === 'island') {
            seaGroup.current?.remove(item);
          }
        });
      } else {
        names.forEach((name) => {
          const match = seaGroup.current?.childOfName(name);
          if (match?.extra.type === 'island') {
            if (tooltip.extra?.name === name) {
              setTooltip({ inited: true });
            }
            seaGroup.current?.remove(match);
          }
        });
      }
    };

    // 更新岛屿
    const update = (name: string, island: ZR.ImageProps) => {
      const match = seaGroup.current?.childOfName(name);
      if (match) {
        match.attr(merge(match, island));
      }
    };

    // 全屏处理
    const toggleFullscreen = () => {
      if (fullscreen) {
        exitFullscreen();
      } else {
        requestFullscreen(containerRef.current);
      }
    };

    // 绘制
    const render = async (seaOptions: SeaOptions) => {
      if (!seaOptions.src) return;
      try {
        const { src, ...imgSize } = await loadImg(seaOptions.src);
        const size = optimizeSize(imgSize, {
          width: width || containerRef.current?.clientWidth || imgSize.width,
          height: height || containerRef.current?.clientHeight || imgSize.height,
        });
        size.scale = Math.min(Math.max(size.scale, sea.scaleMin!), sea.scaleMax!);
        instance.current?.clear();
        instance.current = ZR.init(seaRef.current, {
          width: 'auto',
          height: 'auto',
        });
        seaGroup.current = new ZR.Group();
        seaGroup.current
          ?.add(
            new ZR.Image({
              name: 'sea',
              style: {
                image: src,
                ...size,
              },
              extra: {
                ...size,
              },
            }),
          )
          .on('mousewheel', zoomHandler);
        instance.current?.add(seaGroup.current!);
        cache.current.option = seaOptions;
        cache.current.zoomInfo.scale = size.scale;
        scaleHandler({
          scale: size.scale,
          offsetX: imgSize.width / 2,
          offsetY: imgSize.height / 2,
        });
        listenDragEvent();
        setTooltip({ inited: true });
        afterRender?.();
      } catch (error) {
        console.log('island_render', error);
        afterRender?.(error as Error);
      }
    };

    const zoomFactory = (type: 'in' | 'out') => {
      if (!seaGroup.current) return;
      const rect = seaGroup.current.getBoundingRect();
      const step = cache.current.option?.scaleStep ?? sea.scaleStep!;
      scaleHandler({
        scale: cache.current.zoomInfo.scale + (type === 'out' ? -step : step),
        offsetX: seaGroup.current.x + (rect.width * cache.current.zoomInfo.scale) / 2,
        offsetY: seaGroup.current.y + (rect.height * cache.current.zoomInfo.scale) / 2,
      });
    };

    const zoomIn = () => zoomFactory('in');

    const zoomOut = () => zoomFactory('out');

    const zoomOrigin = async () => {
      if (!seaGroup.current) return;
      const islands = query();
      await render(cache.current.option || sea);
      islands.forEach((island) => island && seaGroup.current?.add(island));
    };

    useImperativeHandle(ref, () => ({
      render,
      query,
      create,
      remove,
      update,
      zoomOrigin,
      getContainer: () => containerRef.current,
    }));

    const resizeHandler = () => {
      instance.current?.resize();
    };

    const fullscreenHandler = () => {
      if (document.fullscreenElement === containerRef.current) {
        setFullscreen(true);
      } else if (!document.fullscreenElement) {
        setFullscreen(false);
      }
      setTimeout(() => zoomOrigin());
    };

    useEffect(() => {
      render(sea);
      document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
      });
      seaRef.current?.addEventListener('mousewheel', function (e) {
        e.preventDefault();
        return false;
      });
      window.addEventListener('resize', resizeHandler);
      window.addEventListener('fullscreenchange', fullscreenHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('fullscreenchange', fullscreenHandler);
      };
    }, []);

    useEffect(() => {
      const enterOverlay = () => {
        setTooltip((prev) => ({ ...prev, over: true }));
      };
      const leaveOverlay = () => {
        setTooltip((prev) => ({ ...prev, over: false }));
      };
      const removeListener = () => {
        const overlay = document.getElementsByClassName('island_tootip_overlay')?.[0];
        if (overlay) {
          overlay.removeEventListener('mouseenter', enterOverlay);
          overlay.removeEventListener('mouseleave', leaveOverlay);
        }
        return overlay;
      };
      if (tooltip.inited) {
        const overlay = removeListener();
        if (overlay) {
          overlay.addEventListener('mouseenter', enterOverlay);
          overlay.addEventListener('mouseleave', leaveOverlay);
        }
      }
      return () => {
        removeListener();
      };
    }, [tooltip.inited]);

    return (
      <div className={Style.island} ref={containerRef}>
        <div className={Style.island__main} ref={seaRef} />
        <aside className={Style.island__scaler}>
          <a title="全屏" onClick={toggleFullscreen}>
            {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </a>
          <a title="放大" onClick={zoomIn}>
            <PlusSquareOutlined />
          </a>
          <a title="缩小" onClick={zoomOut}>
            <MinusSquareOutlined />
          </a>
          <a title="重置" onClick={zoomOrigin}>
            <ReloadOutlined />
          </a>
        </aside>
        {fullscreen ? fullscreenExtra?.() : null}
        {tooltip.inited ? (
          <Tooltip
            {...islandOptions?.tooltip}
            title={islandOptions?.tooltip?.title?.(tooltip?.extra)}
            getPopupContainer={() => {
              return containerRef.current ?? document.body;
            }}
            ref={tipRef}
            open={true}
            overlayClassName={'island_tootip_overlay'}
            overlayStyle={{
              height: tooltip?.visible || tooltip?.over ? 'auto' : 0,
              overflow: 'hidden',
              maxWidth: 'unset',
            }}
            zIndex={2}
          >
            <div
              style={{
                ...tooltip?.style,
                opacity: 1,
                cursor: 'pointer',
                pointerEvents: 'none',
              }}
            />
          </Tooltip>
        ) : null}
      </div>
    );
  },
);
