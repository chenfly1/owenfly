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
    title: '审批通过',
    destroyOnClose: true,
    width: '100vw',
    height: 400,
    style: {
      maxWidth: '100vw',
      top: 0,
      paddingBottom: 0,
    },
    bodyStyle: {
      height: 'calc(100vh - 108px)',
      overflowY: 'auto',
    },
    mask: false,
    transitionName: '',
  },
);
