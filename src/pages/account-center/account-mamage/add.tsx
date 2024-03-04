import {
  orgQueryTreeList,
  roleQueryByPage,
  userCreate,
  userDetail,
  userUpdate,
} from '@/services/auth';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSwitch } from '@ant-design/pro-components';
import { DrawerForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { message, Tooltip, TreeSelect } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const handlerCreate = async (params: UserCreateParamsType) => {
  try {
    const res = await userCreate(params);
    if (res.code === 'SUCCESS') {
      message.success('创建成功！');
      return true;
    }
    return false;
  } catch (err) {
    message.error('请求失败，请重试！');
    return false;
  }
};
const handlerUpdate = async (params: UserCreateParamsType) => {
  try {
    const res = await userUpdate(params);
    if (res.code === 'SUCCESS') {
      message.success('更新成功！');
      return true;
    }
    return false;
  } catch (err) {
    message.error('请求失败，请重试！');
    return false;
  }
};

const loopData = (treeData: OrgListType[]): OrgListType[] => {
  return treeData.map((item) => {
    const disabled = item.state === 'BAND' ? true : false;
    if (item.children) {
      return {
        ...item,
        disabled,
        children: loopData(item.children),
      };
    }
    return {
      ...item,
      disabled,
    };
  });
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const [orgTreeData, setOrgTreeData] = useState<OrgListType[]>();
  const [title, setTitle] = useState<string>();
  const [isTadmin, setIsTadmin] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];

  const getTeeData = () => {
    const params = { orgBids: orgBidList };
    // 获取组织权限列表
    orgQueryTreeList({ params }).then((res) => {
      setOrgTreeData(loopData(res.data || []));
    });
  };
  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue({
        state: true,
      });
      setIsTadmin(false);
      setTitle('新建账号');
      getTeeData();
      if (data?.id) {
        setTitle('编辑账号');
        userDetail(data.id).then((res) => {
          console.log(res.data.roles.map((item) => item.bid));
          formRef?.current?.setFieldsValue({
            ...res.data,
            roleBids: res.data.roles
              .filter((item) => item.state === 'NORMAL')
              .map((item) => item.bid),
            state: res.data.state === 'NORMAL' ? true : false,
          });
          if (data.type === 'tadmin') {
            setIsTadmin(data.type === 'tadmin');
            formRef?.current?.setFieldsValue({
              roleBidsName: res.data.roles?.map((item) => item.name).join(','),
            });
          }
        });
      }
    }
  }, [open]);
  const onFinish = async (formData: UserCreateParamsType) => {
    const state = formData.state ? 'NORMAL' : 'BAND';
    const params = {
      ...formData,
      state,
    };
    let success = false;
    if (data?.id) {
      params.id = data?.id;
      // 更新
      success = await handlerUpdate(params);
    } else {
      // 新增
      success = await handlerCreate(params);
    }
    if (success) {
      onSubmit();
    }
    return success;
  };
  const queryRoles = async () => {
    const params = {
      pageNo: 1,
      pageSize: 1000,
      showTadmin: false,
      state: 'NORMAL',
    };
    const res = await roleQueryByPage({ params });
    return (res.data?.items || [])
      .map((item) => ({
        label: item.name,
        value: item.bid,
        type: item.type,
      }))
      .filter((item) => item.type !== 'tadmin');
  };
  let roleNode;
  if (isTadmin) {
    roleNode = <ProFormText name="roleBidsName" disabled label="角色" placeholder="请输入角色" />;
  } else {
    roleNode = (
      <ProFormSelect
        mode="multiple"
        name="roleBids"
        disabled={isTadmin}
        label="角色"
        request={queryRoles}
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请选择角色"
      />
    );
  }
  return (
    <DrawerForm
      colon={false}
      {...rest}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      title={title}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="用户姓名"
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请输入名称"
      />
      <ProFormText
        name="account"
        readonly={readonly}
        rules={[
          { required: true, message: '请输入账号' },
          readonly
            ? {}
            : {
                pattern: /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/,
                message: '请输入大小写字母或者数字，至少有一字母',
              },
        ]}
        label="账号"
        placeholder="请输入账号"
      />
      <ProFormText
        name="mobile"
        readonly={readonly}
        validateTrigger="onBlur"
        label="手机号"
        placeholder={'请输入手机号'}
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: '手机号格式错误',
          },
        ]}
      />
      <ProFormText
        name="email"
        readonly={readonly}
        label="电子邮箱"
        placeholder="请输入电子邮箱"
        rules={[
          // {
          //   required: true,
          //   message: '请输入电子邮箱',
          // },
          {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: '请输入正确的邮箱地址',
          },
        ]}
      />
      <ProForm.Item
        label="所属组织"
        rules={[
          {
            required: true,
          },
        ]}
        name="orgBidList"
      >
        <TreeSelect
          treeLine={true}
          multiple
          treeDefaultExpandAll={true}
          treeData={orgTreeData}
          fieldNames={{
            label: 'name',
            value: 'bid',
          }}
          treeCheckable={true}
          showCheckedStrategy={TreeSelect.SHOW_PARENT}
          placeholder="请选择所属组织"
          treeNodeFilterProp="title"
        />
      </ProForm.Item>

      {roleNode}
      <ProFormSwitch
        name="state"
        label="账号状态"
        fieldProps={{
          defaultChecked: true,
        }}
      />
    </DrawerForm>
  );
};

export default Add;
