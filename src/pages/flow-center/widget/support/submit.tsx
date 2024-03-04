import ModalForm from '@/components/ModalForm';
import { ProFormItem, ProFormInstance } from '@ant-design/pro-components';
import { FlowMember } from '../../component/member';

export default ModalForm<any>(
  () => {
    return (
      <>
        <ProFormItem name="list" hidden />
        <ProFormItem label="审批人" shouldUpdate>
          {(form: ProFormInstance) => {
            const value = form.getFieldValue('list');
            return (
              <FlowMember
                value={value}
                onChange={(list) => {
                  form.setFieldValue(
                    'list',
                    list.map((item: any) => item.id),
                  );
                }}
              />
            );
          }}
        </ProFormItem>
      </>
    );
  },
  {
    title: '选择节点负责人',
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
