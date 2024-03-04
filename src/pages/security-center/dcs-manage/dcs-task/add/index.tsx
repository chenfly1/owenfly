import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import { Tag, Transfer, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import SpaceTree from '@/components/SpaceTree';
import styles from './index.less';
import { useRequest } from 'umi';
import type { TreeProps } from 'antd/es/tree';
import {
  addMonitoringTask,
  getFaceGroupPage,
  getMonitoringTaskDetail,
  listDevices,
  updateMonitoringTask,
} from '@/services/monitor';

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
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse((sessionStorage.getItem('VprojectInfo') as string) || '{}');
  const [spaceId, setSpaceId] = useState<string>();
  const [title, setTitle] = useState<string>('');
  const [sltIds, setSltIds] = useState<string[]>([]);
  const treeRef = useRef<any>();
  const id = data?.id;

  // 查询人员分组
  const queryGroupList = async () => {
    const res = await getFaceGroupPage({
      pageNo: 1,
      pageSize: 1000,
    });
    return (res.data.items || []).map((item) => {
      return {
        ...item,
        label: item.name,
        value: item.id,
      };
    });
  };

  // 获取设备列表
  const getDeviceList = async () => {
    if (open) {
      const res = await listDevices({ projectId: project.bid });
      res.data.forEach((item: any) => {
        item.key = item.id.toString();
      });
      treeRef?.current?.getTreeList();
      treeRef.current.setselectedKeys(data?.spaceId);
      return res;
    } else {
      return {};
    }
  };
  const setDetailData = async () => {
    if (open) {
      setTitle('新增布控配置');
      formRef.current?.resetFields();
      if (id) {
        setTitle('修改布控配置');
        const res = await getMonitoringTaskDetail({ id: data.id });
        formRef.current?.setFieldsValue({
          name: res.data.name,
          faceGroupId: res.data.faceGroupId,
        });

        setSltIds(res.data.deviceList.map((item) => item.deviceId));
      }
    } else {
      setSltIds([]);
    }
  };

  // 所有设备
  const allDeviceRes = useRequest(
    () => {
      setDetailData();
      return getDeviceList();
    },
    {
      refreshDeps: [open],
    },
  );

  const allDeviceList: any = allDeviceRes.data || [];
  // 待选列表
  const unSltList = useMemo(() => {
    if (spaceId) {
      treeRef.current.setselectedKeys(spaceId);
      return allDeviceList?.filter((item: any) => item.spaceId === spaceId);
    } else {
      return allDeviceList;
    }
  }, [spaceId, allDeviceList]);

  const onSelectChange = async (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSltIds([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  // 已选列表
  const sltList = useMemo(() => {
    return allDeviceList.filter((item: any) => sltIds.some((i) => item.id === i));
  }, [sltIds, allDeviceList]);

  // 保存
  const onFinish = async (formData: any) => {
    if (sltList.length === 0) {
      message.warn('请选择布控设备');
      return false;
    }
    const params: Record<string, any> = {
      projectBid: project.bid,
      name: formData.name,
      faceGroupId: formData.faceGroupId,
      deviceList: sltList.map((item: any) => ({ deviceName: item.name, deviceId: item.id })),
    };
    let res: any = {};
    if (id) {
      params.id = id;
      res = await updateMonitoringTask(params);
    } else {
      res = await addMonitoringTask(params);
    }
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      onSubmit();
      return true;
    }
    return false;
  };
  // 选中空间
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setSpaceId((info.node as any).id);
  };

  // 空间树加载完成
  const treeLoadComplate: any = (treeData: any) => {
    setSpaceId(treeData[0]?.id);
  };

  // 关闭设备
  const onClose = (item: any) => {
    setSltIds(sltIds.filter((j) => j !== item.id));
  };

  return (
    <ModalForm
      {...rest}
      labelCol={{ flex: '80px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={1000}
      modalProps={{
        centered: true,
      }}
      colon={false}
      title={title}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        label="布控配置"
        width="md"
        placeholder="请输入布控配置"
        rules={[{ required: true }]}
        fieldProps={{ maxLength: 20, showCount: true }}
      />
      <ProFormSelect
        name="faceGroupId"
        label="人员分组"
        width="md"
        request={queryGroupList}
        placeholder="请选择"
        rules={[{ required: true }]}
      />
      <ProCard
        bordered
        // title={
        //   <>
        //     <span style={{ color: 'red', fontSize: '14px', paddingRight: '5px' }}>*</span>
        //     <span>布控设备</span>
        //   </>
        // }
        className={styles.cusCard}
        split="horizontal"
      >
        <ProCard
          title={
            <>
              <span style={{ color: 'red', fontSize: '14px', paddingRight: '5px' }}>*</span>
              <span>布控设备</span>
            </>
          }
          bodyStyle={{ minHeight: '200px', padding: '16px' }}
          className={styles.myTagWarp}
          split="vertical"
        >
          {sltList.map((item: any) => (
            <Tag key={item.id} closable onClose={() => onClose(item)} className={styles.myTag}>
              {item.name}
            </Tag>
          ))}
        </ProCard>
        <ProCard split="vertical">
          <ProCard bodyStyle={{ height: '350px', overflowY: 'scroll' }} title="空间选择">
            <SpaceTree
              projectBid={project.bid || ''}
              cardProps={{ bodyStyle: { padding: '0' } }}
              onSelectChange={onSelect}
              ref={treeRef}
              mode="monitoring"
              treeLoadComplate={treeLoadComplate}
            />
          </ProCard>
          <ProCard title="设备选择">
            <Transfer
              className={styles.customTransfer}
              listStyle={{ width: '100%', height: '300px' }}
              dataSource={unSltList}
              showSearch
              selectedKeys={sltIds}
              onSelectChange={onSelectChange}
              render={(item) => item.name}
            />
          </ProCard>
        </ProCard>
      </ProCard>
    </ModalForm>
  );
};

export default Add;
