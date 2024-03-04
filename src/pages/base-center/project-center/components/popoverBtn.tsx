import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Button, Popover, Form, Row, Col, Input, Modal, message } from 'antd';
import { delProjectStage, modifyProjectStage } from '@/services/mda';

const { confirm } = Modal;

type StageType = {
  name: string;
  open: boolean;
  id?: number;
  bid?: string;
  projectBid?: string;
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

  const delStage = (index: number, row: StageType) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      content: <p>删除数据不可恢复，确定是否操作</p>,
      okText: '删除',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        if (row.id) {
          const res = await delProjectStage(row?.id);
          if (res.code === 'SUCCESS') {
            stageList.splice(index, 1);
            handleStage([...stageList]);
          }
        } else {
          stageList.splice(index, 1);
          handleStage([...stageList]);
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const addStageFinish = (row: Record<string, any>): any => {
    if (stageList.some((i) => i.name === row.name)) {
      return message.warning('分期已存在~');
    }
    handleStage([...stageList, { name: row.name, open: false }]);
  };

  const editStageFinish = (row: Record<string, any>, item: StageType): any => {
    if (stageList.some((i) => i.name === row.name)) {
      return message.warning('分期已存在~');
    }
    if (item.id) {
      modifyProjectStage(item?.id, { ...item, ...row }).then((res) => {
        if (res.code === 'SUCCESS') {
          item.name = row.name;
          handleStage([...stageList]);
        }
      });
    } else {
      item.name = row.name;
      handleStage([...stageList]);
    }
  };

  return (
    <>
      {stageList.map((item, index) => (
        <div key={index} style={{ marginRight: '10px', display: 'inline-block' }}>
          <Popover
            content={
              <Form
                name="advanced_search"
                initialValues={item}
                onFinish={(row) => editStageFinish(row, item)}
              >
                <Row>
                  <Col span={24}>
                    <Form.Item name="name" rules={[{ required: true, message: '请输入分期' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Button
                      size="small"
                      onClick={() => delStage(index, item)}
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
