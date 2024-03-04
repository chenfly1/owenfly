import type { MenuDataItem } from '@ant-design/pro-layout';
import accountCenter from './modules/account-center';
import app from './modules/app';
import passCenter from './modules/pass-center';
import baseCenter from './modules/base-center';
import systemManagement from './modules/system-management';
import superAdmin from './modules/super-admin';
import parkCenter from './modules/park-center';
import deviceCenter from './modules/device-center';
import contentCenter from './modules/content-center';
import securityCenter from './modules/security-center';
import workorderCenter from './modules/workorder-center';
import housekeeperCenter from './modules/housekeeper-center';
import noticeCenter from './modules/notice-center';
import energyCenter from './modules/energy';
import iocCenter from './modules/ioc';
import livingPayment from './modules/living-payment';
import flowCenter from './modules/flow-center';
import staffCenter from './modules/staff-center';
import building from './modules/building';

const routers: MenuDataItem = [
  ...app,
  baseCenter,
  accountCenter,
  passCenter,
  parkCenter,
  superAdmin,
  deviceCenter,
  contentCenter,
  securityCenter,
  workorderCenter,
  housekeeperCenter,
  noticeCenter,
  energyCenter,
  iocCenter,
  systemManagement,
  livingPayment,
  flowCenter,
  staffCenter,
  building,
];

export default routers;
