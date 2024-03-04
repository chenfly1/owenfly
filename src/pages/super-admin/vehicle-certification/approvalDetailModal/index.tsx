import type { ProFormInstance, FormListActionType } from '@ant-design/pro-components';
import { ProCard, ProFormList } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import { Button, Card, Collapse, Image, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';
import { queryApprovingDetail, vehicleAttestateApprove } from '@/services/park';
import { generateGetUrl } from '@/services/file';
import { alitaParkingLicense } from '@/components/FileUpload/business';
const { Panel } = Collapse;

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
  const [title, setTitle] = useState<string>('');
  const [vehicleLicenseUrl, setVehicleLicenseUrl] = useState<string>();
  const [identityCardUrl, setIdentityCardUrl] = useState<string>();
  const [maxLength, setMaxLength] = useState<number>(20);
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  const getUrlByObjectId = async (objectId: string, bussiness: Record<string, any>) => {
    const urlRes = await generateGetUrl({
      bussinessId: bussiness.id,
      urlList: [
        {
          objectId: objectId as string,
        },
      ],
    });
    return urlRes?.data?.urlList[0]?.presignedUrl?.url;
  };

  const queryDetail = async () => {
    const res = await queryApprovingDetail({ id: data?.recordId });
    if (res.code === 'SUCCESS') {
      const resData = res.data;
      if (resData.vehicleLicenseUrl) {
        const vehicleLicenseUrlTem = await getUrlByObjectId(
          resData.vehicleLicenseUrl,
          alitaParkingLicense,
        );
        setVehicleLicenseUrl(vehicleLicenseUrlTem);
      }
      if (resData.identityCardUrl) {
        const identityCardUrlTem = await getUrlByObjectId(
          resData.identityCardUrl,
          alitaParkingLicense,
        );
        setIdentityCardUrl(identityCardUrlTem);
      }

      setMaxLength(resData.authRecords.length);
      if (resData.authRecords.length > 0) {
        for (let i = 0; i < resData.authRecords.length; i++) {
          const row = resData.authRecords[i];
          if (row.vehicleLicenseUrl) {
            row.vehicleLicenseUrlTem = await getUrlByObjectId(
              row.vehicleLicenseUrl,
              alitaParkingLicense,
            );
          }
        }
      }
      formRef.current?.setFieldsValue({
        ...resData,
      });
    }
  };
  const onFinish = async (flag: boolean) => {
    const res = await vehicleAttestateApprove({
      id: data?.recordId,
      handle: flag ? 'pass' : 'refuse', // pass:通过 refuse:不通过
      remark: '',
    });
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      onSubmit();
    }
  };

  useEffect(() => {
    if (open) {
      setTitle(data?.plate);
      queryDetail();
    }
  }, [open]);

  return (
    <DrawerForm
      colon={false}
      {...rest}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      className={styles.drawerModal}
      width={620}
      readonly
      title={title}
      formRef={formRef}
      submitter={{
        render: () => (
          <Space>
            <Button
              onClick={() => {
                onFinish(false);
              }}
            >
              不通过
            </Button>
            <Button
              type="primary"
              onClick={() => {
                onFinish(true);
              }}
            >
              通过
            </Button>
          </Space>
        ),
      }}
      open={open}
    >
      <Card bodyStyle={{ padding: '10px' }}>
        <h3>行驶证信息</h3>
        <ProFormItem label="证件" colon={false} name="vehicleLicenseUrl">
          {vehicleLicenseUrl && <Image width={100} src={vehicleLicenseUrl} />}
          {!vehicleLicenseUrl && '-'}
        </ProFormItem>
        <ProFormText colon={false} name="vehicleOwner" label="所有人" />
        <ProFormText colon={false} name="vinCode" label="车架号" />
      </Card>
      <Card bodyStyle={{ padding: '10px' }}>
        <h3>身份证信息</h3>
        <ProFormText label="证件" colon={false} name="identityCardUrl">
          {identityCardUrl && <Image width={100} src={identityCardUrl} />}
          {!identityCardUrl && '-'}
        </ProFormText>
        <ProFormText name="idName" colon={false} label="姓名" />
        <ProFormText name="idNumber" colon={false} label="身份证号" />
      </Card>
      <Card bodyStyle={{ padding: '10px' }}>
        <h3>申诉信息</h3>
        <ProFormText colon={false} name="mobile" label="手机号码" />
        <ProFormText colon={false} name="gmtCreated" label="申诉时间" />
      </Card>
      <Collapse expandIconPosition="end" defaultActiveKey={['0']} ghost>
        <Panel header="历史认证信息" key="1">
          <ProFormList
            actionRef={actionRef}
            name="authRecords"
            deleteIconProps={false}
            creatorButtonProps={false}
            min={1}
            max={maxLength}
            copyIconProps={false}
            itemRender={({ listDom, action }, { index }) => (
              <ProCard
                bordered
                style={{ marginBlockEnd: 8 }}
                title={maxLength > 1 ? `历史${index + 1}` : false}
                extra={action}
                bodyStyle={{ paddingBlockEnd: 0 }}
              >
                {listDom}
              </ProCard>
            )}
          >
            {(f, index, action) => {
              return (
                <>
                  <ProFormText
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="plate"
                    label="车牌号码"
                  />
                  <ProFormItem
                    label="证件"
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="vehicleLicenseUrl"
                  >
                    {action.getCurrentRowData().vehicleLicenseUrlTem && (
                      <Image width={100} src={action.getCurrentRowData().vehicleLicenseUrlTem} />
                    )}
                    {!action.getCurrentRowData().vehicleLicenseUrlTem && '-'}
                  </ProFormItem>
                  <ProFormText
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="vehicleOwner"
                    label="所有人"
                  />
                  <ProFormText
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="vinCode"
                    label="车架号"
                  />
                  <ProFormText
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="mobile"
                    label="认证手机号码"
                  />
                  <ProFormText
                    colon={false}
                    labelCol={{ flex: '100px' }}
                    name="gmtCreated"
                    label="认证时间"
                  />
                </>
              );
            }}
          </ProFormList>
        </Panel>
      </Collapse>
    </DrawerForm>
  );
};

export default Add;
