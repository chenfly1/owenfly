import { DrawerForm, ProFormItem, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import SpaceTree from '../../device-list/edit/SpaceTree';
import styles from './style.less';
import { getPhysicalSpaceParents } from '@/services/base';
import { saveIpSpace } from '@/services/device';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const treeRef = useRef();
  const [checkedKeys, setCheckedKeys] = useState<string[]>();
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>();
  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue({
        ...data,
      });
      setTitle('新建IP');
      if (data.spaceId) {
        setTitle('编辑IP');
        getPhysicalSpaceParents({ spaceId: data.spaceId }).then((res) => {
          if (res.data && res.data.length) {
            setCheckedKeys(res.data.map((i) => i.id));
            formRef?.current?.setFieldsValue({
              spaceName: res.data.map((i) => i.name).join('-'),
            });
          } else {
            setCheckedKeys([]);
          }
        });
      } else {
        setCheckedKeys([]);
      }
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      const res = await saveIpSpace({
        ...values,
        id: data.id || null,
        spaceId: checkedKeys && checkedKeys.length ? checkedKeys[checkedKeys.length - 1] : null,
      });
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

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={title}
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
        label="IP"
        name="ip"
        disabled={data?.spaceId}
        rules={[
          { required: true, message: '请输入IP' },
          { pattern: /^[0-9\.]+$/, message: '只允许输入数字和【.】' },
        ]}
      />
      <ProFormItem className={styles.inputMargin}>
        <ProFormText
          label="安装位置"
          name="spaceName"
          rules={[{ required: true, message: '请选择' }]}
          disabled
        />
        <SpaceTree checkedKeys={checkedKeys} ref={treeRef} checkStrictly onCheck={onCheck} />
      </ProFormItem>
    </DrawerForm>
  );
};

export default AddModelForm;
