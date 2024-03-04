import { Card, List, Typography, Button, Tooltip } from 'antd';

import type { FC } from 'react';
import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getGlobalList } from '@/services/wps';
import ModelCard from './modelCard';
import { useRequest, history } from 'umi';
import styles from './style.less';

const { Paragraph } = Typography;

const ApplicationModular: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const [list, setList] = useState<ApplicationItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useRequest(async () => {
    setLoading(true);
    const res = await getGlobalList({ systemType: '', id: (query as any).id });
    const data = res.data;
    let arrList: ApplicationItemType[] = [];
    data.forEach((item) => {
      arrList = arrList.concat(item.children);
    });
    setList(arrList);
    setLoading(false);
  });
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [modalDatas, setModalDatas] = useState<ApplicationItemType[]>([]);
  const [text, setText] = useState<string>('');

  return (
    <PageContainer
      header={{
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Card
        title={(query as any).name}
        // extra={
        //   <Button
        //     onClick={() => {
        //       history.goBack();
        //     }}
        //     type="primary"
        //     ghost
        //   >
        //     返 回
        //   </Button>
        // }
        className={styles.card}
        bordered={false}
      >
        <div className={styles.cardList}>
          <List<Partial<ApplicationItemType>>
            rowKey="id"
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            dataSource={list}
            renderItem={(item) => {
              return (
                <List.Item key={item.id}>
                  <Card hoverable bodyStyle={{ height: '180px' }} loading={loading}>
                    <Card.Meta
                      title={<a>{item.text}</a>}
                      description={
                        <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                          <Tooltip title={item.extension}>{item.extension}</Tooltip>
                        </Paragraph>
                      }
                    />
                    {item.children && item.children.length ? (
                      <Button
                        className={styles.cardMore}
                        onClick={() => {
                          setModalVisit(true);
                          if (item.children) {
                            setModalDatas(item.children);
                          }
                          if (item.text) {
                            setText(item.text);
                          }
                        }}
                        type="link"
                      >
                        {'更多>>'}
                      </Button>
                    ) : null}
                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      </Card>
      <ModelCard
        modalVisit={modalVisit}
        text={text}
        modalDatas={modalDatas}
        onOpenChange={setModalVisit}
      />
    </PageContainer>
  );
};

export default ApplicationModular;
