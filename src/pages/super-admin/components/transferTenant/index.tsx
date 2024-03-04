import React, { useMemo, useRef, useState } from 'react';
import { Transfer } from 'antd';
import styles from './style.less';
import type { TransferDirection } from 'antd/es/transfer';
import { getQueryByPage } from '@/services/wps';

interface Props {
  TenantIds: string[];
  selectHandle: (keys: string[]) => void;
}

const App: React.FC<Props> = (props) => {
  const { selectHandle, TenantIds } = props;
  const [mockData, setMockData] = useState<TenantListType[]>([]);
  const data = useRef<TenantListType[]>([]);

  useMemo(() => {
    const getList = async () => {
      const params = {
        pageNo: 1,
        pageSize: 10000,
      };
      const res = await getQueryByPage(params);
      if (res.code === 'SUCCESS') {
        const resData = res.data?.items || [];
        data.current = resData;
        setMockData(resData);
      }
    };
    getList();
  }, []);

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
        height: 750,
      }}
      selectedKeys={TenantIds}
      onSelectChange={onSelectChange}
      rowKey={(record) => record.code as any}
      render={(item) => item.name}
    />
  );
};

export default App;
