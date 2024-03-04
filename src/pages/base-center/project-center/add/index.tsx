import { Card, Col, Row, message, Form } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import ProForm, {
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormItem,
  ProFormDigit,
} from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { createProject, getProjectAllList } from '@/services/mda';
import { history, useModel } from 'umi';
import PopoverBtn from '../components/popoverBtn';
import styles from './style.less';
import AreaCascader from '@/components/AreaCascader';
import { useLocalStorageState } from 'ahooks';
import { storageSy } from '@/utils/Setting';
import FileUpload from '@/components/FileUpload';
import { publicMaterialLib } from '@/components/FileUpload/business';
import OrgCascader from '@/components/OrgCascader';
import { peojectSwitch } from '@/services/security';

const fieldLabels = {
  name: '项目名称',
  orgTreeBids: '所属组织',
  businessType: '所属业态',
  projectStatus: '项目状态',
  area: '项目地区',
  address: '项目详细地址',
  totalArea: '建筑面积（m²）',
  state: '启停状态',
  stage: '项目分期',
  projectDrawingUrl: '项目图纸',
};

type StageType = {
  name: string;
  open: boolean;
};

const ProjectAdd: FC<Record<string, any>> = () => {
  // 获取所属组织数据
  // const { data: orgData } = useRequest(() => {
  //   return orgQueryTree();
  // });
  const [objectId, setObjectId] = useState<string>();
  const [stageList, setStageList] = useState<StageType[]>([]);
  const { setInitialState } = useModel('@@initialState');
  const [, setProjectInfo] = useLocalStorageState<ProjectListType>(storageSy.projectInfo);

  const handleStage = (list: StageType[]) => {
    setStageList(list);
  };

  const onFinish = async (values: Record<string, any>) => {
    try {
      const res = await createProject({
        ...values,
        orgBid: values.orgTreeBids[values.orgTreeBids.length - 1],
        province: values.area[0],
        city: values.area[1],
        region: values.area.length > 2 ? values.area[2] : '',
        projectDrawingUrl: objectId,
        projectStageNames: stageList.map((i) => i.name),
      });
      if (res.code === 'SUCCESS') {
        // 刷新列表
        let projectList: ProjectListType[] = [];
        const projectListRes = await getProjectAllList();
        projectList = projectListRes.data.items;
        const bidInfo = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
        if (!bidInfo && projectList.length) {
          await peojectSwitch({ projectBid: projectList[0].bid });
          setProjectInfo(projectList[0]);
        }
        setInitialState((s) => ({
          ...s,
          projectList: projectList,
        }));
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
      path: '/base-center/project-center',
      breadcrumbName: '项目管理',
    },
    {
      path: '/base-center/project-center/add',
      breadcrumbName: '新建项目',
    },
  ];

  return (
    <PageContainer
      header={{
        // title: '新建项目',
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
        onFinish={onFinish}
        onReset={() => {
          history.goBack();
        }}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                fieldProps={{
                  maxLength: 100,
                }}
                rules={[{ required: true, message: '请输入项目名称' }]}
                placeholder="请输入项目名称"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              {/* <ProFormCascader
                name="orgTreeBids"
                fieldProps={{
                  fieldNames: {
                    label: 'name',
                    value: 'bid',
                    children: 'children',
                  },
                  changeOnSelect: true,
                  options: orgData,
                }}
                label={fieldLabels.orgTreeBids}
                placeholder="请选择"
                rules={[{ required: true, message: '请选择' }]}
              /> */}
              <OrgCascader name="orgTreeBids" label={fieldLabels.orgTreeBids} />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormSelect
                label={fieldLabels.businessType}
                placeholder="请选择"
                rules={[{ required: true, message: '请选择' }]}
                name="businessType"
                options={[
                  {
                    value: 1,
                    label: '住宅',
                  },
                  {
                    value: 2,
                    label: '办公',
                  },
                  {
                    value: 3,
                    label: '商写',
                  },
                  {
                    value: 4,
                    label: '医疗',
                  },
                  {
                    value: 5,
                    label: '学校',
                  },
                  {
                    value: 6,
                    label: '产业园',
                  },
                  {
                    value: 7,
                    label: '城市公共服务',
                  },
                ]}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.projectStatus}
                placeholder="请选择"
                rules={[{ required: true, message: '请选择' }]}
                name="projectStatus"
                options={[
                  {
                    value: 1,
                    label: '筹备',
                  },
                  {
                    value: 2,
                    label: '开发',
                  },
                ]}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                name="area"
                label={fieldLabels.area}
                rules={[{ type: 'array', required: true, message: '请选择' }]}
              >
                <AreaCascader />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <ProFormText
                label={fieldLabels.address}
                name="address"
                fieldProps={{
                  maxLength: 200,
                }}
                rules={[{ required: true, message: '请输入详细地址' }]}
                placeholder="请输入详细地址"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormDigit
                label={fieldLabels.totalArea}
                name="totalArea"
                fieldProps={{
                  maxLength: 100,
                }}
                rules={[{ required: true, message: '请输入数字' }]}
                placeholder="请输入数字"
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormRadio.Group
                name="state"
                label={fieldLabels.state}
                disabled
                initialValue={1}
                options={[
                  {
                    label: '启用',
                    value: 1,
                  },
                  {
                    label: '停用',
                    value: 0,
                  },
                ]}
              />
            </Col>
            {/* <Col lg={24} md={24} sm={24}>
              <ProFormText label={fieldLabels.stage} name="stage" readonly>
                <PopoverBtn stageList={stageList} handleStage={handleStage} />
              </ProFormText>
            </Col> */}
            {/* <Col lg={24} md={24} sm={24}>
              <ProFormItem
                label={fieldLabels.projectDrawingUrl}
                name="projectDrawingUrl"
                valuePropName="fileList"
                extra="仅支持png，jpeg，jpg 格式文件"
                getValueFromEvent={(e: any) => {
                  console.log('Upload event:', e);
                  const file = e.file;
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng && file.status === 'uploading') {
                    message.error('仅支持jpg，jpeg，png格式的图片');
                  }
                  const isLt10M = file.size && file.size / 1024 / 1024 < 10;
                  if (!isLt10M && file.status === 'uploading') {
                    message.error('图片不能超过10M,请重新选择图片');
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
                  accept=".jpg，.jpeg，.png"
                  buttonText="上传图纸"
                  fileType="image"
                  listType="picture-card"
                  onUploadSuccess={(objectIdCb: string) => {
                    setObjectId(objectIdCb);
                  }}
                  business={publicMaterialLib}
                />
              </ProFormItem>
            </Col> */}
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default ProjectAdd;
