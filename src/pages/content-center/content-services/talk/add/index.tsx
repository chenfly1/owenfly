import { DrawerForm, ProFormItem, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { getTopicDetails, saveTopic } from '@/services/content';
import TransferProject from '@/pages/content-center/components/transferProject';

type IProps = {
  modalVisit: boolean;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const formRef = useRef<ProFormInstance>();
  const [projectList, setProjectList] = useState<string[]>();
  const [title, setTitle] = useState<string>();
  const [detailsData, setDetailsData] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const projectAllList: any[] = initialState?.projectList || [];
  // 只有一个项目默认选中
  const isOneProject = projectAllList.length === 1 ? true : false;

  useEffect(() => {
    if (isOneProject) {
      formRef?.current?.setFieldsValue({
        projectNames: projectAllList[0].name,
        projectBids: [projectAllList[0].bid],
      });
      setProjectList([projectAllList[0].bid]);
    }
    setTitle('新建话题');
    if (data?.id) {
      setTitle('编辑话题');
      getTopicDetails(data.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          setDetailsData(res.data);
          formRef?.current?.setFieldsValue({
            ...res.data,
          });
        }
      });
    }
    return () => {
      formRef?.current?.resetFields();
    };
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    if (projectList) values.projectBids = projectList;
    const res = await saveTopic(data?.id ? { ...detailsData, ...values } : values);
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
      formRef={formRef}
      labelCol={{
        flex: '80px',
      }}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={560}
      open={modalVisit}
      onFinish={onFinish}
    >
      <ProFormText
        name="title"
        label="话题标题"
        rules={[
          {
            required: true,
            message: '请输入最多15个字符',
          },
        ]}
        fieldProps={{
          maxLength: 15,
          showCount: true,
        }}
        placeholder="请输入最多15个字符"
      />
      <ProFormTextArea
        name="text"
        label="话题描述"
        fieldProps={{
          maxLength: 100,
          showCount: true,
          rows: 4,
        }}
        placeholder="请输入最多100个字符"
      />
      {data?.id || isOneProject ? (
        <ProFormText colon={false} name="projectNames" readonly label="关联项目" />
      ) : (
        <ProFormItem shouldUpdate>
          {(form) => {
            console.log(form);
            const projectBids = form?.getFieldValue('projectBids');
            return (
              <ProFormItem
                label="关联项目"
                name="projectBids"
                shouldUpdate
                labelCol={{
                  flex: '80px',
                }}
                rules={[
                  {
                    required: true,
                    validator: () => {
                      if (projectList?.length) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject('请选择项目');
                      }
                    },
                    message: '请选择项目',
                  },
                ]}
              >
                <TransferProject
                  projectBids={projectBids}
                  setProjectBids={(vals: string[], list: any) => {
                    if (list) setProjectList(list);
                    form?.setFieldsValue({
                      projectBids: vals,
                    });
                  }}
                />
              </ProFormItem>
            );
          }}
        </ProFormItem>
      )}
    </DrawerForm>
  );
};

export default AddModelForm;
