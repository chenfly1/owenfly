type staffType = {
  id: number;
  orgId: string;
  name: string;
  orgName: string;
  empNo: string;
  projectId: string;
  status: number;
  statusStr: string;
  createTime: string;
  sex: number;
  sexStr: string;
  mobile: string;
  workEmail: string;
  idType: number;
  idTypeSt: string;
  idNo: string;
  source: number;
  sourceStr: string;
  headPortrait: string;
};

type TreeNodeType = {
  key: string;
  id: string;
  parentId: string;
  spaceType: string;
  name: string;
  children: TreeNodeType[];
};
