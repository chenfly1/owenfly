import { parkAreaTree, serviceDetail } from '@/services/park';
import { ModalForm } from '@ant-design/pro-components';
import { Card, Tree } from 'antd';
import { useMemo, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Detail: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange, data, ...rest }) => {
  const [treeData, setTreeData] = useState<Record<string, any>[]>();
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const getDetail = async () => {
    const res = await serviceDetail(data?.id);
    const tree = await parkAreaTree(res.data.parkId || '');
    const keys = res.data.passageIds || [];

    if (tree.code == 'SUCCESS') {
      setTreeData(tree.data);
      setSelectedKeys(keys);
      setLoading(false);
    }
  };

  useMemo(() => {
    if (open) {
      getDetail();
    }
  }, [open]);
  const cardSetting = {
    bordered: false,
    loading: loading,
  };

  return (
    <ModalForm
      {...rest}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={560}
      title={'准入区域'}
      submitter={{
        submitButtonProps: {
          style: {
            // 隐藏提交按钮
            display: 'none',
          },
        },
        searchConfig: {
          resetText: '关闭',
        },
      }}
      open={open}
    >
      <Card {...cardSetting}>
        <Tree
          disabled={true}
          treeData={treeData}
          checkedKeys={selectedKeys}
          fieldNames={{
            title: 'name',
            key: 'id',
            children: 'child',
          }}
          checkable
          defaultExpandAll
          showLine
        />
      </Card>
    </ModalForm>
  );
};

export default Detail;
