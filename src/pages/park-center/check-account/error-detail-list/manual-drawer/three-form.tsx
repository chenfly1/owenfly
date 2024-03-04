import FileUpload from '@/components/FileUpload';
import { deviceBusiness, publicMaterialLib } from '@/components/FileUpload/business';
import { Method } from '@/utils';
import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Col, Row, Upload, message } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import BaseForm from './base-form';
import ThreeModal from './three-modal';
import { billErrReview } from '@/services/park';

type Props = {
  onClose?: () => void;
  onOk: () => void;
};

export default forwardRef(({ onClose = () => {}, onOk }: Props, ref) => {
  const formRef = useRef<ProFormInstance>();
  const threeModalRef = useRef<any>();
  const [objectId, setObjectId] = useState<string>();
  const [detailShow, setDetailShow] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>({});
  const [modalData, setModalData] = useState<any>({});

  const open = (data: any) => {
    setDetailShow(true);
    setRowData(data);

    setTimeout(() => {
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue(data);
      setObjectId('');
    });
  };

  const close = () => {
    setDetailShow(false);
    onClose();
  };

  useImperativeHandle(ref, () => {
    return {
      open,
      close,
    };
  });

  return (
    <DrawerForm
      title="人工核销"
      labelCol={{ flex: '110px' }}
      onOpenChange={(visible: boolean) => {
        if (!visible) {
          close();
        }
      }}
      formRef={formRef}
      layout="horizontal"
      width={550}
      labelAlign="left"
      open={detailShow}
      onFinish={async (values) => {
        const res = await billErrReview({
          id: rowData.id,
          recoveryFlag: 1,
          thirdOrder: {
            thirdOrderNo: rowData.thirdOrderId,
            oldThirdTotalAmount: rowData.thirdTotalAmount * 100,
          },
          passageEntryRecord: {
            entryRecordId: modalData.parkRecordId,
            exitRecordId: modalData.exitParkRecordId,
            plate: values.plateNumber,
            entryTime: values.datetimeRange[0],
            exitTime: values.datetimeRange[1],
            totalAmount: values.totalAmount * 100,
            discountAmount: values.discountAmount * 100,
            paidAmount: values.paidAmount * 100,
            payType: values.payType,
            payChannel: values.payChannle,
          },
          orderType: rowData.orderType || 'lt',
          remark: values.remark,
          voucherUrl: objectId,
        });
        if (res.code === 'ILLEGAL_ARGUMENT') return false;
        message.success('核销成功');
        onOk();
        return true;
      }}
      submitter={{
        searchConfig: { submitText: '核销' },
        resetButtonProps: { style: { display: 'none' } },
      }}
    >
      <BaseForm />
      <div style={{ marginBottom: '24px', backgroundColor: '#D8D8D8', height: '1px' }} />
      <div>
        <Row justify="space-between">
          <Col>
            <h3 style={{ fontWeight: 'bold', marginBottom: '24px' }}>车场订单查询</h3>
          </Col>
          <Col>
            <Button
              type="default"
              onClick={() => {
                threeModalRef.current.open();
              }}
            >
              查询
            </Button>
          </Col>
        </Row>
        <ProFormText name="plateNumber" label="车牌号码" rules={[{ required: true }]} />
        <ProFormDateTimeRangePicker
          name="datetimeRange"
          label="进出时间"
          rules={[{ required: true }]}
        />
      </div>
      <div style={{ marginBottom: '24px', backgroundColor: '#D8D8D8', height: '1px' }} />
      <ProFormRadio.Group
        name="payType"
        label="支付方式"
        initialValue={'1'}
        options={[
          {
            label: '现金支付',
            value: '1',
          },
          {
            label: '线上支付',
            value: '2',
          },
        ]}
      />
      <ProFormDependency name={['payType']}>
        {({ payType }) => {
          return (
            payType === '2' && (
              <ProFormSelect
                rules={[{ required: true }]}
                name="payChannle"
                label="支付渠道"
                allowClear={false}
                initialValue={'2'}
                options={[{ label: '微信', value: '2' }]}
              />
            )
          );
        }}
      </ProFormDependency>
      <ProFormDigit
        name="totalAmount"
        label="应收金额"
        fieldProps={{ addonAfter: '元' }}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="paidAmount"
        label="实收金额"
        fieldProps={{ addonAfter: '元' }}
        rules={[{ required: true }]}
      />
      <ProFormDigit
        name="discountAmount"
        label="优惠金额"
        fieldProps={{ addonAfter: '元' }}
        rules={[{ required: true }]}
      />
      <ProFormTextArea name="remark" label="核销原因" rules={[{ required: true }]} />
      <ProFormItem
        name="labels"
        label="核销凭证"
        valuePropName="fileList"
        extra="仅支持png，jpeg，jpg格式，20M以内"
        rules={[{ required: true, message: '请上传核销凭证' }]}
        getValueFromEvent={(e: any) => {
          const file = e.file;
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng && file.status === 'uploading') {
            message.error('仅支持jpg，jpeg，png格式的图片');
          }
          const isLt10M = file.size && file.size / 1024 / 1024 < 20;
          if (!isLt10M && file.status === 'uploading') {
            message.error('图片不能超过20M,请重新选择图片');
          }
          if (isJpgOrPng && isJpgOrPng) {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }
        }}
      >
        <FileUpload
          buttonText="上传图片"
          fileType="image"
          listType="picture-card"
          beforeUpload={async (file: any) => {
            // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
            const isFormat =
              file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
            // 校验图片大小
            const is20M = file.size / 1024 / 1024 < 20;
            if (!isFormat) {
              message.error('仅支持jpg，jpeg，png格式的图片');
              return Upload.LIST_IGNORE;
            } else if (!is20M) {
              message.error('图片不能超过5M,请重新选择图片');
              return Upload.LIST_IGNORE;
            }
            return isFormat && is20M;
          }}
          customRequest={async (options: any) => {
            const { onSuccess, file } = options;
            Method.uploadFile(file, deviceBusiness).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setObjectId(url);
              onSuccess(_response, file);
            });
          }}
          onRemove={() => {
            setObjectId('');
          }}
          business={publicMaterialLib}
        />
      </ProFormItem>
      <ThreeModal
        ref={threeModalRef}
        onOk={(value) => {
          setModalData(value);
          formRef.current?.setFieldsValue({
            plateNumber: value.plateNumber,
            datetimeRange: [value.entryTime, value.exitTime],
          });
        }}
      />
    </DrawerForm>
  );
});
