import { Button, Card, List, Typography, Tag, Row, Col, Input, Image, Space, Tooltip } from 'antd';
const { Search } = Input;
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest, history, useParams } from 'umi';
import { useState } from 'react';
import { setMealListAll } from '@/services/wps';
import { getTenantDetails } from '@/services/wps';
import { CheckCircleOutlined } from '@ant-design/icons';
import styles from './style.less';
import OssImage from '@/components/OssImage';
import { publicMaterialLib } from '@/components/FileUpload/business';
import ModelCard from './modelCard';
const { Paragraph } = Typography;
const fallback =
  'data:image/png;base64,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';

const CardList = () => {
  const params: { id: string; bid: string } = useParams();
  const [list, setList] = useState<MealListData[]>([]);
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: tenantData } = useRequest(() => {
    return getTenantDetails(params.id as any);
  });

  useRequest(async () => {
    setLoading(true);
    const res = await setMealListAll({ tenantBid: params.bid });
    setLoading(false);
    setList(res.data);
  });

  const onSearch = (value: string) => {
    setLoading(true);
    setMealListAll({
      name: value,
      tenantBid: params.bid,
    }).then((res) => {
      if (res.code === 'SUCCESS') {
        setList(res.data);
        setLoading(false);
      }
    });
  };

  const onOpenChange = () => {
    setModalVisit(!modalVisit);
  };

  return (
    <PageContainer
      header={{
        onBack: () => {
          return history.goBack();
        },
      }}
    >
      <Card
        title="应用授权列表"
        className={styles.card}
        bordered={false}
        extra={
          <Button
            ghost
            type="primary"
            onClick={() => {
              setModalVisit(true);
            }}
            size="middle"
          >
            批量授权
          </Button>
        }
      >
        <Row gutter={16} className={styles.headers}>
          <Col lg={6} md={12} sm={24}>
            <Input disabled value={tenantData?.tenantAccount} />
          </Col>
          <Col lg={6} md={12} sm={24}>
            <Input disabled value={tenantData?.name} />
          </Col>
          <Col lg={6} md={12} sm={24}>
            <div />
          </Col>
          <Col lg={6} md={12} sm={24}>
            <Search placeholder="搜索应用" allowClear onSearch={onSearch} />
          </Col>
        </Row>
        <div className={styles.cardList}>
          <List<Partial<MealListData>>
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
                  <Card hoverable className={styles.card} loading={loading}>
                    <Card.Meta
                      avatar={
                        item.extension && JSON.parse(item.extension).icon ? (
                          <OssImage
                            style={{ width: '40px', height: '40px' }}
                            objectId={JSON.parse(item.extension).icon}
                            business={publicMaterialLib.id}
                          />
                        ) : (
                          <Image
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            src="error"
                            fallback={fallback}
                          />
                        )
                      }
                      title={
                        <Space>
                          <a>{item.name}</a>
                          <div>
                            {item.state === 'NORMAL' ? (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                已启用
                              </Tag>
                            ) : null}
                          </div>
                        </Space>
                      }
                      description={
                        <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                          <Tooltip>
                            {item.extension && JSON.parse(item.extension as string).desc}
                          </Tooltip>
                        </Paragraph>
                      }
                    />
                    <div className={styles.cardButton}>
                      <div />
                      {item.state === 'NORMAL' ? (
                        <Button
                          onClick={() => {
                            history.push(
                              `/super-admin/tenant/auth-list/auth-details?tenantId=${params.id}&id=${item.id}&name=${item.name}&mobileApp=${item.mobileApp}`,
                            );
                          }}
                          size="middle"
                        >
                          修改开通
                        </Button>
                      ) : (
                        <Button
                          ghost
                          type="primary"
                          onClick={() => {
                            history.push(
                              `/super-admin/tenant/auth-list/auth-details?tenantId=${params.id}&id=${item.id}&name=${item.name}&mobileApp=${item.mobileApp}`,
                            );
                          }}
                          size="middle"
                        >
                          开通应用
                        </Button>
                      )}
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      </Card>
      <ModelCard
        code={tenantData?.code}
        tenantId={params.id}
        modalVisit={modalVisit}
        onOpenChange={onOpenChange}
      />
    </PageContainer>
  );
};

export default CardList;
