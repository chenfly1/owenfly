import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Col, Modal, Row, message } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import style from './style.less';
import { electricColumns, propertyColumns, waterColumns } from '../columns';
import {
  billListElectric,
  billListManage,
  billListOfflinePay,
  billListWater,
  tradeAccountDetail,
  tradeAccountList,
} from '@/services/payment';

export default () => {
  const formRef = useRef<ProFormInstance>();
  const query = history.location.query as any;
  const [accountList, setAccountList] = useState<Record<string, any>[]>([]);
  const [accountValue, setAccountValue] = useState<string>();
  const [tableRow, setTableRow] = useState<Record<string, any>>({});

  let columns: any;
  if (query.type === '0') {
    columns = waterColumns;
  } else if (query.type === '1') {
    columns = electricColumns;
  } else if (query.type === '2') {
    columns = propertyColumns;
  }

  const queryList = async (params: any) => {
    let queryFn: any;
    if (query.type === '0') {
      queryFn = billListWater;
    } else if (query.type === '1') {
      queryFn = billListElectric;
    } else if (query.type === '2') {
      queryFn = billListManage;
    }
    params.pageNo = 1;
    params.pageSize = 10000;
    if (typeof query.codes === 'string') {
      params.codes = [query.codes];
    } else {
      params.codes = query.codes;
    }
    const res = await queryFn(params);
    setTableRow(res.data?.items[0] || {});
    return {
      data: (res.data?.items || []).map((item: any) => ({
        ...item,
        price: item.price ? Number(item.price / 100).toFixed(2) : '',
        waterFee: item.waterFee ? Number(item.waterFee / 100).toFixed(2) : '',
        indoorFee: item.indoorFee ? Number(item.indoorFee / 100).toFixed(2) : '',
        publicFee: item.publicFee ? Number(item.publicFee / 100).toFixed(2) : '',
        waterAmount: item.waterAmount ? Number(item.waterAmount / 100).toFixed(2) : '',
        indoorAmount: item.indoorAmount ? Number(item.indoorAmount / 100).toFixed(2) : '',
        publicAmount: item.publicAmount ? Number(item.publicAmount / 100).toFixed(2) : '',

        electricFee: item.electricFee ? Number(item.electricFee / 100).toFixed(2) : '',
        electricAmount: item.electricAmount ? Number(item.electricAmount / 100).toFixed(2) : '',

        manageFee: item.manageFee ? Number(item.manageFee / 100).toFixed(2) : '',
        manageAmount: item.manageAmount ? Number(item.manageAmount / 100).toFixed(2) : '',

        totalAmountTax: item.totalAmountTax ? Number(item.totalAmountTax / 100).toFixed(2) : '',
        totalAmount: item.totalAmount ? Number(item.totalAmount / 100).toFixed(2) : '',
        taxAmount: item.taxAmount ? Number(item.taxAmount / 100).toFixed(2) : '',
        paidAmount: item.paidAmount ? Number(item.paidAmount / 100).toFixed(2) : '',
        refundAmount: item.refundAmount ? Number(item.refundAmount / 100).toFixed(2) : '',
        paidOffAmount: item.paidOffAmount ? Number(item.paidOffAmount / 100).toFixed(2) : '',
      })),
      success: res.code === 'SUCCESS' ? true : false,
      total: res.data?.page?.totalItems,
    };
  };

  const onFinish = async (formData: any) => {
    const params = {
      ...formData,
      amount: formData.amount * 100,
      accountId: formData.accountId === 'geren' ? null : formData.accountId,
      codes: query.codes,
    };
    const res = await billListOfflinePay(params);
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      history.push({
        pathname: '/living-payment/bill/receivable',
      });
    }
  };

  return (
    <PageContainer header={{ title: '线下收款信息确认', onBack: () => history.goBack() }}>
      <div style={{ padding: '24px' }} className={style.cusCard}>
        <ProForm
          colon={false}
          labelCol={{ flex: '130px' }}
          layout="horizontal"
          formRef={formRef}
          submitter={{
            render: (props, dom) => {
              return <FooterToolbar>{dom}</FooterToolbar>;
            },
          }}
          onFinish={onFinish}
        >
          <h3 style={{ fontWeight: 'bold', marginTop: '0' }}>
            <div className={style.titleBlock} />
            <div>收款信息</div>
          </h3>
          <Row>
            <Col span={8}>
              <ProFormText
                name="payee"
                rules={[
                  {
                    required: true,
                  },
                ]}
                label="收款人"
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="handed"
                label="制单人"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="payingUser"
                label="缴费用户"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </Col>

            <Col span={8}>
              <ProFormRadio.Group
                rules={[
                  {
                    required: true,
                  },
                ]}
                options={[
                  {
                    label: '微信',
                    value: '1',
                  },
                  {
                    label: '支付宝',
                    value: '2',
                  },
                  {
                    label: '刷卡',
                    value: '3',
                  },
                  {
                    label: '现金',
                    value: '4',
                  },
                ]}
                name="paymentType"
                label="收款方式"
              />
            </Col>
            <Col span={8}>
              <ProFormRadio.Group
                rules={[
                  {
                    required: true,
                  },
                ]}
                name="accountId"
                label="入账方"
                request={async () => {
                  const res = await tradeAccountList({ pageSize: 100, pageNo: 1, state: 0 });
                  setAccountList(res.data.items);
                  return [
                    ...res.data.items.map((item: any) => ({
                      label: item.accountName,
                      value: item.accountBid,
                    })),
                    {
                      label: '个人',
                      value: 'geren',
                    },
                  ];
                }}
                fieldProps={{
                  value: accountValue,
                  onChange: async (e: any) => {
                    const value = e.target.value;
                    setAccountValue('');
                    if (value === 'geren') {
                      setAccountValue(value);
                    } else {
                      const accountTem: any = accountList.find((item) => item.accountBid === value);
                      const res = await tradeAccountDetail({ id: accountTem.accountBid });
                      const { categoryList } = res.data;
                      const flag = categoryList.some(
                        (item: any) => item.name === tableRow.typeName,
                      );
                      if (!flag) {
                        Modal.confirm({
                          title: '收费商户确认',
                          content: `该商户未配置${tableRow.typeName}收费项，是否确认选择?`,
                          onOk: () => {
                            setAccountValue(value);
                          },
                        });
                      } else {
                        setAccountValue(value);
                      }
                    }
                  },
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormDependency name={['accountId']}>
                {({ accountId }) => {
                  if (accountId === 'geren') {
                    return (
                      <ProFormText
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                        name="personal"
                        label="个人账户"
                      />
                    );
                  } else {
                    return null;
                  }
                }}
              </ProFormDependency>
            </Col>
            <Col span={8}>
              <ProFormDigit
                rules={[
                  {
                    required: true,
                  },
                ]}
                fieldProps={{
                  controls: false,
                }}
                addonAfter="元"
                name="amount"
                label="收款金额"
              />
            </Col>
          </Row>
          <h3 style={{ fontWeight: 'bold' }}>
            <div className={style.titleBlock} />
            <div>已选账单明细</div>
          </h3>
          <ProTable<OrderRecordsltType>
            style={{ marginBlockEnd: '20px' }}
            columns={columns}
            formRef={formRef}
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
            // rowSelection={{
            //   type: 'radio',
            // }}
          />
        </ProForm>
      </div>
    </PageContainer>
  );
};
