import RichTextEditor from '@/components/RichTextEditor';
import { DrawerForm, ProFormItem } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { getArticleDetails, saveArticle } from '@/services/content';
import { message } from 'antd';
import './style.less';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const DetailsModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [detailsData, setDetailsData] = useState<any>({});
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    formRef?.current?.resetFields();
    if (data?.id) {
      getArticleDetails(data.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          setContent(res.data.text || '');
          setDetailsData(res.data);
          formRef?.current?.setFieldsValue({
            text: res.data.text || '',
          });
        }
      });
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    values.text = values.text.level ? values.text.level.content : values.text;
    console.log(values);
    const res = await saveArticle(data?.id ? { ...detailsData, ...values } : values);
    if (res.code === 'SUCCESS') {
      onSubmit();
      onOpenChange(false);
      formRef?.current?.resetFields();
      message.success('操作成功');
    }
  };

  return (
    <DrawerForm
      colon={false}
      onOpenChange={onOpenChange}
      title="输入正文内容"
      open={modalVisit}
      formRef={formRef}
      onFinish={onFinish}
    >
      <ProFormItem shouldUpdate className="editorHeight">
        {(form) => {
          return (
            <ProFormItem
              name="text"
              className="editorHeight"
              rules={[
                {
                  required: true,
                  message: '请输入正文内容',
                },
              ]}
            >
              <RichTextEditor
                content={content}
                key={'community'}
                setContent={(text: string) => {
                  form?.setFieldsValue({
                    text: text,
                  });
                }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
    </DrawerForm>
  );
};

export default DetailsModelForm;
