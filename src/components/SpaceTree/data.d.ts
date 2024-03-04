export type IProps = {
  projectBid?: string;
  filterSpaceTypes?: string[];
  onSelectChange?: (selectedKeys: any, info: any, path?: string[]) => void;
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
  spaceImgUrl: string;
  children: TreeNodeType[];
};
