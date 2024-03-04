import { parkYardListByPage } from '@/services/park';
import { ProCard } from '@ant-design/pro-components';
import { Input, List, message, Tooltip, Tree } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

type sProps = {
  onSelect: (info: any) => void;
};

/** 原始数据 */
type NodeDataType = {
  key: string;
  bid: string;
  title: string;
  isLeaf?: boolean;
  parentKey?: string;
  children?: NodeDataType[];
};

const generateList = (data: NodeDataType[], list: NodeDataType[]) => {
  data.forEach((node) => {
    list.push(node);
    if (node.children?.length) {
      generateList(node.children, list);
    }
  });
};

const { Search } = Input;
const ProjectYardSelect: React.FC<sProps> = ({ onSelect }) => {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<Record<string, any>[]>([]);

  const loadMoreData = async (name = '') => {
    setLoading(true);
    const res = await parkYardListByPage({
      pageNo: 1,
      pageSize: 1000,
      parkName: name,
    });
    if (res.code === 'SUCCESS') {
      setDataList(res.data.items);
      setTotal(res.data?.page.totalItems);
      if (res.data.items.length > 0) {
      }
    }
    setLoading(false);
  };
  // 搜索框
  const onSearch = (value: string) => {
    loadMoreData(value);
  };
  // 搜索框change
  const onChange = (e: any) => {
    loadMoreData(e.target.value);
  };
  useEffect(() => {
    loadMoreData();
  }, []);
  return (
    <div style={{ height: 'calc(100vh - 155px)' }}>
      <ProCard bodyStyle={{ padding: 0 }} loading={loading}>
        <Search
          placeholder="请输入车场名"
          onSearch={onSearch}
          onBlur={onChange}
          allowClear
          style={{ width: '100%' }}
        />
        <div id="scrollableDiv">
          <InfiniteScroll
            dataLength={dataList.length}
            next={() => loadMoreData}
            hasMore={dataList.length < total}
            scrollableTarget="scrollableDiv"
            loader={undefined}
          >
            <List
              dataSource={dataList}
              renderItem={(item) => {
                return (
                  <List.Item
                    key={item.id}
                    onClick={() => {
                      setDataList((list) =>
                        list.map((e) => {
                          e.active = false;
                          if (e.id === item.id) {
                            e.active = true;
                          }
                          return {
                            ...e,
                          };
                        }),
                      );
                      onSelect(item.id);
                    }}
                    style={{
                      userSelect: 'none',
                    }}
                  >
                    {
                      <div
                        style={
                          item.active
                            ? {
                                color: '#0D74FF',
                                cursor: 'pointer',
                              }
                            : { cursor: 'pointer' }
                        }
                      >
                        {item.name}
                      </div>
                    }
                  </List.Item>
                );
              }}
            />
          </InfiniteScroll>
        </div>
      </ProCard>
    </div>
  );
};

export default ProjectYardSelect;
