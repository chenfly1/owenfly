import { articleList, relateArticle } from '@/services/content';
import { DrawerForm, ProFormSelect } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';

type IProps = {
  modalVisit: boolean;
  topicProject: string;
  topicProjectBids: any;
  topicId: string;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, topicProject, topicId, onSubmit, topicProjectBids } = props;
  const formRef = useRef<ProFormInstance>();

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    const res = await relateArticle({
      id: values.id,
      topicId: topicId,
      relate: 1,
    });
    formRef?.current?.resetFields();
    if (res.code === 'SUCCESS') {
      onSubmit();
      message.success('操作成功');
    }
    return true;
  };

  const searchKeyword = async (params: any) => {
    const { keyWords } = params;
    const res = await articleList({ code: keyWords, end: 'C', projectBids: topicProjectBids });
    return res.data.map((i) => ({ value: i.id, label: i.code }));
  };

  return (
    <DrawerForm
      colon={false}
      onOpenChange={onOpenChange}
      title="关联内容"
      layout="horizontal"
      width={560}
      open={modalVisit}
      formRef={formRef}
      onFinish={onFinish}
    >
      <p>提示：该话题已关联项目“{topicProject}”，仅可关联该项目下内容</p>
      <ProFormSelect
        name="id"
        label="内容编号"
        showSearch
        rules={[
          {
            required: true,
            message: '输入内容编号',
          },
        ]}
        request={searchKeyword}
        placeholder="输入内容编号"
      />
    </DrawerForm>
  );
};

export default AddModelForm;
