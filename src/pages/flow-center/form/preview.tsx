import { ProFormItem, ProFormText } from '@ant-design/pro-components';
import { PreviewWidget } from '../designer/widgets';
import Style from './index.less';
import DrawerForm from '@/components/DrawerForm';

export interface FormPreviewProps {
  name: string;
  schema: object;
}
export default DrawerForm<FormPreviewProps>(
  ({ source }) => {
    return (
      <>
        <ProFormText label="表单名称" name="name" readonly />
        <ProFormItem noStyle>
          <div className={Style.form_preview}>
            <PreviewWidget schema={source?.schema} />
          </div>
        </ProFormItem>
      </>
    );
  },
  {
    title: '预览表单',
    width: 800,
    labelCol: { flex: '100px' },
    labelAlign: 'left',
    confirm: true,
  },
);
