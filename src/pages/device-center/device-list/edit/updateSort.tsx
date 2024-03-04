import { exceptionDevice, latestDeviceName } from '@/services/device';
import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import styles from './style.less';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const [latestSort, setLatestSort] = useState<string>();
  const [latestName, setLatestName] = useState<string>();
  useEffect(() => {
    if (modalVisit) {
      latestDeviceName(data).then((res) => {
        setLatestSort(res.data.code);
        setLatestName(res.data.name);
      });
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      console.log(values);
      const res = await exceptionDevice({ id: data.id, name: latestName });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  return (
    <Modal
      title="处理认证异常"
      width={600}
      open={modalVisit}
      onOk={onFinish}
      onCancel={() => {
        onOpenChange(false);
      }}
    >
      <div className={styles.sortText}>
        <h3>{data?.name}</h3>
        <p className={styles.deviceUpdateMargin}>
          <div>同一空间节点下设备号不唯一</div>
          <div>
            系统顺位排序为 <span className={styles.sortDefault}>{latestSort}</span>
          </div>
        </p>
        <div>
          <div>设备将修改为</div>
          <div className={styles.sortDefault}>{latestName}</div>
        </div>
      </div>
    </Modal>
  );
};

export default AddModelForm;
