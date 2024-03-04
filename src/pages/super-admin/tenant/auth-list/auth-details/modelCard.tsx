import { ProFormSwitch } from '@ant-design/pro-components';
import { Card, List, Button, Typography, Drawer } from 'antd';
import styles from './style.less';

const { Paragraph } = Typography;

type IProps = {
  text: string;
  modalVisit: boolean;
  modalDatas: ApplicationItemType[];
  onOpenChange: () => void;
  childChange: (checked: boolean, item: ApplicationItemType) => void;
};

const ModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, modalDatas, text, childChange } = props;
  const onChange = (checked: boolean, item: ApplicationItemType) => {
    childChange(checked, item);
  };
  return (
    <Drawer
      onClose={onOpenChange}
      title={text}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button
            key="ok"
            onClick={() => {
              onOpenChange();
            }}
          >
            返回
          </Button>
        </div>
      }
      open={modalVisit}
      key={text}
      width={720}
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
                <div className={styles.cardSwitch}>
                  <ProFormSwitch
                    name={item.id}
                    fieldProps={{
                      disabled: item.state === 'NORMAL',
                      onChange: (checked: boolean) =>
                        onChange(checked, item as ApplicationItemType),
                    }}
                  />
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </Drawer>
  );
};

export default ModelForm;
