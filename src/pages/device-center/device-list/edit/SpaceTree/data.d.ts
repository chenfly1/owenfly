export type IProps = {
  onSelectChange?: (selectedKeys: any, info: any, path?: string[]) => void;
  schemaIdChange?: (schemaId: number) => void;
  schemaId?: number;
  deviceType?: string;
  ref?: any;
  cardProps?: Record<string, any>;
};

export type TreeNodeType = {
  key: string;
  id: string;
  parentId: string;
  spaceType: string;
  name: string;
  children: TreeNodeType[];
};
