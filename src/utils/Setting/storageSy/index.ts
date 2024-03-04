/**
import { storageSy } from '@/utils/Setting';
 * @module 配置存储信息
 *
 */

interface storageProps {
  userInfo: string;
  token: string;
  projectInfo: string;
  orgRoutes: string;
}

const storageSy: storageProps = {
  userInfo: 'userInfo',
  token: 'TOKEN',
  projectInfo: 'projectInfo',
  orgRoutes: 'orgRoutes',
};

export default storageSy;
