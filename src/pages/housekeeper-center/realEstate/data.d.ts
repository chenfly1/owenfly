export type IProps = {
  projectBid: string;
  onSelectChange?: (selectedKeys: any, info: any, path?: string[]) => void;
  schemaIdChange?: (schemaId: number) => void;
  schemaId?: number;
  ref?: any;
  cardProps?: Record<string, any>;
  projectInfo?: any;
  mode?: 'monitoring'; // 模式树
  treeLoadComplate?: (data: any) => void;
};

export type TreeNodeType = {
  key: string;
  id: string;
  parentId: string;
  spaceType: string;
  name: string;
  children: TreeNodeType[];
};
