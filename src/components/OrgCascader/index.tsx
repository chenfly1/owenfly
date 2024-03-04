import React, { useEffect, useState } from 'react';
// import { storageSy } from '@/utils/Setting';
// import { useLocalStorageState } from 'ahooks';
import { useModel } from 'umi';
import { ProFormCascader } from '@ant-design/pro-components';
import { orgQueryTreeList } from '@/services/auth';

type IProps = {
  label?: string;
  name?: string | string[];
  handleChange?: (value: string[], item: OrgListType, peojectList: OrgListType[]) => void;
  placeholder?: string;
  showProject?: boolean;
};
const getChildrenInfo = (bid: string, treeData: Record<string, any>[]): any => {
  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i];
    if (item.bid === bid) {
      return item;
    } else {
      return getChildrenInfo(bid, item.children);
    }
  }
};

const OrgCascader: React.FC<IProps> = ({
  label,
  name,
  placeholder,
  handleChange,
  showProject,
  ...rest
}) => {
  const { initialState } = useModel('@@initialState');
  const [orgList, setOrgList] = useState<OrgListType[]>([]);
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  // const [orgRoutes, setOrgRoutes] = useLocalStorageState<string[]>(storageSy.orgRoutes);

  const loopData = (treeData: OrgListType[]): OrgListType[] => {
    return treeData.map((item) => {
      const disabled = item.state === 'BAND' ? true : false;
      if (item.children) {
        if (item.children.some((i) => i.orgType === 'project')) {
          const childrens = showProject
            ? item.children
            : item.children.filter((i) => i.orgType !== 'project');
          if (childrens.length > 0) {
            return {
              ...item,
              disabled,
              children: loopData(childrens),
            };
          } else {
            return {
              ...item,
              disabled,
              children: [],
            };
          }
        } else {
          return {
            ...item,
            disabled,
            children: loopData(item.children),
          };
        }
      }
      return {
        ...item,
        disabled,
      };
    });
  };

  const onChange = (values: any) => {
    const value = values ? values[values.length - 1] : {};
    const obj = getChildrenInfo(value, orgList);
    // setOrgRoutes(values || []);
    if (handleChange) handleChange(values, obj as OrgListType, orgList);
  };
  useEffect(() => {
    const params = { orgBids: orgBidList };
    orgQueryTreeList({ params }).then((res) => {
      const formatData = loopData(res.data || []);
      setOrgList(formatData);
    });
  }, []);
  return (
    <ProFormCascader
      {...rest}
      // initialValue={orgRoutes}
      fieldProps={{
        fieldNames: {
          label: 'name',
          value: 'bid',
          children: 'children',
        },
        changeOnSelect: true,
        onChange: onChange,
        options: orgList,
      }}
      label={label}
      name={name}
      placeholder={placeholder}
      rules={[{ required: true, message: '请选择' }]}
    />
  );
};

export default OrgCascader;
