import React, { useMemo, useRef, useState } from 'react';
import { Transfer } from 'antd';
import styles from './style.less';
import type { TransferDirection } from 'antd/es/transfer';
import { getAreaListByPage } from '@/services/DoorManager';

interface Props {
  passingAreaIds: string[];
  disabledIds?: number[];
  type?: number;
  selectHandle: (keys: string[]) => void;
}

const App: React.FC<Props> = (props) => {
  const { selectHandle, passingAreaIds, disabledIds, type = 1 } = props;
  const [mockData, setMockData] = useState<areaListType[]>([]);
  const projectUid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;
  const data = useRef<areaListType[]>([]);

  useMemo(() => {
    const getTopic = async () => {
      const params = {
        pageNo: 1,
        pageSize: 1000,
        type: type,
        projectUid: projectUid,
      };
      const res = await getAreaListByPage(params);
      if (res.code === 'SUCCESS') {
        const resData = (res.data?.items || []).map((i) => ({
          ...i,
          disabled: disabledIds?.includes(i.id as any),
        }));
        data.current = resData;
        setMockData(resData);
      }
    };
    getTopic();
  }, [disabledIds]);

  const onSelectChange = (keys: string[]) => {
    selectHandle(keys);
  };

  const handleSearch = (dir: TransferDirection, value: string) => {
    console.log('search:', dir, value);
    if (value) {
      const list = data.current.filter((i) => i.name.indexOf(value) > -1);
      setMockData(list);
    } else {
      setMockData(data.current);
    }
  };

  return (
    <Transfer
      dataSource={mockData}
      showSearch
      onSearch={handleSearch}
      className={styles.customTransfer}
      listStyle={{
        flex: 1,
        height: 400,
      }}
      selectedKeys={passingAreaIds}
      onSelectChange={onSelectChange}
      rowKey={(record) => record.id as any}
      render={(item) => item.name}
    />
  );
};

export default App;
