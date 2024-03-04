export type IProps = {
  ref?: any;
  onAfterLoad?: () => void;
};

export type TreeNodeType = {
  key: string;
  tenantId: string;
  id: number;
  bid: string;
  code: string;
  name: string;
  parentBid: string;
  projectBid: string;
  orgType: string;
  state: string;
  parentName: string;
  expanded: boolean;
  sort: number;
  children?: OrgListType[];
};
