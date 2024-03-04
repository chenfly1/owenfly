import { Button, Select, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import {
  getPassingAreaByUser,
  queryIDDownResultCound,
  queryIDDownResultPage,
  reSendIDBatchDown,
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
        0: {
          text: '新增ID中',
        },
        1: {
          text: '新增ID成功',
        },
        2: {
          text: '新增ID失败',
        },
        3: {
          text: '删除ID中',
        },
        4: {
          text: '删除ID成功',
        },
        5: {
          text: '删除ID失败',
        },
      },
    },
    {
      title: '失败原因',
      dataIndex: 'msg',
      hideInTable: status === 1,
      ellipsis: true,
      render(dom, row) {
        return [0, 1, 3, 4].includes(row?.authStatus as any) ? <>-</> : dom;
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
    const res = await queryIDDownResultPage(params);
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
    const res = await queryIDDownResultCound({ userId: data?.id, passingAreaId: value });
    setResultRow(res.data || {});
  };

  useEffect(() => {
    if (modalVisit) {
      getOptions();
      getResultCount();
      setStatus(data?.idCard && data?.idCard?.authStatus);
      actionRef.current?.reload();
    } else {
      setValue('');
    }
  }, [modalVisit]);

  useEffect(() => {
    if (modalVisit) {
      actionRef.current?.reload();
      getResultCount();
    }
  }, [value]);

  // 批量重新下发ID
  const reSendFace = async () => {
    const res = await reSendIDBatchDown([{ userId: data?.id }]);
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      actionRef.current?.reload();
    }
  };

  return (
    <Modal
      title="ID卡号下发结果"
      width="60%"
      open={modalVisit}
      onCancel={() => {
        onOpenChange(false);
        onSubmit();
      }}
      centered
      className={styles.modalTable}
      footer={
        status === 0 || status === 1
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
              <div className={styles.resultItem}>新增中：{resultRow?.addIng}</div>
              <div>
                新增成功：<span className={styles.SucText}>{resultRow?.addSuc}</span>
              </div>
              <div>
                新增失败：<span className={styles.errorText}>{resultRow?.addFail}</span>
              </div>
              <div className={styles.resultItem}>删除中：{resultRow?.delIng}</div>
              <div>
                删除成功：<span className={styles.SucText}>{resultRow?.delSuc}</span>
              </div>
              <div>
                删除失败：<span className={styles.errorText}>{resultRow?.delFail}</span>
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
