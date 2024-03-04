import { CaretDownOutlined } from '@ant-design/icons';
import { ButtonProps, Space, Button, Dropdown } from 'antd';
import { useAccess } from 'umi';
import Style from './index.less';

export interface ActionGroupItem extends ButtonProps {
  key: string; // 标志 key
  text?: string; // 按钮文本
  onClick?: (event: any) => void; // 点击事件
  accessKey?: string; // 权限 key
  hidden?: boolean; // 是否隐藏
  render?: React.ReactNode; // 自定义渲染
}

// 应用场景
type ActionGroupSence = 'tableHeader' | 'tableToolBar' | 'tableColumn';

type ActionGroupProps = React.PropsWithChildren<{
  actions?: ActionGroupItem[]; // 按钮配置
  limit?: number; // 展示最大数量，当实际操作项数量大于该数值后，将展示 limit - 1 个按钮 + 更多操作按钮。
  scene?: ActionGroupSence; // 应用场景
  selection?: {
    show?: boolean; // 是否展示
    count?: number; // 展示数量
  }; // 已选项数量，仅在 tableHeader 场景下可用
}>;

// 默认配置信息
const defaultConfig: Record<
  ActionGroupSence,
  Partial<
    Pick<ActionGroupProps, 'limit' | 'children'> & {
      btnProps: ButtonProps;
    }
  >
> = {
  tableColumn: {
    limit: 3,
    btnProps: { type: 'link', size: 'small' },
    children: (
      <Button
        size="small"
        type="link"
        className={Style['action_group__item--main']}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Space>
          更多
          <CaretDownOutlined />
        </Space>
      </Button>
    ),
  },
  tableHeader: {
    limit: 4,
    btnProps: { type: 'default' },
    children: (
      <Button>
        更多操作
        <CaretDownOutlined />
      </Button>
    ),
  },
  tableToolBar: {
    limit: 3,
    btnProps: { type: 'default' },
    children: (
      <Button>
        更多操作
        <CaretDownOutlined />
      </Button>
    ),
  },
};

export default ({ actions = [], scene = 'tableColumn', ...restProps }: ActionGroupProps) => {
  const config = {
    ...defaultConfig[scene],
    ...restProps,
  };
  // 有效按钮
  const Access = useAccess();
  const effectActions = actions.filter(({ accessKey, hidden }) => {
    return !hidden && (!accessKey || Access.functionAccess(accessKey));
  });
  // 裁切主操作按钮 + 更多操作按钮
  const sliceIndex = effectActions.length > config.limit! ? config.limit! - 1 : config.limit;
  const [mainActions, extraActions] = [
    scene === 'tableToolBar'
      ? effectActions.slice(0, sliceIndex).reverse()
      : effectActions.slice(0, sliceIndex),
    effectActions.slice(sliceIndex),
  ];
  // 更多操作按钮
  const moreAction =
    extraActions.length > 0 ? (
      <Dropdown
        key="Dropdown"
        overlayClassName={Style.action_group__menu}
        menu={{
          items: extraActions.map(({ key, text, icon, disabled, danger, onClick }) => ({
            key,
            icon,
            danger,
            disabled,
            label: (
              <div className={Style['action_group__item--extra']} onClick={onClick}>
                {text ?? ''}
              </div>
            ),
          })),
        }}
        placement="bottomLeft"
      >
        {config.children}
      </Dropdown>
    ) : null;

  // 已选数量
  const selection =
    scene === 'tableHeader' && config.selection && config.selection.show !== false ? (
      <Button key="__section__" {...config.btnProps} disabled>
        已选{' '}
        <span className={Style.action_group__section__count}>{config.selection.count ?? 0}</span> 项
      </Button>
    ) : null;

  return (
    <Space className={Style[`action_group--${scene}`]}>
      {scene === 'tableToolBar' ? moreAction : null}
      {mainActions.map(({ accessKey, key, text, render, ...btnProps }) => {
        return render ? (
          <div key={key}>{render}</div>
        ) : (
          <Button
            className={Style['action_group__item--main']}
            key={key}
            {...config.btnProps}
            {...btnProps}
          >
            {text ?? ''}
          </Button>
        );
      })}
      {scene !== 'tableToolBar' ? (
        <>
          {moreAction}
          {selection}
        </>
      ) : null}
    </Space>
  );
};
