import SpaceTree from './SpaceTree';
import { getDeviceTypeList, updateDevice } from '@/services/device';
import { DrawerForm, ProFormItem, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import { useMountedRef } from '@/hooks';
import { getPhysicalSpaceParents } from '@/services/base';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const mountedRef = useMountedRef();
  const formRef = useRef<ProFormInstance>();
  const treeRef = useRef();
  const [checkedKeys, setCheckedKeys] = useState<string[]>();
  useEffect(() => {
    if (modalVisit && mountedRef.current) {
      formRef?.current?.setFieldsValue({
        ...data,
      });
      if (data.spaceId) {
        getPhysicalSpaceParents({ spaceId: data.spaceId }).then((res) => {
          if (res.data && res.data.length) {
            setCheckedKeys(res.data.map((i) => i.id));
          } else {
            setCheckedKeys([]);
          }
        });
      } else {
        setCheckedKeys([]);
      }
    }
  }, [modalVisit]);

  const onCheck: any = (keys: any, info: any) => {
    console.log('onCheck', keys);
    console.log('onCheck', info);
    console.log('onCheck', (treeRef.current as any).getParentList(info.node.key));
    if (info.checked) {
      const list = (treeRef.current as any).getParentList(info.node.key);
      setCheckedKeys(list.map((i: any) => i.id));
      formRef?.current?.setFieldsValue({
        spaceName:
          list.length > 1
            ? list
                .splice(1)
                .map((i: any) => i.name)
                .join('-')
            : list.map((i: any) => i.name).join('-'),
      });
    } else {
      setCheckedKeys([]);
      formRef?.current?.setFieldsValue({
        spaceName: '',
      });
    }
  };

  const onFinish = async (values: Record<string, any>) => {
    try {
      values.spaceId = checkedKeys?.length ? checkedKeys[checkedKeys.length - 1] : null;
      const res = await updateDevice({ ...data, ...values });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        formRef?.current?.resetFields();
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title="编辑设备"
      layout="horizontal"
      width={600}
      labelCol={{
        flex: '80px',
      }}
      open={modalVisit}
      onFinish={onFinish}
      submitter={{
        render: (_, dom) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormText
        label="设备名称"
        name="name"
        fieldProps={{
          maxLength: 100,
        }}
        rules={[{ required: true, message: '请输入设备名称' }]}
      />
      <ProFormSelect
        label="设备类型"
        name="typeId"
        placeholder="请选择"
        disabled
        rules={[{ required: true, message: '请选择' }]}
        request={async () => {
          const res = await getDeviceTypeList();
          return res.data.map((i) => ({
            value: i.id,
            label: i.name,
          }));
        }}
      />
      <ProFormItem className={styles.inputMargin}>
        <ProFormText
          label="安装位置"
          name="spaceName"
          rules={[{ required: true, message: '请选择' }]}
          disabled
        />
        <SpaceTree
          deviceType={data?.typeCode}
          checkedKeys={checkedKeys}
          ref={treeRef}
          checkStrictly
          onCheck={onCheck}
        />
      </ProFormItem>
    </DrawerForm>
  );
};

export default AddModelForm;
