import React, { useEffect, useRef, useState } from 'react';
import { Space, Divider, Select } from 'antd';
import { useLocalStorageState, useSessionStorageState } from 'ahooks';
import { CaretDownOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import { peojectCurrent, peojectSwitch } from '@/services/security';
import storageSy from '@/utils/Setting/storageSy';

const HeaderProject: React.FC = () => {
  const [menuInfo] = useSessionStorageState<MenuInfo>('menuInfo');
  const [VprojectInfo, setVprojectInfo] = useSessionStorageState<ProjectListType>('VprojectInfo');
  const [, setProjectInfo] = useLocalStorageState<ProjectListType>(storageSy.projectInfo);
  const { initialState } = useModel('@@initialState');
  const projectInfo = useRef<ProjectListType>();
  const projectList: ProjectListType[] = initialState?.projectList || [];
  const pathList = [
    '/park-center/dashboard/multiplProject',
    '/pass-center/dashboard/multiplProject',
  ];
  const [hide, setHide] = useState<boolean>(false);

  const code = menuInfo?.code ? menuInfo?.code : 'base';
  // 不显示项目的垂类
  const systemCodes = ['base', 'alitaContent', 'AlitaSteward'];

  // 获取当前项目显示
  const getProject = async () => {
    const res = await peojectCurrent();
    if (res.code === 'SUCCESS') {
      setProjectInfo(res.data);
      setVprojectInfo(res.data);
      projectInfo.current = res.data;
    }
  };

  const onChange = async (value: string) => {
    // 设置选中的项目
    const res = await peojectSwitch({ projectBid: value });
    if (res.code === 'SUCCESS') {
      setVprojectInfo((projectList as any).find((i: any) => i.bid === value));
      setTimeout(() => {
        location.reload();
      }, 50);
    }
  };

  // 浏览器切换窗口
  const visibilitychange = async () => {
    const isHidden = document.hidden;
    if (isHidden) {
      //切离该页面时执行
    } else {
      //切换到该页面时执行 项目切换了刷新页面
      const res = await peojectCurrent();
      if (
        res.code === 'SUCCESS' &&
        projectInfo.current &&
        res.data &&
        res.data.bid !== projectInfo.current?.bid
      ) {
        location.reload();
      }
    }
  };
  useEffect(() => {
    getProject();
    history.listen((location: any) => {
      if (pathList.includes(location.pathname)) {
        setHide(true);
      } else {
        setHide(false);
      }
    });
    // 监听窗口切换
    document.addEventListener('visibilitychange', visibilitychange);
    return () => document.removeEventListener('visibilitychange', visibilitychange);
  }, []);

  return (
    <>
      {!systemCodes.includes(code) && !hide && projectList?.length ? (
        <Space>
          <Divider
            style={{ backgroundColor: '#DCDFE6', height: '16px', marginLeft: '18px' }}
            type="vertical"
          />
          <Select
            showSearch
            style={{ width: '200px' }}
            bordered={false}
            className="select-v-project"
            placeholder="请输入搜索关键词"
            value={VprojectInfo?.bid}
            suffixIcon={<CaretDownOutlined />}
            filterOption={(input, option) =>
              (option?.name ?? '').toLowerCase().includes(input.toLowerCase())
            }
            fieldNames={{
              label: 'name',
              value: 'bid',
            }}
            onChange={onChange}
            options={projectList}
          />
        </Space>
      ) : null}
    </>
  );
};

export default HeaderProject;
