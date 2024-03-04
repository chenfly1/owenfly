import ModalForm from '@/components/ModalForm';
import { ProFormItem, ProFormInstance } from '@ant-design/pro-components';
import { FlowOrg } from '../../../../component/org';

export default ModalForm<any>(
  () => {
    return (
      <>
        <ProFormItem name="list" hidden />
        <ProFormItem noStyle shouldUpdate>
          {(form: ProFormInstance) => {
            const value = form.getFieldValue('list');
            return (
              <FlowOrg
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
    title: '按组织选择节点负责人',
    destroyOnClose: true,
    width: 640,
    bodyStyle: { overflow: 'hidden' },
  },
);
