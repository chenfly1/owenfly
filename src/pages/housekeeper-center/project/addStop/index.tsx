import React, { useEffect, useState } from 'react';
import { Modal, Table, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { batchGolive } from '@/services/housekeeper';

interface Props {
  open: (open: boolean) => void;
  modalVisit: boolean;
  data: any;
  onSubmit: () => void; // 表单提交函数
}

const AddStop: React.FC<Props> = ({ open, modalVisit, data, onSubmit }) => {
  //提交
  const handleOk = () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定禁用吗？',
      centered: true,
      onOk: async () => {
        const newData = data.filter((item: { id: any }) => item.id);
        const idArrays = newData.map((item: any) => item.id);
        console.log('-----------', idArrays);
        const res = await batchGolive({
          ids: idArrays,
          status: 0,
        });
        if (res.code === 'SUCCESS') {
          message.success('禁用成功');
          open(false);
          onSubmit();
        }
      },
    });
  };

  useEffect(() => {}, []);

  //关闭
  const handleCancel = async () => {
    open(false);
  };

  const columns: ColumnsType<butlerPageType> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 100,
    },
    {
      title: '管家名称',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 100,
    },
  ];

  return (
    <Modal
      title="删除项目管家"
      open={modalVisit}
      onOk={handleOk}
      onCancel={handleCancel}
      width={994}
    >
      <div style={{ display: 'flex' }}>
        <div>
          <WarningFilled style={{ color: 'red', fontSize: '50px', marginRight: '20px' }} />
        </div>

        <div>
          <h3>
            <b>
              是否确认禁用以下
              <span style={{ color: 'red' }}>{JSON.stringify(data?.length)}个</span>
              项目的管家信息？
            </b>
          </h3>
          <p>禁用后以下信息将不再移动端展示，再次启用后才展示</p>
        </div>
      </div>
      <Table dataSource={data} columns={columns} pagination={{ pageSize: 10 }} size="small" />
    </Modal>
  );
};

export default AddStop;
