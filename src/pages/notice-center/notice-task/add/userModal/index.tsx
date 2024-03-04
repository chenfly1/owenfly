import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import { Tag, Transfer, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import styles from './index.less';
import { useRequest, useModel } from 'umi';
import type { TreeProps } from 'antd/es/tree';
import { listDevices, saveShowToAppDevice } from '@/services/monitor';
import OrgTree from '@/components/OrgTree';
import { userQueryByPage } from '@/services/auth';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: (params: any) => void;
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
  const [orgId, setOrgId] = useState<string>();
  const [sltIds, setSltIds] = useState<string[]>([]);
  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  const treeRef = useRef<any>();
  const [allUserList, setAllUserList] = useState<Record<string, any>>([]);

  // 获取用户列表
  const getUserList = async () => {
    if (open) {
      const params = {
        pageSize: 1000,
        pageNo: 1,
        state: 'NORMAL',
        orgBid: orgId ? orgId : orgBidList.join(','),
      };
      const res = await userQueryByPage({ params });
      if (!orgId) {
        setAllUserList(res.data?.items || []);
      }
      return {
        data: res.data?.items || [],
      };
    } else {
      return {
        data: [],
      };
    }
  };

  const userRes = useRequest(
    () => {
      return getUserList();
    },
    {
      refreshDeps: [open, orgId],
    },
  );

  const unSltList: any = userRes.data || [];

  // 勾选
  const onSelectChange = async (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSltIds([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const sltList = useMemo(() => {
    return allUserList.filter((item: any) => sltIds.some((bid) => item.bid === bid));
  }, [sltIds, allUserList]);

  // 组织树选择
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setOrgId((info.node as any).bid);
  };

  // 关闭
  const onClose = (item: any) => {
    setSltIds(sltIds.filter((j) => j !== item.bid));
  };

  // 保存
  const onFinish = async (formData: any) => {
    onSubmit(sltList);
    return true;
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
      title={'项目运营用户'}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      <ProCard bordered split="horizontal">
        <ProCard split="vertical">
          <ProCard title="组织" bodyStyle={{ height: '350px', overflowY: 'scroll' }}>
            <OrgTree ref={treeRef} onSelect={onSelect} />
          </ProCard>
          <ProCard title="待选用户">
            <Transfer
              className={styles.customTransfer}
              listStyle={{ width: '100%', height: '300px' }}
              dataSource={unSltList}
              showSearch
              selectedKeys={sltIds}
              rowKey={(item) => item.bid as any}
              onSelectChange={onSelectChange}
              render={(item) => item.name}
            />
          </ProCard>
        </ProCard>
        <ProCard
          title="已选用户"
          bodyStyle={{ minHeight: '200px', padding: '16px' }}
          className={styles.myTagWarp}
          split="vertical"
        >
          {sltList.map((item: any) => (
            <Tag key={item.bid} closable onClose={() => onClose(item)} className={styles.myTag}>
              {item.name}
            </Tag>
          ))}
        </ProCard>
      </ProCard>
    </ModalForm>
  );
};

export default Add;
