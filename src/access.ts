/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(
  initialState: { currentUser?: UserInfo; menuData: ResourceTreeItemType[] } | undefined,
) {
  const treeToArray = (tree: ResourceTreeItemType[]) => {
    let res: ResourceTreeItemType[] = [];
    for (const item of tree) {
      const { children, ...i } = item;
      if (children && children.length) {
        res = res.concat(treeToArray(children));
      }
      res.push(i);
    }
    return res;
  };
  const permissionList = treeToArray(initialState?.menuData || []);

  return {
    functionAccess: (code: string) => {
      // console.log(code, permissionList);
      const hasPermission =
        permissionList.filter((permission) => {
          return permission.code === code;
        }).length > 0;
      return hasPermission;
    },
  };
}
