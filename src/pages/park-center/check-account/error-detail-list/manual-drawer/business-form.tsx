import FileUpload from '@/components/FileUpload';
import { alitaParkingLicense, publicMaterialLib } from '@/components/FileUpload/business';
import { Method } from '@/utils';
import {
  DrawerForm,
  ProFormDependency,
  ProFormField,
  ProFormInstance,
  ProFormItem,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Upload, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import BaseForm from './base-form';
import { billErrReview, getThirdOrder } from '@/services/park';
import styles from './index.less';

type Props = {
  onClose?: () => void;
  onOk: () => void;
};

export default forwardRef(({ onClose = () => {}, onOk }: Props, ref) => {
  const formRef = useRef<ProFormInstance>();
  const [objectId, setObjectId] = useState<string>();
  const [detailShow, setDetailShow] = useState<boolean>(false);
  const [currentType, setCurrentType] = useState('');
  const [isGetThirdOrder, setIsGetThirdOrder] = useState<boolean>(true);
  const [rowData, setRowData] = useState<any>({});
  const [isAmountErr, setIsAmountErr] = useState<boolean>(false);

  const open = (data: any) => {
    setDetailShow(true);
    setRowData(data);
    setIsGetThirdOrder(true);
    setIsAmountErr(false);

    setTimeout(() => {
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue(data);
      setObjectId('');
      setCurrentType('');
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
          recoveryFlag: values.switchX ? 1 : 0,
          thirdOrder: {
            thirdOrderNo: values.thirdOrderIdX,
            oldThirdTotalAmount: values.amountX * 100,
            thirdPayChannel: values.payChannelNameX,
            thirdPayType: values.payTypeNameX,
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
      submitter={
        currentType
          ? {
              searchConfig: { submitText: '核销' },
              resetButtonProps: { style: { display: 'none' } },
            }
          : false
      }
    >
      <BaseForm data={{ isAmountErr }} />
      <div style={{ marginBottom: '24px', backgroundColor: '#D8D8D8', height: '1px' }} />
      <ProFormText
        name="thirdOrderIdX"
        label="三方交易订单号"
        disabled={currentType === 'switchX'}
        validateStatus={isGetThirdOrder ? 'success' : 'error'}
        help={isGetThirdOrder ? '' : '未查询到订单记录'}
        addonAfter={
          <Button
            disabled={currentType === 'switchX'}
            onClick={async () => {
              try {
                const res = await getThirdOrder({
                  id: formRef.current?.getFieldValue('thirdOrderIdX'),
                });
                if (res.code === 'ILLEGAL_ARGUMENT') {
                  formRef.current?.setFieldsValue({
                    isGet: false,
                  });
                  setIsGetThirdOrder(false);
                  return;
                }
                setCurrentType('thirdOrderIdX');
                formRef.current?.setFieldsValue({
                  isGet: true,
                  amountX: res.data.amount / 100,
                  payChannelNameX: res.data.payChannelName,
                  payTypeNameX: res.data.payTypeName,
                });
                setIsAmountErr(
                  formRef.current?.getFieldValue('amountX') &&
                    formRef.current?.getFieldValue('amountX') !==
                      formRef.current?.getFieldValue('payAmount')
                    ? true
                    : false,
                );
                setIsGetThirdOrder(true);
              } catch {
                formRef.current?.setFieldsValue({
                  isGet: false,
                });
                setIsGetThirdOrder(false);
              }
            }}
          >
            查询
          </Button>
        }
      />
      <ProFormDependency name={['isGet']}>
        {({ isGet }) =>
          isGet && (
            <>
              {/* <ProFormText name="amountX" label="三方交易金额" readonly addonAfter="元" /> */}
              <div className={isAmountErr ? styles.inputTextRed : ''}>
                <ProFormText name="amountX" label="三方交易金额" readonly addonAfter="元" />
              </div>
              <ProFormText name="payChannelNameX" label="支付渠道" readonly />
              <ProFormText name="payTypeNameX" label="支付方式" readonly />
            </>
          )
        }
      </ProFormDependency>
      <div style={{ marginBottom: '24px', backgroundColor: '#D8D8D8', height: '1px' }} />
      <ProFormSwitch
        name="switchX"
        label="对订单进行冲正"
        disabled={currentType === 'thirdOrderIdX'}
        fieldProps={{
          onChange: (value) => {
            if (value) {
              setCurrentType('switchX');
            } else {
              setCurrentType('');
            }
          },
        }}
      />
      <ProFormDependency name={['switchX']}>
        {({ switchX }) =>
          switchX && (
            <>
              <ProFormTextArea name="remark" label="核销原因" rules={[{ required: true }]} />
              <ProFormItem
                rules={[{ required: true, message: '请上传核销凭证' }]}
                name="labels"
                label="核销凭证"
                valuePropName="fileList"
                extra="仅支持png，jpeg，jpg格式，20M以内"
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
                      file.type === 'image/png' ||
                      file.type === 'image/jpg' ||
                      file.type === 'image/jpeg';
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
                    Method.uploadFile(file, alitaParkingLicense).then((url: any) => {
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
            </>
          )
        }
      </ProFormDependency>
    </DrawerForm>
  );
});
