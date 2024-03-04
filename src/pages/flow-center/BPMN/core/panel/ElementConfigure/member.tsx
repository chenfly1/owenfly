import ModalForm from '@/components/ModalForm';
import { ProFormItem, ProFormInstance } from '@ant-design/pro-components';
import { FlowMember } from '../../../../component/member';

export default ModalForm<any>(
  () => {
    return (
      <>
        <ProFormItem name="list" hidden />
        <ProFormItem noStyle shouldUpdate>
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
    title: '按人员选择节点负责人',
    destroyOnClose: true,
    width: 640,
    bodyStyle: { overflow: 'hidden' },
  },
);
