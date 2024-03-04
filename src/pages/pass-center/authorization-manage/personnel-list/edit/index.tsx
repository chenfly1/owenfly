// import { DrawerForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPassingAreaDetails, queryDeviceConfig, addPassingUser } from '@/services/door';
import BaseMessage from '../add/baseMessage';
import PassAuth from '../add/passAuth';
import dayjs from 'dayjs';
import DrawerForm from '@/components/DrawerFormCount';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [detailsData, setDetailsData] = useState<DoorUserListType>();
  const [deviceConfig, setDeviceConfig] = useState<{ cardSectionStart: number; cardPwd: string }>();
  const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);

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
        dateRange: [res.data.authStart, res.data.authEnd],
        periodId: (res.data as any).periodIds ? (res.data as any).periodIds.split(',') : [],
        buildingNumDataObj,
        passingAreaIds: userPassingAreaLinks.map((i) => i.passingAreaId),
      });
    }
  };

  // 是员工客户
  const isClient = useMemo(() => {
    return ['01', '02'].includes(detailsData?.type as any);
  }, [detailsData]);

  useEffect(() => {
    if (modalVisit) {
      formRef?.current?.resetFields();
      queryDeviceConfig().then((res) => {
        setDeviceConfig(res.data);
      });
      getDetails(data?.id);
    } else {
      onSubmit();
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    try {
      // 员工、客户禁止编辑通行区域
      let disabledIds: any[] = [];
      if (detailsData?.userPassingAreaLinks) {
        disabledIds = detailsData?.userPassingAreaLinks
          .filter((i: any) => i.isAutoSync === 1)
          .map((i: any) => i.passingAreaId);
      }
      values.userPassingAreaLinks = values.passingAreaIds.map((i: any) => {
        return {
          passingAreaId: i,
          isAutoSync: disabledIds.includes(i) ? 1 : 0, // 是否自动同步标识 1是，0否 默认0
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
        onSubmit();
        onOpenChange(false);
      } else {
      }
    } catch {
      // console.log
    }
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title="编辑信息"
      width={480}
      layout="horizontal"
      labelCol={{
        flex: '80px',
      }}
      drawerProps={{
        bodyStyle: { overflowY: 'scroll', padding: '24px 12px 24px 24px' },
      }}
      open={modalVisit}
      onFinish={onFinish}
      // submitter={{
      //   render: (_, dom) => {
      //     return <Space>{dom}</Space>;
      //   },
      // }}
    >
      <BaseMessage
        detailsData={detailsData}
        form={formRef}
        isClient={isClient}
        getDetails={getDetails}
      />
      <PassAuth
        detailsData={detailsData}
        form={formRef}
        formRef={formRef as any}
        deviceConfig={deviceConfig as any}
        getDetails={getDetails}
      />
    </DrawerForm>
  );
};

export default AddModelForm;
