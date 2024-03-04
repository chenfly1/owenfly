import type { FormListActionType, ProFormInstance } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormMoney } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDateRangePicker } from '@ant-design/pro-components';
import { ProFormTreeSelect } from '@ant-design/pro-components';
import {
  StepsForm,
  ProFormDependency,
  ProFormList,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Input, message, Radio, Space, TreeSelect } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PackageUseEnum } from '../../data.d';
import type { Dayjs } from 'dayjs';
// import SourceTree from '@/pages/account-center/role-mamage/source-tree';
import dayjs from 'dayjs';
import ProCard from '@ant-design/pro-card';
import styles from './style.less';
import CarNoModal from './carNoModal';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import {
  placeQueryByPage,
  parkYardListByPage,
  parkAreaTree,
  serviceDetail,
  vehicleAuthCreate,
  vehicleAuthDetail,
  packageOptions,
  orderState,
} from '@/services/park';
import QRCode from 'qrcode.react';
import { DeleteOutlined } from '@ant-design/icons';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

let times: any;

const Add: React.FC<IProps & Record<string, any>> = () => {
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const [, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [carNoModalShow, setCarNoModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>();
  const [modalParkId, setModalParkId] = useState<string>('');
  const packageRes = useRef<Record<string, any>>();
  const [packageType, setPackageType] = useState<string>('');
  const [reqUrl, setReqUrl] = useState<string>('');
  const [lots, setLots] = useState<Record<string, any>>([]);
  const readonly = (history.location.query || {}).readonly === 'true' ? true : false;
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();
  const id = (history.location.query || {}).id || '';

  useEffect(() => {
    clearInterval(times);
    formRef?.current?.resetFields();
    setTitle('新增车辆授权');
    if (readonly) {
      setTitle('车辆授权查看');
      vehicleAuthDetail(id as string).then((res) => {
        const resData = res.data || {};
        formMapRef?.current?.forEach((formInstanceRef) => {
          formInstanceRef?.current?.setFieldsValue({
            ...resData,
          });
        });
      });
    }
  }, []);

  // 提交
  const onFinish = async (formData: any) => {
    const carportes = lots
      .filter((item: any) => (formData.carportes || []).includes(item.value))
      .map((item: any) => ({
        id: item.value,
        code: item.code,
        name: item.name,
      }));
    const params = {
      projectId: project.bid,
      carInfos: formData.plates.map((item: any) => ({
        ...item,
        carId: item.vehicleId,
        phone: item.mobile,
        userName: item.name,
      })),
      parkId: formData.parkId,
      carportes,
      startDate: formData?.dateRange[0] + ' 00:00:00',
      endDate: formData?.dateRange[1] + ' 23:59:59',
      packageId: formData.packageId,
      packageCount: formData.packageCount,
      fee: formData.feeYuan * 100,
      payTypeId: formData.payTypeId,
      payChannle: formData.payChannle,
    };
    setLoading(true);
    const res = await vehicleAuthCreate(params as any);
    if (res.code === 'SUCCESS') {
      setLoading(false);
      if (packageType === '2') {
        // 月租
        if (formData.payTypeId === '1') {
          // 现金支付
          message.success('提交成功');
          history.push('/park-center/carManage/authorization-manage');
        } else {
          message.success('提交成功，请扫码支付');
          setLoading(true);
          setReqUrl(res.data?.reqUrl);
          clearInterval(times);
          times = setInterval(async () => {
            const detailRes = await orderState(res.data?.orderId as string);
            if (detailRes.data === '02') {
              setLoading(false);
              message.success('支付成功');
              clearInterval(times);
              history.push('/park-center/carManage/authorization-manage');
            }
          }, 1000);
        }
      } else {
        message.success('提交成功');
        history.push('/park-center/carManage/authorization-manage');
      }
    }
  };

  // 车牌编码
  const onCarNoClick = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
    action: Record<string, any>,
  ) => {
    const parkIdTem = formMapRef?.current[0]?.current?.getFieldValue('parkId');
    setModalParkId(parkIdTem);
    setCarNoModalShow(true);
    setModalData(action);
  };

  // 车场编码回填
  const onDoubleClick = (row: any, action: any) => {
    const carList: Record<string, any>[] = formRef.current?.getFieldValue('plates');
    if (carList.some((item) => item.plate === row.plate)) {
      message.warning('该车牌已存在');
      return;
    }
    action.setCurrentRowData(row);
    setCarNoModalShow(false);
  };

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };
  // 车位下拉
  const queryLotList = async () => {
    const res = await placeQueryByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
      state: '1',
    });
    const temp = (res.data.items || []).map((item: any) => ({
      ...item,
      label: item.name,
      value: item.id,
    }));
    setLots(temp);
    return temp;
  };

  // 套餐数量变化
  const onPackageCountChange = (val: any, packageData?: any) => {
    const packageDatas: any = packageData ? packageData : packageRes.current;
    if (val) {
      const cycle = packageDatas.cycle ? packageDatas.cycle : 1;
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue({
          packageCount: val,
          dateRange: [dayjs().startOf('day'), dayjs().add(val * cycle, 'month')],
          feeYuan: (val * packageDatas?.price) / 100,
        });
      });
      setStartDate(dayjs().startOf('day').format('YYYY-MM-DD'));
      setEndDate(
        dayjs()
          .add(val * cycle, 'month')
          .format('YYYY-MM-DD'),
      );
    }
  };

  // 车辆套餐变化
  const onPackageChange = async (val: any) => {
    const res = await serviceDetail(val);
    const resData = res.data;
    packageRes.current = res.data || {};
    formMapRef?.current?.forEach((formInstanceRef) => {
      formInstanceRef?.current?.setFieldsValue({
        packageCycle: resData.cycle,
        selectingPassages: resData?.passageIds,
      });
    });
    onPackageCountChange(1, resData);
  };

  //
  const onPackageTypeChange = (val: string) => {
    formRef?.current?.resetFields(['packageId', 'selectingPassages']);
    setPackageType(val);
  };

  const disabledDate: any = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const nodes = useMemo(() => {
    if (packageType === '2') {
      return (
        <>
          <ProFormDigit
            labelCol={{ flex: '120px' }}
            colon={false}
            rules={[{ required: true, message: '套餐数量' }]}
            label="套餐数量"
            name="packageCount"
            min={1}
            max={360}
            fieldProps={{
              onChange: onPackageCountChange,
              controls: false,
            }}
          />
          <ProFormText
            labelCol={{ flex: '120px' }}
            rules={[{ required: true, message: '套餐周期' }]}
            disabled
            label="套餐周期"
            colon={false}
            name="packageCycle"
            readonly
            fieldProps={{
              suffix: '个月',
            }}
          />
          {/* <ProFormDateRangePicker
            colProps={{}}
            labelCol={{ flex: '120px' }}
            colon={false}
            rules={[{ required: true, message: '请选择授权日期' }]}
            label="授权期限日期"
            name="dateRange"
            width={'lg'}
            readonly
          /> */}
          <ProFormItem
            labelCol={{ flex: '120px' }}
            colon={false}
            rules={[{ required: true, message: '请选择授权日期' }]}
            label="授权期限日期"
            name="dateRange"
          >
            <span>{startDate}</span>
            <span> / </span>
            <span>{endDate}</span>
          </ProFormItem>
          <ProFormMoney
            labelCol={{ flex: '120px' }}
            readonly
            colon={false}
            name="feeYuan"
            label="待支付金额"
          />
          <ProForm.Item
            labelCol={{ flex: '120px' }}
            rules={[{ required: true, message: '请选择授权日期' }]}
            label="支付方式"
            colon={false}
            name="payTypeId"
          >
            <Radio.Group defaultValue="" buttonStyle="solid">
              <div className={styles.payRadio}>
                <Radio value="1">现金支付</Radio>
                <Radio value="2">扫码支付</Radio>
              </div>
              <Space />
            </Radio.Group>
          </ProForm.Item>
          <ProFormDependency name={['payTypeId']}>
            {({ payTypeId }) => {
              return (
                payTypeId === '2' && (
                  <ProFormSelect
                    rules={[{ required: true }]}
                    labelCol={{ flex: '120px' }}
                    name="payChannle"
                    label="支付渠道"
                    readonly={readonly}
                    allowClear={false}
                    initialValue={'2'}
                    options={[{ label: '微信', value: '2' }]}
                  />
                )
              );
            }}
          </ProFormDependency>
        </>
      );
    } else {
      return (
        <ProFormDateRangePicker
          colProps={{}}
          colon={false}
          labelCol={{ flex: '120px' }}
          rules={[{ required: true, message: '请选择授权日期' }]}
          label="授权期限日期"
          name="dateRange"
          width={'lg'}
          fieldProps={{ disabledDate }}
        />
      );
    }
  }, [packageType, startDate, endDate]);

  const reqUrlNode = useMemo(() => {
    return (
      reqUrl && (
        <QRCode
          id="qrCode"
          value={reqUrl}
          size={200} // 二维码的大小
          fgColor="#000000" // 二维码的颜色
          style={{ margin: '30px 120px' }}
          imageSettings={{
            // 二维码中间的logo图片
            src: 'logoUrl',
            height: 100,
            width: 100,
            excavate: true, // 中间图片所在的位置是否镂空
          }}
        />
      )
    );
  }, [reqUrl]);

  return (
    <PageContainer
      className={styles.myForm}
      header={{
        title: '授权管理新增',
        onBack: () => {
          clearInterval(times);
          history.goBack();
        },
      }}
    >
      <ProCard style={{ marginTop: '80px' }}>
        <StepsForm
          formRef={formRef}
          onFinish={onFinish}
          submitter={{
            render: (props, doms) => {
              if (props.step === 2) {
                return [
                  doms[0],
                  <Button {...doms[1].props} key="submit" loading={loading}>
                    提交
                  </Button>,
                ];
              } else {
                return doms;
              }
            },
          }}
          formMapRef={formMapRef}
        >
          <StepsForm.StepForm
            name="packageForm"
            title="选择车场与套餐"
            colon={false}
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            stepProps={{
              description: '选择本项目内的车场与项目',
            }}
          >
            <ProFormSelect
              rules={[{ required: true }]}
              // width={300}
              name="parkId"
              readonly={readonly}
              label="车场名称"
              allowClear={false}
              fieldProps={{
                showSearch: true,
                onChange: () => {
                  formRef?.current?.resetFields(['packageId', 'selectingPassages']);
                },
              }}
              request={queryParkList}
            />
            <ProFormSelect
              // width={300}
              rules={[{ required: true }]}
              name="packageType"
              readonly={readonly}
              allowClear
              label="套餐用途"
              fieldProps={{
                onChange: onPackageTypeChange,
              }}
              request={async () => {
                return Object.entries(PackageUseEnum).map((item) => {
                  return {
                    label: item[1].text,
                    value: item[0],
                  };
                });
              }}
            />
            <ProFormSelect
              name="carportes"
              label="车位编号"
              request={queryLotList}
              mode="multiple"
              readonly={readonly}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="packageId"
              label="车辆套餐"
              dependencies={['parkId', 'packageType']}
              fieldProps={{
                allowClear: false,
                showSearch: true,
                placeholder: '请选择',
                onChange: onPackageChange,
              }}
              readonly={readonly}
              request={async (values: { parkId: string; packageType: string }) => {
                if (values.parkId) {
                  const res = await packageOptions({ ...values, type: values.packageType });
                  return res.data.map((item: any) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  });
                } else {
                  return [];
                }
              }}
            />
            <ProFormTreeSelect
              name="selectingPassages"
              disabled
              label="准入范围"
              initialValue={[]}
              // width="md"
              rules={[
                {
                  required: true,
                },
              ]}
              dependencies={['parkId']}
              request={async ({ parkId }) => {
                if (!parkId) {
                  return [];
                }
                const res = await parkAreaTree(parkId);
                return res.data[0].child;
              }}
              fieldProps={{
                multiple: true,
                treeDefaultExpandAll: false,
                treeNodeFilterProp: 'text',
                fieldNames: {
                  label: 'name',
                  value: 'id',
                  children: 'child',
                },
                treeCheckable: true,
                showCheckedStrategy: TreeSelect.SHOW_PARENT,
                placeholder: '请选择',
              }}
            />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name="baseForm"
            title="选择车辆"
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            stepProps={{
              description: '选择本项目内车辆',
            }}
          >
            <ProFormList
              name="plates"
              actionRef={actionRef}
              creatorButtonProps={{
                creatorButtonText: '新增车牌',
              }}
              deleteIconProps={{
                Icon: (_) => {
                  return <DeleteOutlined {..._} style={{ color: 'red' }} />;
                },
              }}
              min={1}
              copyIconProps={false}
              itemRender={({ listDom, action }, { index }) => (
                <ProCard
                  bordered
                  style={{ marginBlockEnd: 8 }}
                  title={`车牌${index + 1}`}
                  extra={action}
                  bodyStyle={{ paddingBlockEnd: 0 }}
                >
                  {listDom}
                </ProCard>
              )}
              initialValue={[
                { plate: undefined, vehicleType: undefined, name: undefined, mobile: undefined },
              ]}
            >
              {(f, index, action) => {
                console.log(f, index, action);
                return (
                  <>
                    <ProForm.Item
                      colon={false}
                      name="plate"
                      label="车牌号码"
                      labelCol={{ flex: '96px' }}
                      rules={[{ required: true }]}
                    >
                      <Input
                        allowClear={true}
                        placeholder="请搜索车牌号码"
                        onClick={(e) => {
                          onCarNoClick(e, action);
                        }}
                        readOnly
                      />
                    </ProForm.Item>
                    <ProFormSelect
                      labelCol={{ flex: '96px' }}
                      colon={false}
                      name="vehicleType"
                      readonly={true}
                      label="车辆类型"
                      options={[
                        {
                          label: '小型车',
                          value: '1',
                        },
                        {
                          label: '大型车',
                          value: '2',
                        },
                      ]}
                    />
                    <ProFormText
                      labelCol={{ flex: '96px' }}
                      colon={false}
                      name="name"
                      label="车主姓名"
                      readonly={true}
                    />
                    <ProFormText
                      labelCol={{ flex: '96px' }}
                      colon={false}
                      name="mobile"
                      label="手机号码"
                      readonly={true}
                    />
                  </>
                );
              }}
            </ProFormList>
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name="dateForm"
            title="选择有效期"
            className={styles.stepMForm}
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            stepProps={{
              description: '选择该车辆的有效期',
            }}
          >
            {nodes}
            {reqUrlNode}
          </StepsForm.StepForm>
        </StepsForm>
        <CarNoModal
          parkId={modalParkId}
          open={carNoModalShow}
          onOpenChange={setCarNoModalShow}
          onDoubleClick={onDoubleClick}
          data={modalData}
        />
      </ProCard>
    </PageContainer>
  );
};

export default Add;
