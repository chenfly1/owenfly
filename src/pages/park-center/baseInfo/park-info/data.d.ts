/** 车位 */
type SpaceType = {
  id: string;
  mobile: string;
  placeType: string;
  code: string;
  name: string; // 车场原简称
  fullName: string; // 车场简称
  propertyOwner: string;
  parkingNumber: number;
  parkingType: number;
  project: string;
  projectBid: string;
};
