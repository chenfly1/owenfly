import React from 'react';
import { ProFormSelect } from '@ant-design/pro-form';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import { storageSy } from '@/utils/Setting';
import { useLocalStorageState } from 'ahooks';
import { useModel } from 'umi';

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
  const projectList: ProjectListType[] = initialState?.projectList || [];
  if (!projectInfo?.bid) {
    if (projectList.length && handleChange) {
      setProjectInfo(projectList[0]);
      handleChange(projectList[0]?.bid, projectList[0], projectList);
    }
  }
  const onChange = (value: string) => {
    const obj = projectList.find((i) => i.bid === value);
    if (obj) setProjectInfo(obj);
    if (handleChange) handleChange(value, obj as ProjectListType, projectList);
  };

  return (
    <div>
      {projectInfo ? (
        <ProFormSelect
          {...rest}
          label={label}
          name={name}
          allowClear={false}
          placeholder={placeholder}
          initialValue={projectInfo?.bid}
          options={(projectList || []).map((item) => ({
            value: item.bid,
            label: item.name,
          }))}
          fieldProps={{
            onChange: onChange,
          }}
        />
      ) : null}
    </div>
  );
};

export default ProjectSelect;
