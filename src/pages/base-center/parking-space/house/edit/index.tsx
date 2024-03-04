import { Card, Col, Row, message } from 'antd';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import ProForm, {
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormCascader,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import {
  getBuildingHouseDetail,
  getProjectDetails,
  getResourceEnum,
  modifyBuildingHouse,
} from '@/services/mda';
import { history } from 'umi';
import styles from './style.less';
import ProjectSelect from '@/components/ProjectSelect';
import { getPhysicalSpaceTree } from './service';

const fieldLabels = {
  code: '房号',
  projectBid: '所属项目',
  houseSpaceId: '房产全称',
  stageBid: '项目分期',
  building: '所属楼栋',
  unit: '所属单元',
  floor: '所属楼层',
  floorArea: '建筑面积（m²）',
  insideArea: '套内面积（m²）',
  billingArea: '计费面积（m²）',
  propertyType: '房产类型',
  useNature: '使用性质',
  propertyRight: '产权性质',
  occupyStatus: '入住状态',
  rentStatus: '出租状态',
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

const HouseEdit: FC<Record<string, any>> = () => {
  const formRef = useRef<ProFormInstance>();
  // const [stageList, setStageList] = useState<StageType[]>();
  const [Option, setOption] = useState<DataItem[]>();

  //获取控件id
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

  // 通过id查找路径
  const findPathById = (data: any, targetId: string) => {
    let path: string[] = [];

    const traverse = (node: any, currentPath: string[]) => {
      currentPath.push(node.id); // 将当前节点的ID添加到当前路径中

      if (node.id === targetId) {
        path = currentPath.slice(); // 当找到目标ID时，将当前路径复制到最终路径中
        return;
      }

      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          traverse(node.children[i], currentPath); // 递归遍历子节点
          if (path.length > 0) {
            break; // 如果已找到路径，提前结束遍历
          }
        }
      }

      currentPath.pop(); // 在返回父节点之前，将当前节点从当前路径中弹出
    };

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        traverse(data[i], []);
        if (path.length > 0) {
          break; // 如果已找到路径，提前结束遍历
        }
      }
    }

    return path;
  };

  //通过id查找路径end

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

  // 获取分期数据
  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
    // getProjectDetails(project?.id).then((res) => {
    //   if (res.code === 'SUCCESS') {
    //     setStageList(res.data.projectStageVOList.map((i) => ({ label: i.name, value: i.bid })));
    //   }
    // });

    getPhysicalSpaceTree({
      projectBid: project?.bid,
      // 房产接口
      filterSpaceTypes: [
        'PROJECT',
        'PROJECT_STAGE',
        'BUILDING',
        'UNIT',
        'FLOOR',
        'ROOM',
        'PUBLIC_AREA',
      ],
      // filterSpaceTypes: ["CARPARK", "AREA", "PASSAGE"]
    }).then((res) => {
      if (res.code === 'SUCCESS') {
        const { data } = res;
        const transformedData = transformData(data);
        const newData = addDisabled(transformedData, false);
        console.log('===', newData);
        setOption(newData);
      }
    });
  }, []);
  const { query } = history.location;

  const onFinish = async (values: BuildingHouseType) => {
    if (Array.isArray(values.houseSpaceId) && values.houseSpaceId.length > 0) {
      values.houseSpaceId = values.houseSpaceId[values.houseSpaceId.length - 1];
    }

    console.log('values', values);

    try {
      const res = await modifyBuildingHouse((query as any).id, {
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
      path: '/base-center/parking-space/house/edit',
      breadcrumbName: '编辑房产',
    },
  ];

  return (
    <PageContainer
      header={{
        title: '编辑房产',
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
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={(e) => {
          setTimeout(async () => {
            const res = await getBuildingHouseDetail((query as any).id);
            console.log('res1', res);
            const path = findPathById(Option, res.data.houseSpaceId);
            formRef?.current?.setFieldsValue({
              ...res.data,
              projectBid: res.data.projectBid,
              houseSpaceId: path,
            });

            return res.data;
          }, 0) as any;
        }}
        // request={async () => {
        //   const res = await getBuildingHouseDetail((query as any).id);
        //   console.log('res', res);
        //   formRef?.current?.setFieldsValue({
        //     projectBid: res.data.projectBid,
        //   });
        //   return res.data;
        // }}
        formRef={formRef}
        request={
          setTimeout(async () => {
            const res = await getBuildingHouseDetail((query as any).id);
            console.log('res1', res);
            const path = findPathById(Option, res.data.houseSpaceId);
            formRef?.current?.setFieldsValue({
              ...res.data,
              projectBid: res.data.projectBid,
              houseSpaceId: path,
            });

            return res.data;
          }, 0) as any
        }
        onFinish={onFinish}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            {/* <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.code}
                name="code"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入房号' }]}
                placeholder="请输入房号"
              />
            </Col> */}
            <Col lg={6} md={12} sm={24}>
              <ProjectSelect
                label={fieldLabels.projectBid}
                name="projectBid"
                disabled
                rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            {/*  houseSpaceId: "房屋空间id", */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormCascader
                name="houseSpaceId"
                label={fieldLabels.houseSpaceId}
                placeholder="请选择房产空间位置"
                rules={[{ required: true, message: '请选择房产空间位置' }]}
                fieldProps={{
                  options: Option,
                }}
              />
            </Col>
            {/* <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.stageBid}
                name="stageBid"
                placeholder="请选择项目分期"
                options={stageList}
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.building}
                name="building"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入所属楼栋' }]}
                placeholder="请输入所属楼栋"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.unit}
                name="unit"
                fieldProps={{
                  maxLength: 200,
                }}
                placeholder="请输入所属单元"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label={fieldLabels.floor}
                fieldProps={{
                  maxLength: 200,
                }}
                name="floor"
                placeholder="请输入所属楼层"
                rules={[{ required: true, message: '请输入所属楼层' }]}
              />
            </Col> */}
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                label={fieldLabels.floorArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="floorArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormDigit
                label={fieldLabels.insideArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="insideArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDigit
                label={fieldLabels.billingArea}
                fieldProps={{
                  maxLength: 50,
                }}
                min={0}
                name="billingArea"
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.propertyType}
                name="propertyType"
                placeholder="请选择"
                request={async () => {
                  const res = await getResourceEnum('house_property_type');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.useNature}
                name="useNature"
                placeholder="请选择使用性质"
                request={async () => {
                  const res = await getResourceEnum('house_use_nature');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.propertyRight}
                name="propertyRight"
                placeholder="请选择产权性质"
                request={async () => {
                  const res = await getResourceEnum('house_property_right');
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
                label={fieldLabels.occupyStatus}
                name="occupyStatus"
                placeholder="请选择"
                request={async () => {
                  const res = await getResourceEnum('house_occupy_status');
                  return res.data.map((i) => ({
                    value: i.code,
                    label: i.message,
                  }));
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.rentStatus}
                name="rentStatus"
                placeholder="请选择出租状态"
                request={async () => {
                  const res = await getResourceEnum('house_rent_status');
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

export default HouseEdit;
