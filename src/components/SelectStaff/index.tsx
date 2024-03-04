import { Breadcrumb, Input, Checkbox, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import './style.less';
import { getOrganizationTree } from '@/services/base';
import { orgQueryTreeList } from '@/services/auth';
import { useModel } from 'umi';
export interface StaffType {
  id: string;
  parentId: string;
  name: string;
  type: string;
  children: StaffType[];
  hasAccount?: boolean;
  workEmail?: string;
  mobile?: string;
  checked?: boolean;
  departmentName?: string;
  indeterminate?: boolean;
  hadSame?: boolean;
  projectId?: string;
}
export type IProps = {
  /**
   *
   * hadSame： 手机号或邮箱其中一个相同
   */
  onChange: (data: StaffType[], hadSame: boolean) => void;
};
export const SelectStaff: React.FC<IProps & Record<string, any>> = ({ onChange }) => {
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [breadList, setBreadList] = useState<StaffType[]>([]);
  const [leftList, setLeftList] = useState<StaffType[]>([]);
  const [rightList, setRightList] = useState<StaffType[]>([]);
  const [currentBread, setCurrentBread] = useState<StaffType>({
    id: '',
    parentId: '',
    name: '',
    type: '',
    children: [],
  });
  const [filterValue, setFilterValue] = useState('');
  const [filterList, setFilterList] = useState<StaffType[]>([]);
  const [compassList, setCompassList] = useState<StaffType[]>([]);

  const initRightList = () => {
    const myRightList: StaffType[] = [];
    const foo = (list: StaffType[]) => {
      list.forEach((item: StaffType) => {
        if (item.children && item.children.length > 0) {
          foo(item.children);
        }
        if (
          item.type === 'staff' &&
          item.checked &&
          myRightList.every((eitem) => eitem.id !== item.id)
        ) {
          myRightList.push(JSON.parse(JSON.stringify(item)));
        }
      });
    };
    foo(breadList);

    const objEmail = {};
    const objMobile = {};
    myRightList.forEach((item) => {
      if (item.workEmail)
        if (objEmail[item.workEmail]) {
          objEmail[item.workEmail].push(item.id);
        } else {
          objEmail[item.workEmail] = [item.id];
        }
      if (item.mobile)
        if (objMobile[item.mobile]) {
          objMobile[item.mobile].push(item.id);
        } else {
          objMobile[item.mobile] = [item.id];
        }
    });
    myRightList.forEach((item) => {
      if (item.workEmail)
        if (objEmail[item.workEmail].length > 1) {
          item.hadSame = true;
        }
      if (item.mobile)
        if (objMobile[item.mobile].length > 1) {
          item.hadSame = true;
        }
    });
    let hadSame = false;
    for (const key in objEmail) {
      if (objEmail[key].length > 1) hadSame = true;
    }
    for (const key in objMobile) {
      if (objMobile[key].length > 1) hadSame = true;
    }
    setRightList(myRightList);
    onChange(myRightList, hadSame);
  };

  const initData = (myBreadList: StaffType[]) => {
    setBreadList(myBreadList);
    setLeftList(myBreadList[myBreadList.length - 1].children);
    setCurrentBread(myBreadList[myBreadList.length - 1]);
  };
  useEffect(() => {
    initRightList();
  }, [breadList]);
  const changeBread = (item: StaffType) => {
    let myBreadList = [];
    breadList.some((sitem: StaffType, sindex: number) => {
      if (sitem.id === item.id) {
        myBreadList = breadList.slice(0, sindex + 1);
        initData(myBreadList);
        return true;
      } else {
        return false;
      }
    });
  };
  const goToChildren = (item: StaffType) => {
    const myBreadList = JSON.parse(JSON.stringify(breadList));
    const myItem = JSON.parse(JSON.stringify(item));
    myBreadList.push(myItem);
    initData(myBreadList);
  };
  const toggleCheckbox = (ids: string[], flag: boolean) => {
    let myBreadList: StaffType[] = JSON.parse(JSON.stringify(breadList));
    const fooMap = (list: any) => {
      return list.map((item: StaffType) => {
        return {
          ...item,
          checked: ids.some((sitem) => sitem === item.id) ? flag : item.checked,
          children: item.children && item.children.length > 0 ? fooMap(item.children) : [],
        };
      });
    };
    myBreadList = fooMap(myBreadList);
    const myLeftList = myBreadList[myBreadList.length - 1].children;
    let indeterminate = false;
    let checkAll = false;
    if (myLeftList.some((item) => item.type === 'staff' && item.checked)) {
      indeterminate = true;
    }
    if (myLeftList.every((item) => item.type === 'staff' && item.checked)) {
      indeterminate = false;
      checkAll = true;
    }
    const fooForEach = (list: any) => {
      list.forEach((item: StaffType) => {
        if (item.id === currentBread.id) {
          item.indeterminate = indeterminate;
          item.checked = checkAll;
        }
        if (item.children && item.children.length > 0) fooForEach(item.children);
      });
    };
    fooForEach(myBreadList);
    initData(myBreadList);
    if (filterList && filterList.length > 0) {
      setFilterList(fooMap(filterList));
    }
  };
  const changeAll = () => {
    let flag = true;
    if (
      leftList
        .filter((item) => item.type === 'staff' && !item.hasAccount)
        .every((item) => item.checked)
    ) {
      flag = false;
    }
    const ids = leftList
      .filter((item) => item.type === 'staff' && !item.hasAccount)
      .map((item) => item.id);
    toggleCheckbox(ids, flag);
  };
  const changeCheckbox = (e: any, data: StaffType) => {
    toggleCheckbox([data.id], !data.checked);
  };

  const delSelect = (data: StaffType) => {
    toggleCheckbox([data.id], false);
  };

  const toCompassList = (list: StaffType[]) => {
    const foo = (arr: StaffType[]) => {
      let result: StaffType[] = [];
      for (let i = 0; i < arr.length; i++) {
        result.push({ ...arr[i], children: [] });

        if (arr[i].children && arr[i].children.length > 0) {
          result = result.concat(foo(arr[i].children));
        }
      }
      return result;
    };
    const myCompassList = foo(list);
    setCompassList(myCompassList);
  };
  const initList = async () => {
    try {
      setLoading(true);
      const fooMap = (list: any, departmentName: string) => {
        return list.map((item: StaffType) => {
          return {
            ...item,
            checked: false,
            indeterminate: false,
            departmentName: item.type === 'staff' ? departmentName : '',
            children:
              item.children && item.children.length > 0 ? fooMap(item.children, item.name) : [],
          };
        });
      };
      const fooSort = (list: StaffType[]) => {
        list.sort((a: StaffType, b: StaffType) => {
          const asort = a.type === 'staff' ? 0 : 1;
          const bsort = b.type === 'staff' ? 0 : 1;
          return asort - bsort;
        });
        list.forEach((item: StaffType) => {
          if (item.children && item.children.length > 0) fooSort(item.children);
        });
      };
      const res = await getOrganizationTree({
        withStaff: 1, //withStaff（0-不需要员工，1-需要）
        allTree: 1, //allTree（0-当前层级数据，1-全部层级数据）
        // projectId: projectInfo.bid,
      });
      setLoading(false);
      if (res.code === 'SUCCESS') {
        const list = res.data;
        let myBreadList = fooMap(list, '');
        fooSort(myBreadList);
        const params = { orgBids: initialState?.currentUser?.orgBidList };
        const orgObj = {
          id: 'init',
          parentId: 'init',
          name: '全部',
          type: 'org',
          children: myBreadList,
        };
        const resOrg = await orgQueryTreeList(params);
        if (resOrg.code === 'SUCCESS' && resOrg.data && resOrg.data.length > 0) {
          orgObj.id = resOrg.data[0].bid;
          orgObj.name = resOrg.data[0].name;
        }
        myBreadList = [orgObj];
        initData(myBreadList);
        toCompassList(JSON.parse(JSON.stringify(myBreadList)));
      }
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => {
    initList();
  }, []);
  const onInputChange = (e: any) => {
    const value = e.target.value;
    if (value.trim()) {
      setFilterList(
        compassList.filter((item) => item.type === 'staff' && item.name.indexOf(value) > -1),
      );
    } else {
      setFilterList([]);
    }
    setFilterValue(value);
  };

  return (
    <Spin spinning={loading}>
      <div className="SelectStaff">
        <div className="SelectStaff-left">
          <div className="SelectStaff-left-input">
            <Input
              placeholder="请输入员工姓名"
              bordered={false}
              value={filterValue}
              onChange={onInputChange}
            />
            <SearchOutlined className="icon" />
          </div>
          {filterValue.trim() ? (
            <></>
          ) : (
            <>
              <div className="SelectStaff-left-bread">
                <Breadcrumb separator=">">
                  {breadList.map((item) => (
                    <Breadcrumb.Item key={item.id}>
                      <span
                        className="SelectStaff-left-bread-item"
                        onClick={() => changeBread(item)}
                      >
                        {item.name}
                      </span>
                    </Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </div>

              {currentBread?.children &&
                currentBread.children.length > 0 &&
                currentBread.children.every((item) => item.type === 'staff') && (
                  <div className="list-item">
                    <div className="content">
                      <div className="checkbox">
                        <div className="check">
                          <Checkbox
                            checked={currentBread.checked}
                            indeterminate={currentBread.indeterminate}
                            onChange={changeAll}
                          />
                        </div>
                        <div className="info">
                          <div className="name">全部</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </>
          )}
          <div className="scroll-container">
            <div className="scroll-box">
              {(filterValue.trim() ? filterList : leftList).length > 0 ? (
                <div className="list">
                  {(filterValue.trim() ? filterList : leftList).map((item) =>
                    item.type === 'staff' ? (
                      <div className="list-item" key={item.id}>
                        <div className="content">
                          <div className="checkbox">
                            <div className="check">
                              <Checkbox
                                disabled={item.hasAccount}
                                checked={item.checked}
                                onChange={(e) => changeCheckbox(e, item)}
                              />
                            </div>
                            <div className="info">
                              <div className="name">{item.name}</div>
                              <div className="bottom">{item.departmentName}</div>
                            </div>
                          </div>
                        </div>
                        {item.hasAccount && <div className="text">已有账号</div>}
                      </div>
                    ) : (
                      <div className="list-item" key={item.id}>
                        <div className="content">
                          <div className="checkbox">
                            <img className="img" src={require('@/assets/svg/department.svg')} />
                            <div className="info">
                              <div className="name">{item.name}</div>
                            </div>
                          </div>
                        </div>
                        <div className="tap" onClick={() => goToChildren(item)}>
                          下级
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="list-empty">暂无数据</div>
              )}
            </div>
          </div>
        </div>
        <div className="SelectStaff-right">
          <div className="SelectStaff-right-top">已选：{rightList.length}人</div>
          <div className="scroll-container">
            <div className="scroll-box">
              <div className="list">
                {rightList.map((item) => (
                  <div className="list-item" key={item.id}>
                    <div
                      className={
                        item.hadSame ? 'list-item-box list-item-box-active' : 'list-item-box'
                      }
                    >
                      <div className="content">
                        <img className="img" src={require('@/assets/svg/staff.svg')} />
                        <div className="info">
                          <div className="name">{item.name}</div>
                          <div className="bottom">{item.departmentName}</div>
                        </div>
                      </div>
                      <CloseOutlined className="icon" onClick={() => delSelect(item)} />
                      {item.hadSame && <div className="list-item-box-tip">员工信息重复</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};

// export default SelectStaff;
