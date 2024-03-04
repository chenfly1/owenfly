import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getOperationDetails } from '@/services/auth';
import ReactJson from 'react-json-view';

type IProps = {
  modalVisit: boolean;
  data: OperationType;
  onOpenChange: (open: boolean) => void;
};

const FaceModel: React.FC<IProps> = ({ modalVisit, data, onOpenChange }) => {
  const [inputValue, setInputValue] = useState<Record<string, any>>();
  const [outputValue, setOutputValue] = useState<Record<string, any>>();

  const getDetails = async () => {
    const res = await getOperationDetails({ logId: data.id });
    if (res.code === 'SUCCESS') {
      setInputValue(res.data.input && JSON.parse(res.data.input));
      setOutputValue(res.data.output && JSON.parse(res.data.output));
    }
  };

  useEffect(() => {
    if (modalVisit && data) {
      getDetails();
    }
  }, [modalVisit]);

  return (
    <Modal
      title="日志详情"
      width="70%"
      open={modalVisit}
      onCancel={() => {
        onOpenChange(false);
      }}
      centered
      footer={[
        <Button
          key="back"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          返回
        </Button>,
      ]}
    >
      <h3 style={{ fontWeight: 'bold' }}>请求入参</h3>
      <ReactJson
        name="入参"
        style={{ height: '200px', overflow: 'auto' }}
        theme="monokai"
        src={inputValue || {}}
      />
      <h3 style={{ fontWeight: 'bold' }}>数据响应</h3>
      <ReactJson
        name="出参"
        style={{ height: '500px', overflow: 'auto' }}
        theme="monokai"
        src={outputValue || {}}
      />
    </Modal>
  );
};

export default FaceModel;
