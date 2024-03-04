type SpaceListType = {
  id: number;
  parentId?: string;
  type?: string;
  name: string;
  description: string;
  stageBid: string;
  spaceDefName?: string;
  schemaId?: string;
  schemaName?: string;
  ext1?: string;
  ext2?: string;
  attributesJson?: string;
  level?: number;
  children?: SpaceListType[];
};

type SpacePhysicalType = {
  id?: string;
  parentId?: string;
  name?: string;
  spaceType?: string;
  ext1?: string;
  ext2?: string;
  spaceImgUrl?: string;
};
type SpacePhysicalTreeType = {};

type PropertySpaceType = {
  recordId: number;
  projectId: string;
  projectName: string;
  stageName: string;
  buildingName: string;
  unitName: string;
  floorName: string;
  spaceId: number;
  spaceName: string;
  propertyId: string;
  roomNum: string;
  roomName: string;
  bindResult: number;
  bindingResult: string;
  bindTime: string;
  operator: string;
};

type AutoBindPropertySpace = {
  success: number;
  failed: number;
};

type PropertySpaceListSearchType = {
  bid: string;
  projectId: string;
  projectName: string;
  roomNum: string;
  roomName: string;
  stageName: string;
  buildingName: string;
  unitName: string;
  floorName: string;
};

interface ImportPhysicalSpaceType {
  successCount: number;
  failureCount: number;
  custom: any;
  errorFileUrl: string;
}
