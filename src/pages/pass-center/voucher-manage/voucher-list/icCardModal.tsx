import { Button, Select, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import {
  getPassingAreaByUser,
  queryICDownResultCound,
  queryICDownResultPage,
  reSendICBatchDown,
} from '@/services/door';
import styles from './style.less';
import Modal from '@/components/ModalCount';

type IProps = {
  modalVisit: boolean;
  data: DoorUserListType;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

const FaceModel: React.FC<IProps> = ({ modalVisit, data, onSubmit, onOpenChange }) => {
  const actionRef = useRef<ActionType>();
  const [value, setValue] = useState<string>('');
  const [status, setStatus] = useState<number>();
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [resultRow, setResultRow] = useState<Record<string, any>>({});
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const columns: ProColumns<DoorUserListType>[] = [
    {
      title: '下发设备',
      dataIndex: 'deviceName',
      ellipsis: true,
    },
    {
      title: '下发结果',
      dataIndex: 'authStatus',
      valueType: 'select',
      ellipsis: true,
      valueEnum: {
        6: {
          text: '拉入黑名单中',
        },
        7: {
          text: '拉入黑名单成功',
        },
        8: {
          text: '拉入黑名单失败',
        },
        9: {
          text: '拉出黑名单中',
        },
        10: {
          text: '拉出黑名单成功',
        },
        11: {
          text: '拉出黑名单失败',
        },
      },
    },
    {
      title: '失败原因',
      dataIndex: 'msg',
      hideInTable: status === 11,
      ellipsis: true,
      render(dom, row) {
        return [6, 7, 9, 10].includes(row?.authStatus as any) ? <>-</> : dom;
      },
    },
    {
      title: '下发时间',
      dataIndex: 'gmtUpdated',
      sorter: true,
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'creator',
      ellipsis: true,
    },
  ];

  const handleChange = (val: string) => {
    console.log(`selected ${val}`);
    setValue(val);
  };

  const getByPage = async (params: Record<string, any>, sorter: Record<string, any>) => {
    params.pageNo = params.current;
    params.userId = data?.id;
    params.passingAreaId = value;
    params.sortBy = 'gmt_updated';
    params.sort = sorter?.gmtUpdated === 'ascend' ? 0 : 1;
    setLoadingTable(true);
    const res = await queryICDownResultPage(params);
    setLoadingTable(false);
    return {
      data: res.data?.items || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const getOptions = async () => {
    const res = await getPassingAreaByUser(data?.id as string);
    const arr = (res.data && res.data.map((item) => ({ value: item.id, label: item.name }))) || [];
    setOptions([{ value: '', label: '全部通行区域' }, ...arr]);
  };

  const getResultCount = async () => {
    const res = await queryICDownResultCound({ userId: data?.id, passingAreaId: value });
    setResultRow(res.data || {});
  };

  useEffect(() => {
    if (modalVisit) {
      getOptions();
      getResultCount();
      setStatus((data as any)?.icStatus);
      actionRef.current?.reload();
    } else {
      setValue('');
    }
  }, [modalVisit]);

  useEffect(() => {
    if (modalVisit) {
      getResultCount();
      actionRef.current?.reload();
    }
  }, [value]);

  // 批量重新IC卡黑名单
  const reSendFace = async () => {
    const res = await reSendICBatchDown([{ userId: data?.id }]);
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      actionRef.current?.reload();
    }
  };

  return (
    <Modal
      title="IC卡下发结果"
      width="60%"
      open={modalVisit}
      onCancel={() => {
        onOpenChange(false);
        onSubmit();
      }}
      className={styles.modalTable}
      centered
      footer={
        ['0', '11', '12'].includes(status as any)
          ? [
              <Button
                key="confirm"
                type="primary"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                确定
              </Button>,
            ]
          : [
              <Button
                key="back"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                确定
              </Button>,
              <Button
                key="reSend"
                type="primary"
                onClick={() => {
                  reSendFace();
                }}
              >
                失败重新下发
              </Button>,
            ]
      }
    >
      <ProTable<DoorUserListType>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        loading={loadingTable}
        search={false}
        cardBordered
        form={{
          colon: false,
        }}
        scroll={{ y: 400 }}
        request={getByPage}
        headerTitle={
          <Select
            style={{ width: 240 }}
            allowClear={false}
            placeholder="请选择通行区域"
            value={value}
            bordered={false}
            onChange={handleChange}
            options={options}
          />
        }
        toolbar={{
          multipleLine: true,
          filter: (
            <div className={styles.resultBox}>
              <div className={styles.resultItem}>设备总数：{resultRow?.total}</div>
              <div className={styles.resultItem}>挂失中：{resultRow?.loseIng}</div>
              <div>
                挂失成功：<span className={styles.SucText}>{resultRow?.loseSuc}</span>
              </div>
              <div>
                挂失失败：<span className={styles.errorText}>{resultRow?.loseFail}</span>
              </div>
              <div className={styles.resultItem}>解挂中：{resultRow?.loseCancelIng}</div>
              <div>
                解挂成功：<span className={styles.SucText}>{resultRow?.loseCancelSuc}</span>
              </div>
              <div>
                解挂失败：<span className={styles.errorText}>{resultRow?.loseCancelFail}</span>
              </div>
            </div>
          ),
        }}
        dateFormatter="string"
      />
    </Modal>
  );
};

export default FaceModel;
