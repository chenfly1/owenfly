import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { ProCard, ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { history, useLocation } from 'umi';
import { Col, Row } from 'antd';
import { getCarbonAnalysisDetail } from '@/services/energy';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location: any = useLocation();
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<MeterCarbonAnalysis[]>();

  const columns: ProColumns<MeterCarbonAnalysis>[] = [
    {
      title: '仪表编号',
      dataIndex: 'syncId',
      search: false,
    },
    {
      title: '仪表名称',
      dataIndex: 'cnName',
      search: false,
    },
    {
      title: '仪表类型',
      dataIndex: 'insTypeName',
      search: false,
    },
    {
      title: '折碳用量',
      dataIndex: 'realCarbonSize',
      search: false,
      render: (_, row) => {
        return `${row.realCarbonSize ?? ''} kg`;
      },
    },
    {
      title: '计量位置',
      dataIndex: 'meterSpaceFullName',
      search: false,
    },
    {
      title: '安装位置',
      dataIndex: 'installationSpaceName',
      search: false,
    },
  ];

  useEffect(() => {
    if (location.query.id) {
      setLoading(true);
      getCarbonAnalysisDetail(location.query.id)
        .then((res) => {
          formRef.current?.setFieldsValue(res.info);
          setSource(res.insDetails);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);
  return (
    <PageContainer
      header={{
        title: '碳排放分析详情',
        onBack: () =>
          history.push({
            pathname: '/energy/analysis/carbon',
          }),
      }}
      className={styles.pageWarp}
    >
      <ProCard split="horizontal">
        <ProCard>
          <ProForm
            formRef={formRef}
            layout="horizontal"
            labelCol={{ flex: '100px' }}
            submitter={false}
            readonly={true}
          >
            <Row>
              <Col span={6}>
                <ProFormText name="cnName" label="指标名称" />
              </Col>
              <Col span={6}>
                <ProFormText name="periodTypeName" label="统计周期" />
              </Col>
              <Col span={6}>
                <ProFormText name="co2" label="折标煤系数" addonAfter="kgec/kw·h" />
              </Col>
              <Col span={6}>
                <ProFormText name="carbonLimit" label="折碳目标值" addonAfter="kg" />
              </Col>
              <Col span={6}>
                <ProFormText name="realCarbonSize" label="实际折碳值" addonAfter="kg" />
              </Col>
              <Col span={6}>
                <ProFormText name="overSize" label="超额用量" addonAfter="kg" />
              </Col>
              <Col span={6}>
                <ProFormText name="gmtCreated" label="开始时间" />
              </Col>
            </Row>
          </ProForm>
        </ProCard>
        <ProCard>
          <ProTable<MeterCarbonAnalysis>
            actionRef={actionRef}
            columns={columns}
            cardBordered
            form={{
              colon: false,
            }}
            loading={loading}
            dataSource={source || []}
            columnsState={{
              persistenceKey: 'pro-table-singe-demos',
              persistenceType: 'localStorage',
              onChange(value) {
                console.log('value: ', value);
              },
            }}
            rowKey="id"
            search={false}
            pagination={false}
            options={false}
            dateFormatter="string"
          />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default TableList;
