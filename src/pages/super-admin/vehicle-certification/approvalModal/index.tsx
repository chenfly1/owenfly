import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import { Card } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import ApprovalDetailModal from '../approvalDetailModal';
import { queryApprovingPage } from '@/services/park';

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
  const [carList, setCarList] = useState<VehicleApprovingType[]>([]);
  const [appDetailOpen, setAppDetailOpen] = useState(false);
  const [appDetailModalData, setAppDetailModalData] = useState<Record<string, any>>();

  const queryList = async () => {
    const res = await queryApprovingPage({
      pageSize: 20,
      pageNo: 1,
    });
    if (res.code === 'SUCCESS') {
      setCarList(res.data.items);
      return res.data?.items?.length;
    }
    return 0;
  };
  const onAppDetailSubmit = async () => {
    setAppDetailOpen(false);
    const length = await queryList();
    if (length === 0) {
      onSubmit();
    }
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
        width={520}
        title={'待审核'}
        formRef={formRef}
        submitter={false}
        open={open}
      >
        {carList.map((item: VehicleApprovingType) => (
          <Card key={item.gmtCreated} title={item.plate}>
            <div>{`手机号码：${item.mobile}`}</div>
            <div>{`提交时间：${item.gmtCreated}`}</div>
            <div style={{ textAlign: 'right' }}>
              <a
                onClick={() => {
                  setAppDetailOpen(true);
                  setAppDetailModalData(item);
                }}
              >
                {'去审核 >>'}
              </a>
            </div>
          </Card>
        ))}
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
