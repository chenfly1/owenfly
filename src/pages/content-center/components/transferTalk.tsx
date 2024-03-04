import React, { useEffect, useRef, useState } from 'react';
import { Transfer } from 'antd';
import styles from './style.less';
import { getTopicList } from '@/services/content';
import type { TransferDirection } from 'antd/es/transfer';

interface Props {
  projectBids: string[];
  topicIds: string[];
  articleId: string;
  selectHandle: (keys: string[]) => void;
}

const App: React.FC<Props> = (props) => {
  const { projectBids, selectHandle, topicIds, articleId } = props;
  const [mockData, setMockData] = useState<TopicContentPageType[]>([]);
  const data = useRef<TopicContentPageType[]>([]);

  useEffect(() => {
    const getTopic = async () => {
      if (projectBids && projectBids.length) {
        const res = await getTopicList({ projectBids, articleId });
        if (res.code === 'SUCCESS') {
          const resData = res.data;
          data.current = resData;
          setMockData(resData);
        }
      } else {
        data.current = [];
        setMockData([]);
      }
    };
    getTopic();
  }, [projectBids]);

  const onSelectChange = (keys: string[]) => {
    selectHandle(keys);
  };

  const handleSearch = (dir: TransferDirection, value: string) => {
    console.log('search:', dir, value);
    if (value) {
      const list = data.current.filter((i) => i.title.indexOf(value) > -1);
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
      selectedKeys={topicIds}
      onSelectChange={onSelectChange}
      rowKey={(record) => record.id as any}
      render={(item) => `${item.status ? item.title : item.title + '（已下线）'}`}
    />
  );
};

export default App;
