import { Card, Col, Row, message } from 'antd';
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ProFormCascader, ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import styles from './style.less';
import { history } from 'umi';
import {
  getParkingPlaceDetails,
  getProjectDetails,
  getResourceEnum,
  modifyParkingPlace,
} from '@/services/mda';
import ProjectSelect from '@/components/ProjectSelect';
import { getPhysicalSpaceTree } from './service';

const fieldLabels = {
  code: '车位号',
  projectBid: '所属项目',
  parkingSpaceId: '车场空间id',
  stageBid: '项目分期',
  parking: '所属车场',
  floor: '所属楼层',
  parkingArea: '车场分区',
  placeArea: '车位面积（m²）',
  parkingType: '车位类型',
  parkingNumber: '泊车数量',
  propertyRight: '产权性质',
  useStatus: '使用状态',
  deliverStatus: '交付状态',
  state: '生效状态',
};

type StageType = {
  label: string;
  value: string;
};

interface DataItem {
  id: string;
  parentId: string | number;
  name: string;
  spaceType: string;
  children: DataItem[];
  disabled?: boolean;
}
//获取空间id
const transformData = (data: DataItem[]): DataItem[] => {
  return data.map((item) => {
    const { id, parentId, name, spaceType, children, ...rest } = item;

    const transformedItem = {
      id,
      parentId,
      name,
      spaceType,
      value: id,
      label: name,
      children: transformData(children),
      ...rest,
    } as DataItem;

    return transformedItem;
  });
};

// 递归树结构"ROOM"可选
const addDisabled = (data: any[], parentHasRoom: any) => {
  return data.map((item) => {
    const newItem = { ...item };

    if (item.children && item.children.length === 0 && !parentHasRoom) {
      newItem.disabled = true;
    }

    if (item.children && item.children.length > 0) {
      const childrenHasRoom = item.children.some(
        (child: { spaceType: string }) => child.spaceType === 'ROOM',
      );
      newItem.children = addDisabled(item.children, childrenHasRoom);

      if (newItem.children.length === 0 && !parentHasRoom) {
        newItem.disabled = true;
      }
    }

    return newItem;
  });
};

const StallEdit: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();
  // const [stageList, setStageList] = useState<StageType[]>();
  const [Option, setOption] = useState<DataItem[]>();

  // 获取分期数据
  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
    // getProjectDetails(project?.id).then((res) => {
    //   if (res.code === 'SUCCESS') {
    //     setStageList(res.data.projectStageVOList.map((i) => ({ label: i.name, value: i.bid })));
    //   }
    // });
    formRef?.current?.setFieldsValue({
      projectBid: project?.bid,
    });

    getPhysicalSpaceTree({
      projectBid: project?.bid,
      // 房产接口
      // filterSpaceTypes: ["PROJECT", "PROJECT_STAGE", "BUILDING", "UNIT", "FLOOR", "ROOM", "PUBLIC_AREA"]
      filterSpaceTypes: ['CARPARK', 'AREA', 'PASSAGE'],
    }).then((res) => {
      if (res.code === 'SUCCESS') {
        const { data } = res;
        console.log('data', data);
        const transformedData = transformData(data);
        const newData = addDisabled(transformedData, false);

        setOption(newData);
      }
    });
  }, []);

  const onFinish = async (values: Record<string, any>) => {
    // if (Array.isArray(values.parkingSpaceId) && values.parkingSpaceId.length > 0) {
    //   values.parkingSpaceId = values.parkingSpaceId[values.parkingSpaceId.length - 1];
    // }
    try {
      console.log(values);
      const res = await modifyParkingPlace((query as any).id, {
        id: (query as any).id,
        ...values,
      });
      if (res.code === 'SUCCESS') {
        message.success('提交成功');
        history.goBack();
      }
    } catch {
      // console.log
    }
  };

  const routes = [
    {
      path: '/base-center',
      breadcrumbName: '资源中心',
    },
    {
      path: '/base-center/parking-space',
      breadcrumbName: '产权管理',
    },
    {
      path: '/base-center/parking-space/stall/edit',
      breadcrumbName: '编辑车位',
    },
  ];

  return (
    <PageContainer
      header={{
        // title: '车位编辑',
        title: null,
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProForm
        layout="vertical"
        submitter={{
          searchConfig: {
            resetText: '取消',
            submitText: '提交',
          },
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={() => {
          history.goBack();
        }}
        request={async () => {
          const res = await getParkingPlaceDetails((query as any).id);
          formRef?.current?.setFieldsValue({
            projectBid: res.data.projectBid,
          });
          return res.data;
        }}
        // formRef={formRef}

        onFinish={onFinish}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.code}
                name="code"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入车位号' }]}
                placeholder="请输入车位号"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProjectSelect
                label={fieldLabels.projectBid}
                name="projectBid"
                disabled
                rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.stageBid}
                name="stageBid"
                placeholder="请选择项目分期"
                options={stageList}
              />
            </Col> */}
            {/* 
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.parking}
                name="parking"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属车场' }]}
                placeholder="请输入所属车场"
              />
            </Col> */}
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormCascader
                name="parkingSpaceId"
                label={fieldLabels.parkingSpaceId}
                placeholder="请选择车场空间id"
                rules={[{ required: true, message: '请选择车场空间id' }]}
                fieldProps={{
                  options: Option,
                }}
              />
            </Col> */}
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.floor}
                name="floor"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属楼层' }]}
                placeholder="请输入所属楼层"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.parkingArea}
                name="parkingArea"
                fieldProps={{
                  maxLength: 200,
                }}
                placeholder="请输入车场分区"
              />
            </Col> */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                label={fieldLabels.placeArea}
                name="placeArea"
                fieldProps={{
                  maxLength: 200,
                }}
                min={0}
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.parkingType}
                name="parkingType"
                placeholder="请选择车位类型"
                request={async () => {
                  const res = await getResourceEnum('place_parking_type');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                label={fieldLabels.parkingNumber}
                name="parkingNumber"
                fieldProps={{
                  maxLength: 200,
                }}
                initialValue={1}
                max={5}
                min={1}
                placeholder="请输入数量"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.propertyRight}
                name="propertyRight"
                placeholder="请选择产权性质"
                request={async () => {
                  const res = await getResourceEnum('place_property_right');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="状态信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.useStatus}
                name="useStatus"
                placeholder="请选择使用状态"
                request={async () => {
                  const res = await getResourceEnum('place_use_status');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.deliverStatus}
                name="deliverStatus"
                placeholder="请选择交付状态"
                request={async () => {
                  const res = await getResourceEnum('place_deliver_status');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.state}
                name="state"
                placeholder="请选择生效状态"
                request={async () => {
                  const res = await getResourceEnum('state');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default StallEdit;
