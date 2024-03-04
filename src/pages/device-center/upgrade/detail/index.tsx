import { PageContainer } from '@ant-design/pro-layout';
import Base from './base';
import List from './list';
import { Card } from 'antd';

export default () => {
  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <Card bordered={false}>
        <Base />
      </Card>
      <Card
        title="设备列表"
        bordered={false}
        headStyle={{
          fontSize: 15,
          fontWeight: 'bold',
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        <List />
      </Card>
    </PageContainer>
  );
};
