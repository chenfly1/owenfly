import React, { useState } from 'react';
import { Button, Input, Popover, Space, message } from 'antd';
import { addFaceGroup, updateFaceGroup } from '@/services/monitor';

type Iprops = Record<string, any> & {
  onSubmit: (name: string) => void;
  data?: Record<string, any>;
};

const App: React.FC<Iprops> = ({ onSubmit, data, ...rest }) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState<string>('');
  const projectBid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setGroupName('');
    if (newOpen === true) {
      setGroupName(data?.name);
    }
  };

  const onChange = (val: any) => {
    setGroupName(val.target.value);
  };

  const onFinish = async () => {
    let res: any;
    if (data?.id) {
      // 编辑
      const params = {
        id: data?.id,
        name: groupName,
        projectBid,
      };
      res = await updateFaceGroup(params);
    } else {
      // 新增
      const params = {
        name: groupName,
        projectBid,
      };
      res = await addFaceGroup(params);
    }

    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      setOpen(false);
      onSubmit(groupName);
    }
  };
  return (
    <Popover
      placement="bottom"
      content={
        <>
          <Input
            value={groupName}
            onChange={onChange}
            onPressEnter={onFinish}
            placeholder="请输入分组名称"
            maxLength={20}
            showCount={true}
          />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Space>
              <Button type="ghost" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="primary" onClick={onFinish}>
                确定
              </Button>
            </Space>
          </div>
        </>
      }
      title="添加分组"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Button type="primary" {...rest}>
        {rest.children}
      </Button>
    </Popover>
  );
};

export default App;
