import { DrawerForm } from '@ant-design/pro-components';
import { Card, List, Button, Typography } from 'antd';
import styles from './style.less';

const { Paragraph } = Typography;

type IProps = {
  text: string;
  modalVisit: boolean;
  modalDatas: ApplicationItemType[];
  onOpenChange: (open: boolean) => void;
};

const ModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, modalDatas, text } = props;
  return (
    <DrawerForm
      colon={false}
      onOpenChange={onOpenChange}
      title={text}
      open={modalVisit}
      submitter={{
        render: () => {
          return [
            <Button
              key="ok"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              返回
            </Button>,
          ];
        },
      }}
      onFinish={async () => {
        return true;
      }}
    >
      <List<Partial<ApplicationItemType>>
        rowKey="id"
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        dataSource={modalDatas}
        renderItem={(item) => {
          return (
            <List.Item key={item.id}>
              <Card hoverable bodyStyle={{ height: '180px' }} className={styles.card}>
                <Card.Meta
                  title={<a>{item.text}</a>}
                  description={
                    <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                      {item.extension}
                    </Paragraph>
                  }
                />
              </Card>
            </List.Item>
          );
        }}
      />
    </DrawerForm>
  );
};

export default ModelForm;
