import { Button, Modal, message, Image } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { queryUserByPage } from '@/services/door';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import DataMasking from '@/components/DataMasking';
import { passageRecord } from '@/services/park';
import OssImage from '@/components/OssImage';
import { alitaParkingLicense } from '@/components/FileUpload/business';
import moment from 'moment';

type Props = {
  onOk: (data: any) => void;
  onClose?: () => void;
};

export default forwardRef(({ onClose = () => {}, onOk: onOkF }: Props, ref) => {
  const actionRef = useRef<ActionType>();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [show, setShow] = useState<boolean>(false);

  const open = () => {
    setShow(true);

    setTimeout(() => {
      setSelectedRowKeys([]);
      setSelectedRow([]);
    });
  };

  const close = () => {
    setShow(false);
    onClose();
  };

  useImperativeHandle(ref, () => {
    return {
      open,
      close,
    };
  });

  const onOk = (data: any) => {
    onOkF(data);
    close();
  };

  const handleRowSelectionChange = (selectedRowKey: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKey);
    setSelectedRow(selectedRows);
  };

  const onSelected = () => {
    if (!selectedRow.length) {
      return message.error('请勾选数据');
    }
    onOk(selectedRow[0]);
    onClose();
  };

  const queryList = async (params: any) => {
    params.pageNo = params.current;
    const res = await passageRecord(params);
    return {
      data: res.data?.items.map((item, index) => ({ ...item, key: index })) || [],
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const columns: ProColumns<PassageRecordType>[] = [
    {
      title: '车牌号码',
      dataIndex: 'plateNumber',
      order: 3,
    },
    {
      title: '进出时间',
      dataIndex: 'gmtBind',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
      search: {
        transform: (value) => {
          return {
            exitStartTime: moment(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            exitEndTime: moment(value[1])
              .add(1, 'day')
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
          };
        },
      },
    },
    {
      title: '车场进出场编号',
      dataIndex: 'parkRecordId',
      search: false,
    },
    {
      title: '入场通道',
      dataIndex: 'entryPassageName',
      search: false,
    },
    {
      title: '进场时间',
      dataIndex: 'entryTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '进场图片',
      dataIndex: 'entryImage',
      search: false,
      render: (_, record: any) => {
        const objectId = record.entryImage;
        console.log('objectId', objectId);
        return objectId ? (
          <OssImage
            style={{ width: '40px', height: '40px' }}
            objectId={objectId}
            business={alitaParkingLicense.id}
          />
        ) : (
          '-'
        );
      },
    },
    {
      title: '离场通道',
      dataIndex: 'exitPassageName',
      search: false,
    },
    {
      title: '出场时间',
      dataIndex: 'exitTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '出场图片',
      dataIndex: 'exitImage',
      search: false,
      render: (_, record: any) => {
        const objectId = record.exitImage;
        console.log('objectId', objectId);
        return objectId ? (
          <OssImage
            style={{ width: '40px', height: '40px' }}
            objectId={objectId}
            business={alitaParkingLicense.id}
          />
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <Modal
      title="请选择一项记录"
      open={show}
      width={'70%'}
      centered
      onCancel={close}
      footer={[
        <Button key="confirm" type="primary" onClick={onSelected}>
          确定
        </Button>,
      ]}
    >
      <ProTable
        actionRef={actionRef}
        columns={columns}
        search={{
          labelWidth: 80,
        }}
        scroll={{ y: 400 }}
        form={{
          colon: false,
        }}
        rowKey="key"
        request={queryList}
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: handleRowSelectionChange,
        }}
        options={false}
        dateFormatter="string"
        pagination={{
          onChange: (page, pageSize) => {
            setSelectedRowKeys([]);
            setSelectedRow([]);
          },
        }}
        onRow={(row) => {
          return {
            onDoubleClick: () => {
              onOk(row);
            },
          };
        }}
      />
    </Modal>
  );
});
