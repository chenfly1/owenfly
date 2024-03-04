import ModalForm from '@/components/ModalForm';
import { ProFormItem, ProFormInstance, ProFormTextArea } from '@ant-design/pro-components';
import { FlowMember } from '../../component/member';

export default ModalForm<any>(
  () => {
    return (
      <>
        <ProFormTextArea name="feedback" label="转办意见" placeholder="请输入转办意见" />
        <ProFormItem name="list" hidden />
        <ProFormItem style={{ paddingLeft: '4px' }} label="转办人" shouldUpdate>
          {(form: ProFormInstance) => {
            const value = form.getFieldValue('list');
            return (
              <FlowMember
                value={value}
                onChange={(list) => {
                  form.setFieldValue('list', list);
                }}
              />
            );
          }}
        </ProFormItem>
      </>
    );
  },
  {
    title: '选择转办人',
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
    labelCol: { flex: '97px' },
    mask: false,
    transitionName: '',
  },
);
