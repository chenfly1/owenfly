import type { FC } from 'react';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import { parkAreaTree, placeQueryByPage, serviceDetail, vehicleAuthDetail } from '@/services/park';
import { Card, Col, Row, Tree } from 'antd';
import {
  ProCard,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProForm,
  ProFormDateRangePicker,
} from '@ant-design/pro-components';
import style from './styles.less';
import { PackageUseEnum } from '../../data.d';
import type { DataNode } from 'antd/lib/tree';

const AuthDetail: FC<Record<string, any>> = () => {
  const params = history.location.query || {};
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const cardSetting = {
    bordered: false,
    loading: loading,
    style: { marginBottom: 24 },
  };

  const queryDetail = async () => {
    setLoading(true);
    const res = await vehicleAuthDetail(params?.id as string);
    const treeRes = await parkAreaTree(res.data?.parkId as string);
    const packeRes = await serviceDetail(res.data?.packageId as string);
    setTreeData(treeRes.data[0].child as any);
    setSelectedKeys(packeRes.data.passageIds);
    const detailData = {
      ...res.data,
      dateRange: [res.data.startDate, res.data.endDate],
    };

    formRef?.current?.setFieldsValue({
      ...detailData,
    });
    setLoading(false);
  };

  // 车位下拉
  const queryLotList = async () => {
    const res = await placeQueryByPage({
      pageSize: 1000,
      pageNo: 1,
      projectId: project.bid,
    });
    return (res.data.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  };

  useEffect(() => {
    queryDetail();
  }, []);

  return (
    <PageContainer
      header={{
        title: '车辆授权详情',
        onBack: () => {
          history.goBack();
        },
      }}
      className={style.authorizationManage}
    >
      <ProForm
        layout="horizontal"
        labelCol={{
          flex: '100px',
        }}
        submitter={{
          searchConfig: {
            resetText: '返回', //修改ProForm重置文字
          },
          submitButtonProps: {
            style: {
              // 隐藏提交按钮
              display: 'none',
            },
          },
          render: (props, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        formRef={formRef}
        onReset={() => history.goBack()}
      >
        <Card title="车主车辆信息" {...cardSetting}>
          <ProFormList
            name="owner"
            deleteIconProps={false}
            creatorButtonProps={false}
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
          >
            {(f, index, action) => {
              console.log(f, index, action);
              return (
                <>
                  <Row gutter={16}>
                    <Col lg={6} md={12} sm={24}>
                      <ProFormText name="plate" label="车牌号码" readonly />
                    </Col>
                    <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                      <ProFormSelect
                        name="carType"
                        readonly={true}
                        label="车辆类型"
                        options={[
                          {
                            label: '小型车',
                            value: '1',
                          },
                          {
                            label: '中型车',
                            value: '2',
                          },
                        ]}
                      />
                    </Col>
                    <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                      <ProFormText name="name" label="车主姓名" readonly />
                    </Col>
                    <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                      <ProFormText name="phone" label="手机号码" readonly />
                    </Col>
                  </Row>
                </>
              );
            }}
          </ProFormList>
        </Card>
        <Card title="车场与项目信息" className={style.card} {...cardSetting}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText colon={false} name="parkName" label="车场名称" readonly />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="packageType"
                readonly
                allowClear
                label="套餐用途"
                request={async () => {
                  return Object.entries(PackageUseEnum).map((item) => {
                    return {
                      label: item[1].text,
                      value: item[0],
                    };
                  });
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormSelect
                name="carportes"
                label="车位编号"
                request={queryLotList}
                mode="multiple"
                readonly
              />
            </Col>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText name="packageName" label="套餐名称" readonly />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Row>
                <Col flex="103px">
                  <div style={{ textAlign: 'right' }}>准入范围：</div>
                </Col>
                <Col flex="auto">
                  <Tree
                    treeData={treeData}
                    autoExpandParent={true}
                    checkedKeys={selectedKeys}
                    checkable
                    defaultExpandAll
                    showLine
                    disabled
                    fieldNames={{
                      title: 'name',
                      key: 'id',
                      children: 'child',
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <Card title="有效期" className={style.card} {...cardSetting}>
          <Row>
            <Col xl={{ span: 6 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormDateRangePicker
                labelCol={{ flex: '120px' }}
                label="授权期限日期"
                name="dateRange"
                width={'lg'}
                readonly
              />
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default AuthDetail;
