import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import { Tag, Transfer, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import SpaceTree from '@/components/SpaceTree';
import { storageSy } from '@/utils/Setting';
import styles from './index.less';
import { useRequest } from 'umi';
import type { TreeProps } from 'antd/es/tree';
import { listDevices, saveShowToAppDevice } from '@/services/monitor';

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
  const [sltIds, setSltIds] = useState<string[]>([]);
  const treeRef = useRef<any>();

  // 保存
  const onFinish = async (formData: any) => {
    const res = await saveShowToAppDevice({
      deviceIds: sltIds,
      spaceId: spaceId,
    });
    if (res.code === 'SUCCESS') {
      message.success('保存成功');
      onSubmit();
      return true;
    }
    return false;
  };

  // 获取设备列表
  const getDeviceList = async () => {
    if (open) {
      const res = await listDevices({ projectId: project.bid });
      res.data.forEach((item: any) => {
        item.key = item.id.toString();
      });
      setSltIds(
        res.data
          .filter((item: any) => item.showToApp === 1 && item.spaceId === data?.spaceId)
          .map((innerItem: any) => innerItem.id),
      );
      setSpaceId(data?.spaceId);
      treeRef.current.setselectedKeys(data?.spaceId);
      return res;
    } else {
      return {};
    }
  };

  const allDeviceRes = useRequest(
    () => {
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
      return allDeviceList?.filter((item: any) => item.spaceId === spaceId);
    } else {
      return allDeviceList;
    }
  }, [spaceId, allDeviceList]);

  const onSelectChange = async (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSltIds([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const sltList = useMemo(() => {
    return allDeviceList.filter((item: any) => sltIds.some((id) => item.id === id));
  }, [sltIds, allDeviceList]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setSpaceId((info.node as any).id);
    setSltIds(
      allDeviceList
        .filter((item: any) => item.showToApp === 1 && item.spaceId === (info.node as any).id)
        .map((innerItem: any) => innerItem.id),
    );
  };

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
      title={'监控信息'}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <ProCard bordered split="horizontal">
        <ProCard split="vertical">
          <ProCard title="空间" bodyStyle={{ height: '350px', overflowY: 'scroll' }}>
            <SpaceTree
              projectBid={project.bid || ''}
              cardProps={{ bodyStyle: { padding: '0' } }}
              onSelectChange={onSelect}
              ref={treeRef}
              mode="monitoring"
            />
          </ProCard>
          <ProCard title="待选监控">
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
        <ProCard
          title="已选监控"
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
      </ProCard>
    </ModalForm>
  );
};

export default Add;
