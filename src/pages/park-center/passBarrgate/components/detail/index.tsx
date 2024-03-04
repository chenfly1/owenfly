import { alitaParkingLicense } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { getOpenGateDetail, getReleaseRecordDetail } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { DrawerForm, ProFormItem, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Col, Image, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Detail: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange, data }) => {
  const [title, setTitle] = useState<string>();
  const [enterUrl, setEnterUrl] = useState<string>('');
  const [exiterUrl, setExiterUrl] = useState<string>('');
  const formRef = useRef<ProFormInstance>();
  const id = data?.id;
  const [isShow, setIsShow] = useState(false);

  const passageModeEnum = {
    0: '未知',
    1: '自动放行',
    2: '确认放行',
    3: '异常放行',
    4: '遥控开闸',
    5: '自助开闸',
    6: '可疑跟车',
    7: '盘点进场',
    8: '离线自动放行',
    9: '离线遥控放行',
    98: '盘点离场',
    99: '虚拟放行',
    // 离场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
  };

  const getImageSrc = async (objectId: string) => {
    const res = await generateGetUrl({
      bussinessId: alitaParkingLicense.id,
      urlList: [
        {
          objectId: objectId,
        },
      ],
    });
    return res?.data?.urlList[0]?.presignedUrl?.url;
  };

  const queryDetail = async () => {
    const isAbl = data?.type === 'abnormal';
    const res = isAbl ? await getReleaseRecordDetail({ id }) : await getOpenGateDetail({ id });
    const row = res.data;
    if (row?.enterImageUrl) {
      const src = await getImageSrc(row?.enterImageUrl);
      setEnterUrl(src);
    }
    if (row?.exitImageUrl) {
      const src = await getImageSrc(row?.exitImageUrl);
      setExiterUrl(src);
    }
    formRef?.current?.setFieldsValue({
      ...row,
    });
  };

  useEffect(() => {
    if (open) {
      setTitle('查看详情');
      setIsShow(data?.type === 'abnormal');
      formRef?.current?.resetFields();
      queryDetail();
    }
  }, [open]);

  const getImage = (type: string) => {
    if (enterUrl) {
      return (
        <Image
          src={type === 'eneter' ? enterUrl : exiterUrl}
          style={{ width: '200px', height: '200px' }}
        />
      );
    } else {
      return '-';
    }
  };

  return (
    <>
      <DrawerForm
        colon={false}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={isShow ? 1000 : 500}
        title={title}
        formRef={formRef}
        open={open}
        submitter={false}
        readonly={true}
      >
        <Row>
          <Col span={isShow ? 12 : 24}>
            <h3 className={styles.tikTitle}>
              <div />
              通行记录
            </h3>
            <ProFormText label="车牌号" name="plate" />
            <ProFormText label="车场名称" name="parkName" />
            <ProFormText label="入场通道" name="enterPassage" />
            <ProFormText label="入场时间" name="entryTime" />
            <ProFormText label="出场通道" name="exitPassage" />
            <ProFormText label="出场时间" name="exitTime" />
            <ProFormSelect
              label="放行类型"
              name="releaseType"
              request={async () => {
                return Object.entries(passageModeEnum).map((item) => {
                  return {
                    label: item[1],
                    value: item[0],
                  };
                });
              }}
            />
            <ProFormText label="放行原因" name="reason" />
            <ProFormItem name="enterImageUrl" label="入场图片">
              {getImage('enter')}
            </ProFormItem>
            <ProFormItem name="exitImageUrl" label="出场图片">
              {getImage('exiter')}
            </ProFormItem>
          </Col>
          <Col span={12}>
            {isShow && (
              <>
                <h3 className={styles.tikTitle}>
                  <div />
                  交易记录
                </h3>
                <ProFormText label="订单编号" name="orderCode" />
                <ProFormSelect
                  label="订单状态"
                  name="orderStatus"
                  options={[
                    {
                      label: '正常',
                      value: '01',
                    },
                    {
                      label: '有欠费',
                      value: '02',
                    },
                    {
                      label: '已补缴',
                      value: '03',
                    },
                    {
                      label: '已撤销',
                      value: '04',
                    },
                  ]}
                />
                <ProFormText label="应收金额" name="totalAmount" />
                <ProFormText label="实收金额" name="paidAmount" />
                <ProFormText label="优惠金额" name="discountAmount" />
              </>
            )}
          </Col>
        </Row>
      </DrawerForm>
    </>
  );
};

export default Detail;
