import ProjectSelect from '@/components/ProjectSelect';
import { activitySignUpBatch, activitySignUpCheck } from '@/services/content';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { FormListActionType, ProFormInstance } from '@ant-design/pro-components';
import { ProFormCheckbox, ProFormDigit } from '@ant-design/pro-components';
import { ProCard, ProFormList } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('帮业主报名');
      if (data?.id) {
        formRef?.current?.setFieldsValue({
          title: data.title,
          projectIds: data.projectIds,
          signUpCond: data.signUpCond.split(','),
          signUpLimit: data.signUpLimit ? data.signUpLimit + '人' : '不限人数',
        });
      }
    }
  }, [open]);

  const phoneChange = async (e: any, action: any) => {
    console.log(e.target);
    if (e.target && e.target.value.length === 11) {
      const res = await activitySignUpCheck({
        phone: e.target.value,
        activityId: data?.id,
      });
      if (res.data === false) {
        console.log(action);
        Modal.confirm({
          icon: <ExclamationCircleFilled />,
          title: `该用户不符合活动要求`,
          centered: true,
          onOk: async () => {
            action.setCurrentRowData({
              phone: '',
            });
          },
          onCancel() {
            action.setCurrentRowData({
              phone: '',
            });
          },
        });
      }
    }
  };
  const onFinish = async (formData: any) => {
    // 新增
    console.log('formData', formData);
    try {
      const res = await activitySignUpBatch(
        formData.list.map((i: any) => ({
          ...i,
          activityId: data?.id,
          accountType: 'B',
        })),
      );
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        onOpenChange(false);
        onSubmit();
      }
    } catch (error) {}
    return false;
  };
  return (
    <>
      <DrawerForm
        {...rest}
        labelCol={{ flex: '100px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
      >
        <h3 style={{ fontWeight: 'bold' }}>活动信息</h3>
        <ProjectSelect
          label="关联项目"
          colon
          width={300}
          allowClear={false}
          disabled
          name="projectBid"
          readonly
          rules={[{ required: true, message: '请选择所属项目' }]}
          placeholder="请选择所属项目"
        />
        <ProFormText width={300} name="title" readonly label="活动标题" />
        <ProFormCheckbox.Group
          name="signUpCond"
          label="活动参加条件"
          width={300}
          readonly
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
          options={[
            {
              label: '业主及同住人（在当前项目下有产权的人）',
              value: 'IS_CUSTOMER',
            },
            {
              label: '员工',
              value: 'IS_STAFF',
            },
          ]}
        />
        <ProFormText width={300} name="signUpLimit" readonly label="活动人数" />
        <h3 style={{ fontWeight: 'bold' }}>业主信息</h3>
        <ProFormList
          name="list"
          actionRef={actionRef}
          creatorButtonProps={{
            creatorButtonText: '新增',
          }}
          deleteIconProps={{
            Icon: (_) => {
              return <DeleteOutlined {..._} style={{ color: 'red' }} />;
            },
          }}
          itemRender={({ listDom, action }, { index }) => (
            <ProCard
              bordered
              style={{ marginBlockEnd: 8 }}
              extra={action}
              bodyStyle={{ paddingBlockEnd: 0 }}
            >
              {listDom}
            </ProCard>
          )}
          min={1}
          copyIconProps={false}
          initialValue={[
            { name: undefined, phone: undefined, signUpCount: undefined, remark: undefined },
          ]}
        >
          {(f, index, action) => {
            return (
              <>
                <ProFormText
                  label="报名人"
                  name="name"
                  width={300}
                  labelCol={{ flex: '100px' }}
                  fieldProps={{ maxLength: 20 }}
                  placeholder="请输入报名人"
                  rules={[{ required: true, message: '请输入报名人' }]}
                />
                <ProFormText
                  label="报名人手机"
                  name="phone"
                  width={300}
                  labelCol={{ flex: '100px' }}
                  fieldProps={{
                    maxLength: 11,
                    onChange: (value) => phoneChange(value, action),
                  }}
                  placeholder="请输入报名人手机"
                  rules={[
                    {
                      required: true,
                      message: '请输入报名人手机',
                    },
                    {
                      pattern: /^1\d{10}$/,
                      message: '手机号格式错误',
                    },
                  ]}
                />
                <ProFormDigit
                  label="报名人数"
                  name="signUpCount"
                  width={300}
                  fieldProps={{ precision: 0 }}
                  labelCol={{ flex: '100px' }}
                  placeholder="请输入报名人数"
                  rules={[
                    { required: true, message: '请输入大于0的正整数' },
                    {
                      validator(rule, value, callback) {
                        if (value < 1) {
                          callback('请输入大于0的正整数');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
                <ProFormText
                  label="备注"
                  name="remark"
                  width={300}
                  fieldProps={{ maxLength: 300 }}
                  labelCol={{ flex: '100px' }}
                  placeholder="请输入备注"
                />
              </>
            );
          }}
        </ProFormList>
      </DrawerForm>
    </>
  );
};

export default Add;
