import { StepsForm, type ProFormInstance } from '@ant-design/pro-components';
import { Button, Drawer, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import BaseMessage from './baseMessage';
import { getPassingAreaDetails, queryDeviceConfig, addPassingUser } from '@/services/door';
import PassAuth from './passAuth';
import styles from './style.less';
import dayjs from 'dayjs';
import { useModel } from 'umi';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const baseRef = useRef<any>();
  const [current, setCurrent] = useState<number>(0);
  const [detailsData, setDetailsData] = useState<DoorUserListType>();
  const [deviceConfig, setDeviceConfig] = useState<{ cardSectionStart: number; cardPwd: string }>();
  const formRef = useRef<ProFormInstance>();
  const fromPassRef = useRef<ProFormInstance>();

  const time = 20;
  let timer: any = null;
  const [count, setCount] = useState<number>(time);
  const { initialState } = useModel('@@initialState');
  const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);
  const [countShow] = useState<boolean>(
    initialState?.currentUser?.userName === '公安三所认证租户管理员',
  );

  useEffect(() => {
    if (!countShow) return undefined;
    if (count === 0) {
      onOpenChange(false);
    }
    if (modalVisit) {
      timer = setInterval(() => {
        setCount(count - 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setCount(time);
    }
    // 监听鼠标事件
    document.onmousemove = () => {
      setCount(20);
    };
    // 监听键盘事件
    document.onkeydown = () => {
      setCount(20);
    };
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [count, modalVisit]);

  const getDetails = async (id: string) => {
    const res = await getPassingAreaDetails(id);
    if (res.code === 'SUCCESS') {
      setDetailsData(res.data);
      const userPassingAreaLinks = res.data.userPassingAreaLinks || [];
      const buildingNumDataObj = {};
      if (res.data.buildingNums)
        res.data.buildingNums.map((i: any) => {
          buildingNumDataObj[i.deviceId] =
            i.floorNumber && i.floorNumber.split(',').map((j: any) => j);
        });
      formRef?.current?.setFieldsValue({
        ...res.data,
        icCardClass: res.data?.icCard?.cardClass,
        idCardClass: res.data?.idCard?.cardClass,
        periodId: (res.data as any).periodIds ? (res.data as any).periodIds.split(',') : [],
        dateRange: [res.data.authStart, res.data.authEnd],
        buildingNumDataObj,
        passingAreaIds: userPassingAreaLinks.map((i) => i.passingAreaId),
      });
    }
  };

  const onClose = () => {
    onSubmit();
    onOpenChange(false);
  };

  const baseOnFinish = async (values: Record<string, any>) => {
    console.log(values);
    try {
      values.userPassingAreaLinks = values.passingAreaIds.map((i: any) => {
        return {
          passingAreaId: i,
          isAutoSync: 0, // 是否自动同步标识 1是，0否 默认0
        };
      });
      const buildingNumDataObj = values.buildingNumDataObj;
      if (buildingNumDataObj) {
        const keys = Object.keys(buildingNumDataObj);
        values.buildingNums = keys.map((key) => {
          if (buildingNumDataObj[key] && buildingNumDataObj[key].length) {
            return {
              deviceId: key,
              floorNumber: buildingNumDataObj[key].map((floorNumber: any) => floorNumber).join(','),
            };
          }
        });
      } else {
        values.buildingNums = [];
      }
      if (values.periodId && values.periodId.length) {
        // 汉王认证
        const obj = periodList?.value?.filter((i: any) => i.id === values.periodId[0]);
        values.authStart = obj && obj[0]?.validDateStart;
        values.authEnd = obj && obj[0]?.validDateEnd;
      } else {
        values.authStart = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        values.authEnd = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }
      const res = await addPassingUser({
        ...detailsData,
        ...values,
        periodIds: values?.periodId?.join(','),
      });
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        getDetails(res.data);
        setCurrent(1);
        return true;
      } else {
        return false;
      }
    } catch {
      // console.log
    }
  };

  const onFinish = async (values: Record<string, any>) => {
    try {
      console.log(values);
      const res = await addPassingUser({ ...detailsData, ...values });
      if (res.code === 'SUCCESS') {
        message.success('操作成功');
        onSubmit();
        onClose();
      }
    } catch {
      // console.log
    }
  };

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      setCurrent(0);
      setDetailsData({} as any);
      queryDeviceConfig().then((res) => {
        setDeviceConfig(res.data);
      });
    }
  }, [modalVisit]);

  return (
    <StepsForm
      onFinish={onFinish}
      current={current}
      formProps={{
        layout: 'horizontal',
        colon: false,
      }}
      containerStyle={{ minWidth: '332px' }}
      formRef={formRef}
      stepsProps={{
        progressDot: true,
      }}
      submitter={{
        render: (prop: any) => {
          console.log(prop);
          if (prop.step === 0) {
            return (
              <Space>
                <Button onClick={() => onOpenChange(false)}>
                  {countShow ? '取消 ' + count + 'S' : '取消'}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    prop.onSubmit?.();
                  }}
                >
                  下一步
                </Button>
              </Space>
            );
          }

          if (prop.step === 1) {
            return (
              <Space>
                <Button
                  key="pre"
                  onClick={() => {
                    baseRef?.current.update();
                    setCurrent(0);
                    prop.onPre?.();
                  }}
                >
                  {countShow ? '上一步 ' + count + 'S' : '上一步'}
                </Button>
                <Button
                  type="primary"
                  key="submit"
                  onClick={() => {
                    prop.onSubmit?.();
                  }}
                >
                  确定
                </Button>
              </Space>
            );
          }
        },
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Drawer
            title="新增人员"
            footer={submitter}
            width={480}
            destroyOnClose
            className={styles.StepForm}
            bodyStyle={{ overflowY: 'scroll' }}
            footerStyle={{ textAlign: 'end' }}
            onClose={onClose}
            open={modalVisit}
          >
            {dom}
          </Drawer>
        );
      }}
    >
      <StepsForm.StepForm
        name="base"
        layout="horizontal"
        formRef={formRef}
        labelCol={{
          flex: '80px',
        }}
        title="授权信息填写"
        onFinish={baseOnFinish as any}
      >
        <BaseMessage
          detailsData={detailsData}
          form={formRef}
          key="base"
          ref={baseRef}
          getDetails={getDetails}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="pass"
        colon={false}
        layout="horizontal"
        key="pass"
        formRef={fromPassRef}
        labelCol={{
          flex: '80px',
        }}
        title="通行凭证录入"
      >
        <PassAuth
          detailsData={detailsData}
          form={formRef}
          formRef={fromPassRef}
          deviceConfig={deviceConfig as any}
          getDetails={getDetails}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default AddModelForm;
