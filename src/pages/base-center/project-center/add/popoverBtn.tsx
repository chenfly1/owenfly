import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Button, Popover, Form, Row, Col, Input } from 'antd';

type StageType = {
  name: string;
  open: boolean;
};

type IProps = {
  handleStage: (list: StageType[]) => void;
  stageList: StageType[];
};

const PopoverBtn: React.FC<IProps> = (props) => {
  const { handleStage, stageList } = props;
  const [open, setOpen] = useState(false);

  const hide = () => {
    setOpen(false);
  };

  const cancelHide = (item: StageType) => {
    item.open = !item.open;
    handleStage([...stageList]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleOpenListChange = (newOpen: boolean, item: StageType) => {
    item.open = newOpen;
    handleStage([...stageList]);
  };

  const delStage = (index: number) => {
    stageList.splice(index, 1);
    handleStage([...stageList]);
  };

  const addStageFinish = (row: Record<string, any>) => {
    handleStage([...stageList, { name: row.name, open: false }]);
  };

  return (
    <>
      {stageList.map((item, index) => (
        <div key={index} style={{ marginRight: '10px', display: 'inline-block' }}>
          <Popover
            content={
              <Form name="advanced_search" initialValues={item} onFinish={addStageFinish}>
                <Row>
                  <Col span={24}>
                    <Form.Item name="name" rules={[{ required: true, message: '请输入分期' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Button
                      size="small"
                      danger
                      ghost
                      onClick={() => delStage(index)}
                      style={{ marginRight: '10px' }}
                    >
                      删除
                    </Button>
                    <Button
                      size="small"
                      onClick={() => cancelHide(item)}
                      style={{ marginRight: '10px' }}
                    >
                      取消
                    </Button>
                    <Button type="primary" size="small" htmlType="submit">
                      确定
                    </Button>
                  </Col>
                </Row>
              </Form>
            }
            title="编辑分期"
            trigger="click"
            open={item.open}
            onOpenChange={(i) => handleOpenListChange(i, item)}
          >
            <Button key="button" type="primary" ghost>
              {item.name}
            </Button>
          </Popover>
        </div>
      ))}
      <Popover
        content={
          <Form name="advanced_search" onFinish={addStageFinish}>
            <Row>
              <Col span={24}>
                <Form.Item name="name" rules={[{ required: true, message: '请输入分期' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button size="small" onClick={() => hide()} style={{ marginRight: '10px' }}>
                  取消
                </Button>
                <Button type="primary" size="small" htmlType="submit">
                  确定
                </Button>
              </Col>
            </Row>
          </Form>
        }
        title="新建分期"
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <Button key="button" type="primary" icon={<PlusOutlined />} ghost>
          分期
        </Button>
      </Popover>
    </>
  );
};

export default PopoverBtn;
