import { Card, Col, Row, message } from 'antd';

import type { FC } from 'react';
import { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-components';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { fakeSubmitForm } from './service';
import styles from './style.less';

import type { ProColumns } from '@ant-design/pro-components';

//表格字段
type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  created_at?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [
  {
    id: 6247485014,
    title: '活动名称一1',
    decs: '这个活动真好玩',
    state: 'open',
    created_at: '1590486176000',
  },
  {
    id: 624691229,
    title: '活动名称二2',
    decs: '这个活动真好玩',
    state: 'closed',
    created_at: '1590481162000',
  },
];

const columns: ProColumns<DataSourceType>[] = [
  {
    title: '房号',

    dataIndex: 'title',
  },
  {
    title: '所属楼栋',

    dataIndex: 'title',
  },
  {
    title: '所属单元',

    dataIndex: 'title',
  },
  {
    title: '所属楼层',

    dataIndex: 'title',
  },
  {
    title: '建筑面积',

    dataIndex: 'title',
  },
  {
    title: '套内面积',

    dataIndex: 'title',
  },
  {
    title: '计费面积',

    dataIndex: 'title',
  },
  {
    title: '房产类型',

    key: 'state',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum: {
      open: {
        text: '未解决',
        status: 'Error',
      },
      closed: {
        text: '已解决',
        status: 'Success',
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
  },
];

const HouseSplit: FC<Record<string, any>> = () => {
  const onFinish = async (values: Record<string, any>) => {
    try {
      await fakeSubmitForm(values);
      message.success('提交成功');
    } catch {
      // console.log
    }
  };

  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    defaultData.map((item) => item.id),
  );
  return (
    <ProForm
      layout="horizontal"
      name="string"
      hideRequiredMark
      submitter={{
        render: (props, dom) => {
          return <FooterToolbar>{dom}</FooterToolbar>;
        },
      }}
      onFinish={onFinish}
      request={async () => {
        return {
          name: '蚂蚁设计有限公司',
          logo: 'logo',
        };
      }}
    >
      <PageContainer header={{ title: null }}>
        <Card title="拆分的房产信息" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col lg={4} md={12} sm={24}>
              <ProFormText
                label="房产简称"
                readonly
                name="name"
                rules={[{ required: true, message: '请输入房号' }]}
                placeholder="请输入房号"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="房号"
                readonly
                name="name"
                rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属项目"
                readonly
                name="name"
                rules={[{ required: true, message: '请选择所属项目' }]}
                placeholder="请选择所属项目"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="项目分期"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col lg={4} md={12} sm={24}>
              <ProFormText
                label="所属楼栋"
                readonly
                name="name"
                rules={[{ required: true, message: '请输入所属楼栋' }]}
                placeholder="请输入所属楼栋"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属单元"
                readonly
                name="name"
                rules={[{ required: true, message: '请输入所属单元' }]}
                placeholder="请输入所属单元"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="所属楼层"
                readonly
                name="name"
                placeholder="请输入所属楼层"
                rules={[{ required: true, message: '请输入所属楼层' }]}
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="建筑面积"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col lg={4} md={12} sm={24}>
              <ProFormText
                label="套内面积"
                readonly
                name="name"
                rules={[{ required: true, message: '请输入建筑面积' }]}
                placeholder="请输入建筑面积"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="计费面积"
                readonly
                name="name"
                rules={[{ required: true, message: '请输入套内面积' }]}
                placeholder="请输入套内面积"
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="房产类型"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="使用性质"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col lg={4} md={12} sm={24}>
              <ProFormText
                label="产权性质"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="入住状态"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="出租状态"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <ProFormText
                label="生效状态"
                readonly
                name="name"
                placeholder="请输入计费面积"
                rules={[{ required: true, message: '请输入计费面积' }]}
              />
            </Col>
          </Row>
        </Card>
        <Card title="拆分后的房产信息" className={styles.card} bordered={false}>
          <ProForm.Item
            label=""
            name="dataSource"
            initialValue={defaultData}
            trigger="onValuesChange"
          >
            <EditableProTable<DataSourceType>
              rowKey="id"
              toolBarRender={false}
              columns={columns}
              recordCreatorProps={{
                newRecordType: 'dataSource',
                position: 'bottom',
                record: () => ({
                  id: Date.now(),
                  title: '活动名称一',
                  decs: '这个活动真好玩',
                  state: 'open',
                  created_at: '1590486176000',
                }),
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                onChange: setEditableRowKeys,
                actionRender: (row, _, dom) => {
                  return [dom.delete];
                },
              }}
            />
          </ProForm.Item>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default HouseSplit;
