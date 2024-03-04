import ModalForm from '@/components/ModalForm';
import { ProFormItem, ProFormTextArea } from '@ant-design/pro-components';

export default ModalForm<any>(
  ({ source }) => {
    return (
      <>
        <ProFormItem name="list" hidden />
        <ProFormTextArea name="feedback" label="审批意见" placeholder="请输入审批意见" />
      </>
    );
  },
  {
    width: 400,
    title: '审批通过',
    labelCol: { flex: '65px' },
    destroyOnClose: true,
    cancelText: '取消',
  },
);
