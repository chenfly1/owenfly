import { ProFormList } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { ProFormMoney, ProFormText } from '@ant-design/pro-components';
import type { FormListActionType, ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import { Button, Card, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import { placeQueryByPage, vehicleAuthHandle, vehicleAuthReview } from '@/services/park';
import ApprovalDetailModal from '../approvalDetailModal';
import dayjs from 'dayjs';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<FormListActionType>();
  const [appDetailOpen, setAppDetailOpen] = useState(false);
  const [appDetailModalData, setAppDetailModalData] = useState<Record<string, any>>();

  const queryList = async () => {
    const res = await vehicleAuthReview({
      pageSize: 20,
      pageNo: 1,
    });
    if (res.code === 'SUCCESS') {
      const tempSource = res.data.elements.map((item: any) => ({
        ...item,
        orderAmount: item.orderAmount ? item.orderAmount / 100 : 0,
        plates: item.plates.join('、'),
        // months: dayjs(item.enDate).diff(item.startDate, 'month'),
      }));
      formRef.current?.setFieldsValue({
        sourceList: tempSource,
      });
    }
  };

  const onFinish = async (flag: boolean, row: any) => {
    const res = await vehicleAuthHandle({
      id: row?.id,
      reviewType: flag ? '1' : '2', // 1:通过 2:不通过
    });
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      onSubmit();
    }
  };

  // 车位下拉
  const queryLotList = async () => {
    const res = await placeQueryByPage({
      pageSize: 1000,
      pageNo: 1,
      // projectId: project.bid,
      state: '1',
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const onAppDetailSubmit = () => {
    setAppDetailOpen(false);
    queryList();
  };

  useEffect(() => {
    if (open) {
      queryList();
    }
  }, [open]);

  return (
    <>
      <DrawerForm
        colon={false}
        {...rest}
        labelCol={{ flex: '100px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        className={styles.drawerModal}
        width={620}
        readonly
        title={'待处理'}
        formRef={formRef}
        open={open}
        submitter={false}
      >
        <ProFormList
          actionRef={actionRef}
          name="sourceList"
          deleteIconProps={false}
          creatorButtonProps={false}
          min={1}
          copyIconProps={false}
          itemRender={({ listDom, action }, { index, record }) => {
            console.log(record);
            const title = record.type === 2 ? '月租申请' : '产权申请';
            return (
              <Card
                bordered
                style={{ marginBlockEnd: 10 }}
                title={title}
                extra={action}
                // bodyStyle={{ paddingBlockEnd: 0 }}
              >
                {listDom}
              </Card>
            );
          }}
        >
          {(f, index, action) => {
            const row = action.getCurrentRowData();
            if (row.type === 2) {
              // 月租
              return (
                <>
                  <ProFormText colon={false} name="packageName" label="月租套餐名称" />
                  <ProFormText colon={false} name="parkName" label="车场名称" />
                  <ProFormText colon={false} name="plates" label="车牌号码" />
                  <ProFormText colon={false} name="startDate" label="开始时间" />
                  <ProFormText colon={false} name="enDate" label="结束时间" />
                  <ProFormText colon={false} name="tenancyTerm" label="周期" />
                  <ProFormText colon={false} name="month" label="月数" />
                  <ProFormMoney colon={false} name="orderAmount" label="订单金额" />
                  <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <Space>
                      <Button
                        onClick={() => {
                          onFinish(false, row);
                        }}
                      >
                        不通过
                      </Button>
                      <Button
                        onClick={() => {
                          onFinish(true, row);
                        }}
                        type="primary"
                      >
                        通过
                      </Button>
                    </Space>
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <ProFormSelect
                    name="spaces"
                    label="车位编号"
                    colon={false}
                    request={queryLotList}
                    mode="multiple"
                    readonly={true}
                  />
                  <ProFormText colon={false} name="plates" label="车牌号码" />
                  <ProFormText colon={false} name="gmtGreated" label="申请时间" />
                  <ProFormText colon={false} name="ownerName" label="产权人" />
                  <ProFormText colon={false} name="ownerPhone" label="手机号码" />
                  <div style={{ textAlign: 'right' }}>
                    <a
                      onClick={() => {
                        setAppDetailOpen(true);
                        setAppDetailModalData(row);
                      }}
                    >
                      {'去办理 >>'}
                    </a>
                  </div>
                </>
              );
            }
          }}
        </ProFormList>
      </DrawerForm>
      <ApprovalDetailModal
        open={appDetailOpen}
        onOpenChange={setAppDetailOpen}
        onSubmit={onAppDetailSubmit}
        data={appDetailModalData}
      />
    </>
  );
};

export default Add;
