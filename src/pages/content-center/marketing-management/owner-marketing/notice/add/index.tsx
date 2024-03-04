import {
  DrawerForm,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { articleList, getPlanDetails, savePlan } from '@/services/content';
import { useModel } from 'umi';
import TransferProject from '@/pages/content-center/components/transferProject';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [projectList, setProjectList] = useState<string[]>();
  const [title, setTitle] = useState<string>();
  const [detailsData, setDetailsData] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const projectAllList: any[] = initialState?.projectList || [];
  // 只有一个项目默认选中
  const isOneProject = projectAllList.length === 1 ? true : false;

  useEffect(() => {
    formRef?.current?.resetFields();
    if (isOneProject) {
      formRef?.current?.setFieldsValue({
        projectNames: projectAllList[0].name,
        projectBids: [projectAllList[0].bid],
      });
      setProjectList([projectAllList[0].bid]);
    }
    setTitle('新建计划');
    if (data?.id) {
      setTitle('编辑计划');
      getPlanDetails(data.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          setDetailsData(res.data);
          formRef?.current?.setFieldsValue({
            ...res.data,
            selectContent: res.data.contentId
              ? {
                  label: (res.data as any).content,
                  value: (res.data as any).contentId,
                }
              : null,
          });
        }
      });
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    if (projectList?.length) values.projectBids = projectList;
    values.end = 'C';
    values.type = 'Notice';
    if (values.selectContent) {
      values.content = values.selectContent.label;
      values.contentId = values.selectContent.value;
    }
    const res = await savePlan(data?.id ? { ...detailsData, ...values } : values);
    if (res.code === 'SUCCESS') {
      onSubmit();
      onOpenChange(false);
      message.success('操作成功');
      formRef?.current?.resetFields();
    }
  };

  const searchKeyword = async (params: any) => {
    const { keyWords } = params;
    const res = await articleList({ code: keyWords, end: 'C', status: 1 });
    return res.data.map((i) => ({ value: i.id, label: i.code, projectBidList: i.projectBids }));
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={560}
      labelCol={{
        flex: '100px',
      }}
      open={modalVisit}
      onFinish={onFinish}
    >
      <ProFormText
        name="titleName"
        label="计划类型"
        colon={false}
        initialValue={'通知栏'}
        readonly
      />
      <ProFormText
        name="name"
        label="计划名称"
        rules={[
          {
            required: true,
            message: '请输入最多20个字符',
          },
        ]}
        fieldProps={{
          maxLength: 20,
          showCount: true,
        }}
        placeholder="请输入最多20个字符"
      />
      <ProFormText
        name="text"
        label="通知栏内容"
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
      <ProFormSelect
        label="跳转方式"
        name="jumpWay"
        placeholder="请选择"
        readonly={data?.id ? true : false}
        colon={data?.id ? true : false}
        rules={[
          {
            required: true,
            message: '请选择',
          },
        ]}
        fieldProps={{
          onChange: () => {
            setProjectList(isOneProject ? [projectAllList[0].bid] : []);
            formRef?.current?.setFieldsValue({
              content: null,
              selectContent: null,
              projectBids: null,
            });
          },
        }}
        options={[
          {
            value: 0,
            label: '站内跳转',
          },
          {
            value: 1,
            label: '站外跳转',
          },
        ]}
      />
      <ProFormDependency name={['jumpWay']}>
        {({ jumpWay }) => {
          return jumpWay === 1 ? (
            <ProFormText
              name="content"
              label="跳转内容"
              readonly={data?.id ? true : false}
              colon={data?.id ? true : false}
              rules={[
                {
                  required: true,
                  message: '请输入内容链接',
                },
              ]}
              fieldProps={{
                maxLength: 150,
              }}
              placeholder="请输入内容链接"
            />
          ) : (
            <ProFormSelect
              name="selectContent"
              label="跳转内容"
              showSearch
              readonly={data?.id ? true : false}
              colon={data?.id ? true : false}
              rules={[
                {
                  required: true,
                  message: '输入内容编号',
                },
              ]}
              fieldProps={{
                filterOption: () => {
                  return true;
                },
                labelInValue: true,
                onChange: () => {
                  setProjectList(isOneProject ? [projectAllList[0].bid] : []);
                  formRef?.current?.setFieldsValue({
                    projectBids: null,
                  });
                },
              }}
              request={searchKeyword}
              placeholder="输入内容编号"
            />
          );
        }}
      </ProFormDependency>
      {data?.id || isOneProject ? (
        <ProFormText colon={false} name="projectNames" readonly label="关联项目" />
      ) : (
        <ProFormDependency name={['jumpWay', 'selectContent']}>
          {({ jumpWay, selectContent }) => {
            const projectBids = formRef?.current?.getFieldValue('projectBids');
            const projectBidList = jumpWay ? [] : selectContent?.projectBidList;
            return (
              <ProFormItem
                label="关联项目"
                name="projectBids"
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
                  filterProjectBids={projectBidList}
                  setProjectBids={(vals: string[], list: any) => {
                    if (list) setProjectList(list);
                    formRef?.current?.setFieldsValue({
                      projectBids: vals,
                    });
                  }}
                />
              </ProFormItem>
            );
          }}
        </ProFormDependency>
      )}
    </DrawerForm>
  );
};

export default AddModelForm;
