/** 项目树 */
type ProjectTreeType = {
  tenantId: string;
  id: number;
  bid: string;
  code: string;
  name: string;
  parentBid: string;
  state: string;
  parentName: string;
  key: string;
  expanded: boolean;
  sort: number;
  orgType: string;
  projectBid: string;
  children: ProjectTreeType[];
};
