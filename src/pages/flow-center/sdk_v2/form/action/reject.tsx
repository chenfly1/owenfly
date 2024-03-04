import ModalForm from '@/components/ModalForm';
import { ProFormTextArea } from '@ant-design/pro-components';

export default ModalForm<any>(
  () => {
    return <ProFormTextArea name="feedback" label="审批意见" placeholder="请输入审批意见" />;
  },
  {
    width: 400,
    title: '审批拒绝',
    labelCol: { flex: '65px' },
    destroyOnClose: true,
    cancelText: '取消',
  },
);
