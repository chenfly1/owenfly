import { Tabs, Card } from 'antd';
import Water from './water';
import Electric from './electric';
import Property from './property';
import { PageContainer } from '@ant-design/pro-layout';
import style from './style.less';
import ProFormDatePickerMonth from '@ant-design/pro-form/lib/components/DatePicker/MonthPicker';
import { useState } from 'react';
import dayjs from 'dayjs';
export default () => {
  const [month, setMonth] = useState<any>(dayjs().format('YYYY-MM'));
  return (
    <PageContainer header={{ title: null }}>
      <Card bordered={false} className={style.cardStyle}>
        <Tabs
          defaultActiveKey="1"
          tabBarExtraContent={
            <ProFormDatePickerMonth
              colon={false}
              className={style.cusFormItem}
              label="选择账单所属月份"
              name="month"
              fieldProps={{
                allowClear: false,
                value: month,
                onChange(e) {
                  setMonth(e?.format('YYYY-MM'));
                },
              }}
            />
          }
          items={[
            {
              label: `水费`,
              key: '1',
              children: <Water month={month} />,
            },
            {
              label: `电费`,
              key: '2',
              children: <Electric month={month} />,
            },
            {
              label: `物业费`,
              key: '3',
              children: <Property month={month} />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};
