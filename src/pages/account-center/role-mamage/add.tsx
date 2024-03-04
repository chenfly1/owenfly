import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { DrawerForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { roleCreate, roleDetail, roleUpdate } from '@/services/auth';
import { useModel } from 'umi';
import SourceTree from './source-tree';

// import { getModuleList } from '@/services/wps';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: Record<string, any>;
};

const handlerCreate = async (params: RoleCreateParamsType) => {
  try {
    const res = await roleCreate(params);
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
const handlerUpdate = async (params: RoleCreateParamsType) => {
  try {
    const res = await roleUpdate(params);
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

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  onSubmit,
  data,
  ...rest
}) => {
  const { initialState } = useModel('@@initialState');
  const [title, setTitle] = useState('新建角色');
  const formRef = useRef<ProFormInstance>();
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const treeRef = useRef<ProFormInstance>();

  const onCheck = (checkedKeysValue: React.Key[] | any) => {
    setCheckedKeys(checkedKeysValue);
  };

  useEffect(() => {
    if (open === true) {
      setCheckedKeys([]);
      setTitle('新建角色');
      formRef?.current?.resetFields();
      if (data?.id) {
        setTitle('编辑角色');
        roleDetail(data).then((res) => {
          formRef?.current?.setFieldsValue({
            name: res.data.name,
            remark: res.data.remark,
            // resourceBids: res.data.functions || [],
            state: res.data.state,
          });
          setCheckedKeys(res.data.resourceBids || []);
          (treeRef?.current as any).expandByKeys(res.data.functions);
        });
      }
    }
  }, [open]);

  const onFinish = async (formData: RoleCreateParamsType) => {
    let success = false;
    const dataList = (treeRef?.current as any).getDataList();
    const resourceBids = dataList
      .map((item: any) => {
        if (checkedKeys.includes(item.bid)) {
          return item.bid;
        }
        return null;
      })
      .filter((item: any, i: number, self: any) => item && self.indexOf(item) === i);
    const params: RoleCreateParamsType = {
      remark: formData.remark,
      name: formData.name || '',
      resourceBids: resourceBids || [],
      state: 'NORMAL',
      orgBid: (initialState?.currentUser?.orgBidList || [])[0] || '',
    };
    if (data?.id) {
      params.id = data?.id;
      params.state = formData.state || 'NORMAL';
      // 更新
      success = await handlerUpdate(params);
    } else {
      // 新增
      // const resourceBids = (formData?.resourceBids || []).map(
      //   (item: string) => item.split('-')[0],
      // );
      success = await handlerCreate(params);
    }
    if (success) {
      onSubmit();
    }
  };
  return (
    <DrawerForm
      colon={false}
      {...rest}
      labelCol={{ flex: '100px' }}
      formRef={formRef}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={620}
      title={title}
      open={open}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="角色名称"
        readonly={data?.openType === 'edit'}
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          maxLength: 20,
          showCount: true,
        }}
        placeholder="请输入角色名称"
      />
      <ProFormText
        name="remark"
        label="备注"
        placeholder="请输入备注"
        fieldProps={{
          maxLength: 50,
          showCount: true,
        }}
      />
      {data?.id && (
        <ProFormSelect
          name="state"
          label="角色状态"
          rules={[
            {
              required: true,
            },
          ]}
          placeholder={'请选择状态'}
          options={[
            {
              label: '可用',
              value: 'NORMAL',
            },
            {
              label: '禁用',
              value: 'BAND',
            },
          ]}
        />
      )}
      <ProForm.Item label="功能权限" name="resourceBids">
        {/* <TreeSelect
          multiple
          disabled={rest.readonly}
          treeDefaultExpandAll={false}
          treeData={treeData}
          treeCheckable={true}
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          listHeight={600}
          placeholder="请选择功能权限"
          treeNodeFilterProp="title"
        /> */}
        <SourceTree
          disabled={data?.openType === 'detail'}
          onCheck={onCheck}
          ref={treeRef}
          checkedKeys={checkedKeys}
        />
      </ProForm.Item>
    </DrawerForm>
  );
};

export default Add;
