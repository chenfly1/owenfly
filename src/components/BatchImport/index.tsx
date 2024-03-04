import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import styles from './styles.less';
type IProps = {
  title?: string;
  fileTypePlaceholder?: string;
  children?: React.ReactNode;
};
const BatchImport: React.FC<IProps> = (prop) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button ghost type="primary" onClick={showModal}>
        批量导入
      </Button>
      <Modal
        title={prop.title || '导入文件名'}
        centered
        style={{ top: 20 }}
        width="480px"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className={styles.BatchImportModal}
      >
        <div className={styles.container}>
          <div className={styles.item}>
            <div className={styles.step}>1</div>
            <div className={styles.content}>
              <div className={styles.title}>下载导入模板</div>
              <div className={styles.subTitle}>请务必下载并使用此模板填写</div>
            </div>
            <div className={styles.action}>
              <Button>下载模板</Button>
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.step}>2</div>
            <div className={styles.content}>
              <div className={styles.title}>上传导入模板</div>
              <div className={styles.subTitle}>{prop.fileTypePlaceholder}</div>
            </div>
            <div className={styles.action}>
              <Button>下载模板</Button>
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.step}>3</div>
            <div className={styles.content}>
              <div className={styles.title}>校验</div>
              <div className={styles.subTitle}>导入后显示导入结果</div>
            </div>
            <div className={styles.action}>
              <Button>下载模板</Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BatchImport;
