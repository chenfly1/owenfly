import type { ActionType, ProFormInstance } from '@ant-design/pro-components';
import {
  ProTable,
  ProFormDigit,
  ProFormTextArea,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Col, Row, Space, message } from 'antd';
import { useEffect, useRef } from 'react';
import { ltRefund, orderRecordsRefund, yzRefund } from '@/services/park';
import style from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
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
  const actionRef = useRef<ActionType>();

  const onFinish = async (form: any) => {
    const params = {
      payOrderId: data?.id,
      orderType: data?.orderType === 'lt' ? '1' : '2',
      amount: form.amount * 100,
      remark: form.remark,
    };
    const res = await orderRecordsRefund(params);
    if (res.code === 'SUCCESS') {
      message.success('退款成功');
      return true;
    }
    return false;
  };

  const columns = [
    {
      title: '收费科目',
      dataIndex: 'bizType',
      width: 100,
      ellipsis: true,
    },
    {
      title: '支付完成时间',
      dataIndex: 'payTime',
      width: 120,
      ellipsis: true,
    },
    {
      title: '支付渠道',
      dataIndex: 'payChannel',
      width: 150,
      ellipsis: true,
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 100,
      ellipsis: true,
    },
    {
      title: '开票状态',
      dataIndex: 'invoiceStatus',
      width: 100,
      ellipsis: true,
    },
    {
      title: '实收金额(元)',
      dataIndex: 'paidAmount',
      width: 100,
      ellipsis: true,
    },
    {
      title: '已退金额(元)',
      dataIndex: 'refundAmount',
      width: 100,
      ellipsis: true,
    },
    {
      title: '最大可退金额(元)',
      dataIndex: 'maxRefundAmount',
      width: 100,
      ellipsis: true,
    },
  ];

  const queryList = async (params: any) => {
    const res =
      data?.orderType === 'lt'
        ? await ltRefund({ id: data?.id })
        : await yzRefund({ id: data?.id });
    const tempData: any = {
      ...res.data,
      totalAmount: Number(res.data?.totalAmount / 100).toFixed(2),
      paidAmount: Number(res.data?.paidAmount / 100).toFixed(2),
      discountAmount: Number(res.data?.discountAmount / 100).toFixed(2),
      packagePrice: Number(res.data?.packagePrice / 100).toFixed(2),
      refundAmount: Number(res.data?.refundAmount / 100).toFixed(2),
      maxRefundAmount: Number(res.data?.maxRefundAmount / 100).toFixed(2),
    };
    formRef.current?.setFieldsValue(tempData);
    return {
      data: [tempData],
      success: res.code === 'SUCCESS' ? true : false,
      total: 1,
    };
  };

  useEffect(() => {
    if (open) {
      formRef.current?.resetFields();
      actionRef?.current?.reload();
    }
  }, [open]);

  return (
    <ModalForm
      colon={false}
      {...rest}
      labelCol={{ flex: '100px' }}
      modalProps={{
        centered: true,
      }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={'80%'}
      title={'退款'}
      formRef={formRef}
      open={open}
      submitter={{
        render: (props) => (
          <Space>
            <Button
              onClick={() => {
                onOpenChange(false);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                props.form?.submit?.();
              }}
            >
              确认
            </Button>
          </Space>
        ),
      }}
      onFinish={onFinish}
      className={style.cusCard}
    >
      <h3 style={{ fontWeight: 'bold' }}>
        <div className={style.titleBlock} />
        <div>订单信息</div>
      </h3>

      <Row>
        <Col span={8}>
          <ProFormText readonly name="plate" label="车牌号" />
        </Col>
        {data?.orderType === 'lt' && (
          <>
            <Col span={8}>
              <ProFormText readonly name="inTime" label="入场时间" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="outTime" label="出场时间" />
            </Col>
          </>
        )}
        {data?.orderType === 'yz' && (
          <>
            <Col span={8}>
              <ProFormText readonly name="packageName" label="套餐名称" />
            </Col>
            <Col span={8}>
              <ProFormDigit readonly name="packagePrice" label="套餐单价" addonAfter="元" />
            </Col>
            <Col span={8}>
              <ProFormText readonly name="packageTotal" label="数量" />
            </Col>
          </>
        )}

        <Col span={8}>
          <ProFormDigit readonly name="totalAmount" label="应收金额" addonAfter="元" />
        </Col>
        <Col span={8}>
          <ProFormDigit readonly name="paidAmount" label="实收金额" addonAfter="元" />
        </Col>
        <Col span={8}>
          <ProFormDigit readonly name="discountAmount" label="优惠金额" addonAfter="元" />
        </Col>
      </Row>
      <h3 style={{ fontWeight: 'bold' }}>
        <div className={style.titleBlock} />
        <div>交易记录</div>
      </h3>
      <ProTable<OrderRecordsltType>
        style={{ marginBlockEnd: '20px' }}
        columns={columns}
        formRef={formRef}
        actionRef={actionRef}
        ghost={true}
        form={{
          colon: false,
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
        }}
        tableAlertRender={false}
        request={queryList}
        rowKey="areaNum"
        search={false}
        options={false}
        pagination={false}
        dateFormatter="string"
        rowSelection={{
          type: 'radio',
        }}
      />
      <ProFormDigit
        name="amount"
        label="退款金额"
        width={300}
        addonAfter="元"
        rules={[
          {
            required: true,
          },
        ]}
      />
      <ProFormTextArea
        width={600}
        name="remark"
        label="退款说明"
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          maxLength: 100,
          showCount: true,
          rows: 4,
        }}
      />
    </ModalForm>
  );
};

export default Add;
