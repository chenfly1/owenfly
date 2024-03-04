import { Modal, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { proectThirdBind } from '@/services/mda';
import styles from '../style.less';

type IProps = {
  open: boolean;
  data?: Record<string, any>;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};

const YardModal: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data }) => {
  const actionRef = useRef<ActionType>();
  const queryList = async (params: any) => {
    return {
      data: [
        {
          system: '智慧社区',
          projectName: `${data?.data?.name}(${data?.data?.bid})`,
          orgName: data?.data?.orgName,
          projectAdd: data?.data?.address,
        },
        {
          system: '碧桂园总线',
          projectName: `${data?.row?.commName}(${data?.row?.commId})`,
          orgName: data?.row?.commOrgName,
          projectAdd: data?.row?.commAddr,
        },
      ],
      success: true,
      total: 2,
    };
  };
  const columns: ProColumns<ProectThirdType>[] = [
    {
      title: '系统',
      dataIndex: 'system',
    },
    {
      title: '项目名及项目编号',
      dataIndex: 'projectName',
    },
    {
      title: '所属组织',
      dataIndex: 'orgName',
    },
    {
      title: '项目地址',
      dataIndex: 'projectAdd',
    },
  ];

  const onFinish = async () => {
    const params = {
      projectId: data?.data?.bid,
      resType: 'bgy',
      commId: data?.row?.commId,
    };
    const res = await proectThirdBind(params);
    if (res.code === 'SUCCESS') {
      message.success('绑定成功');
      onSubmit();
    }
  };

  useEffect(() => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);

  return (
    <Modal
      title="关联项目确认"
      open={open}
      width={'60%'}
      onCancel={() => {
        onOpenChange(false);
      }}
      centered
      onOk={() => {
        onFinish();
      }}
    >
      <div style={{ color: 'red', marginBottom: '10px' }}>
        确定将以下项目进行关联？确定后无法直接解绑
      </div>
      <ProTable<any>
        actionRef={actionRef}
        columns={columns}
        search={false}
        scroll={{ y: 400 }}
        className={styles.tableStyle}
        rowKey="plate"
        cardBordered
        form={{
          colon: false,
        }}
        pagination={false}
        request={queryList}
        options={false}
        tableAlertRender={false}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default YardModal;
