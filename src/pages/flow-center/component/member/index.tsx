import { Breadcrumb, Input, Checkbox, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import './index.less';
import { getOrgList } from '@/services/flow';
import { useModel } from 'umi';

export enum NodeTypeEnum {
  project = '1',
  org = '2',
  member = '3',
}

export interface StaffType {
  code: string;
  parentCode: string;
  name: string;
  type?: NodeTypeEnum;
  children: StaffType[];
  checked?: boolean;
  indeterminate?: boolean;
  departmentName?: string;
}

export type IProps = {
  value?: Pick<StaffType, 'code' | 'name'>[];
  onChange?: (value: Pick<StaffType, 'code' | 'name'>[]) => void;
};
export const FlowMember: React.FC<IProps & Record<string, any>> = ({ value, onChange }) => {
  const flowSource = useModel('useFlow');
  const [loading, setLoading] = useState(false);
  const [breadList, setBreadList] = useState<StaffType[]>([]);
  const [leftList, setLeftList] = useState<StaffType[]>([]);
  const [rightList, setRightList] = useState<StaffType[]>([]);
  const [currentBread, setCurrentBread] = useState<StaffType>({
    code: '',
    parentCode: '',
    name: '',
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
          item.type === NodeTypeEnum.member &&
          item.checked &&
          myRightList.every((eitem) => eitem.code !== item.code)
        ) {
          myRightList.push(JSON.parse(JSON.stringify(item)));
        }
      });
    };
    foo(breadList);

    setRightList(myRightList);
    onChange?.(
      myRightList.map((item) => ({
        code: item.code,
        name: item.name,
      })),
    );
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
      if (sitem.code === item.code) {
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
          checked: ids.some((sitem) => sitem === item.code) ? flag : item.checked,
          children: item.children && item.children.length > 0 ? fooMap(item.children) : [],
        };
      });
    };
    myBreadList = fooMap(myBreadList);
    const myLeftList = myBreadList[myBreadList.length - 1].children;
    let indeterminate = false;
    let checkAll = false;
    if (myLeftList.some((item) => item.type === NodeTypeEnum.member && item.checked)) {
      indeterminate = true;
    }
    if (myLeftList.every((item) => item.type === NodeTypeEnum.member && item.checked)) {
      indeterminate = false;
      checkAll = true;
    }
    const fooForEach = (list: any) => {
      list.forEach((item: StaffType) => {
        if (item.code === currentBread.code) {
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
      leftList.filter((item) => item.type === NodeTypeEnum.member).every((item) => item.checked)
    ) {
      flag = false;
    }
    const ids = leftList
      .filter((item) => item.type === NodeTypeEnum.member)
      .map((item) => item.code);
    toggleCheckbox(ids, flag);
  };
  const changeCheckbox = (e: any, data: StaffType) => {
    toggleCheckbox([data.code], !data.checked);
  };

  const delSelect = (data: StaffType) => {
    toggleCheckbox([data.code], false);
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
            checked: value?.find((curr) => curr.code === item.code) ? true : false,
            indeterminate: false,
            departmentName: item.type === NodeTypeEnum.member ? departmentName : '',
            children:
              item.children && item.children.length > 0 ? fooMap(item.children, item.name) : [],
          };
        });
      };
      const fooSort = (list: StaffType[]) => {
        list.sort((a: StaffType, b: StaffType) => {
          const asort = a.type === NodeTypeEnum.member ? 0 : 1;
          const bsort = b.type === NodeTypeEnum.member ? 0 : 1;
          return asort - bsort;
        });
        list.forEach((item: StaffType) => {
          if (item.children && item.children.length > 0) fooSort(item.children);
        });
      };
      const list = await getOrgList({
        tree: 1,
        lastType: 3,
        tenantId: flowSource.flowState.tenantId,
      });
      setLoading(false);
      let myBreadList = fooMap(list, '');
      fooSort(myBreadList);
      const orgObj = {
        id: 'init',
        parentId: 'init',
        name: '全部',
        type: 'org',
        children: myBreadList,
      };
      myBreadList = [orgObj];
      initData(myBreadList);
      toCompassList(JSON.parse(JSON.stringify(myBreadList)));
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => {
    initList();
  }, []);

  const onInputChange = (e: any) => {
    const val = e.target.value;
    if (val.trim()) {
      setFilterList(
        compassList.filter(
          (item) => item.type === NodeTypeEnum.member && item.name.indexOf(val) > -1,
        ),
      );
    } else {
      setFilterList([]);
    }
    setFilterValue(val);
  };

  return (
    <Spin spinning={loading}>
      <div className="flowMember">
        <div className="flowMember-left">
          <div className="flowMember-left-input">
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
              <div className="flowMember-left-bread">
                <Breadcrumb separator=">">
                  {breadList.map((item) => (
                    <Breadcrumb.Item key={item.code}>
                      <span
                        className="flowMember-left-bread-item"
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
                currentBread.children.every((item) => item.type === NodeTypeEnum.member) && (
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
                    item.type === NodeTypeEnum.member ? (
                      <div className="list-item" key={item.code}>
                        <div className="content">
                          <div className="checkbox">
                            <div className="check">
                              <Checkbox
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
                      </div>
                    ) : (
                      <div className="list-item" key={item.code}>
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
        <div className="flowMember-right">
          <div className="flowMember-right-top">已选：{rightList.length}人</div>
          <div className="scroll-container">
            <div className="scroll-box">
              <div className="list">
                {rightList.map((item) => (
                  <div className="list-item" key={item.code}>
                    <div className={'list-item-box'}>
                      <div className="content">
                        <img className="img" src={require('@/assets/svg/staff.svg')} />
                        <div className="info">
                          <div className="name">{item.name}</div>
                          <div className="bottom">{item.departmentName}</div>
                        </div>
                      </div>
                      <CloseOutlined className="icon" onClick={() => delSelect(item)} />
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
