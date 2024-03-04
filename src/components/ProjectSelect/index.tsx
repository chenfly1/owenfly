import React, { useEffect, useState } from 'react';
import { ProFormSelect } from '@ant-design/pro-form';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import { storageSy } from '@/utils/Setting';
import { useLocalStorageState, useSessionStorageState } from 'ahooks';
import { useModel } from 'umi';
import { peojectCurrent, peojectSwitch } from '@/services/security';

type IProps = {
  label?: string;
  name?: string | string[];
  handleChange?: (value: string, item: ProjectListType, peojectList: ProjectListType[]) => void;
  placeholder?: string;
};

const ProjectSelect: React.FC<IProps & ProFormSelectProps> = ({
  label,
  name,
  placeholder,
  handleChange,
  ...rest
}) => {
  const { initialState } = useModel('@@initialState');
  const [projectInfo, setProjectInfo] = useLocalStorageState<ProjectListType>(
    storageSy.projectInfo,
  );
  const [, setVprojectInfo] = useSessionStorageState<ProjectListType>('VprojectInfo');
  const [initProjectBid, setInitProjectBid] = useState<string>(projectInfo?.bid || '');
  const projectList: ProjectListType[] = initialState?.projectList || [];

  const onChange = async (value: string) => {
    const obj = projectList.find((i) => i.bid === value);
    setInitProjectBid(value);
    if (obj) {
      setProjectInfo(obj);
      setVprojectInfo(obj);
    }
    // 设置选中的项目
    const res = await peojectSwitch({ projectBid: value });
    if (res.code === 'SUCCESS') {
      if (handleChange) handleChange(value, obj as ProjectListType, projectList);
    }
  };

  return (
    <div>
      <ProFormSelect
        {...rest}
        label={label}
        name={name}
        placeholder={placeholder}
        initialValue={initProjectBid}
        options={(projectList || []).map((item) => ({
          value: item.bid,
          label: item.name,
        }))}
        fieldProps={{
          onChange: onChange,
        }}
      />
    </div>
  );
};

export default ProjectSelect;
