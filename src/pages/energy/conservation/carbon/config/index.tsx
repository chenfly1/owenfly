import { Button, Card, Col, Row, Space } from 'antd';
import Style from '../index.less';
import Update, { CarbonUpdateFormProps } from './update';
import History from './history';
import { createRef, useEffect, useState } from 'react';
import { DrawerFormRef } from '@/components/DrawerForm';
import { getCarbonConfig, updateCarbonConfig } from '@/services/energy';

export default () => {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<CarbonConfigType>();
  const updateRef = createRef<DrawerFormRef<CarbonUpdateFormProps>>();
  const historyRef = createRef<DrawerFormRef<never>>();

  const getConfig = () => {
    setLoading(true);
    getCarbonConfig()
      .then((res) => {
        setSource(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getConfig();
  }, []);
  return (
    <>
      <Card
        loading={loading}
        className={Style.energy_carbon_config}
        title="系数配置"
        extra={
          <Space wrap>
            <Button
              key="edit"
              type="primary"
              size="small"
              onClick={() => {
                updateRef?.current?.open({
                  energyTypeName: source?.energyTypeName,
                  carbon: source?.carbon,
                  co2: source?.co2,
                  carbonDioxide: source?.carbonDioxide,
                });
              }}
            >
              编辑
            </Button>
            <Button
              key="history"
              type="primary"
              size="small"
              onClick={() => {
                historyRef?.current?.open();
              }}
            >
              历史记录
            </Button>
          </Space>
        }
      >
        <span className={Style.energy_carbon_config_title}>最新碳转换系数配置</span>
        <Row justify={'space-between'} align={'middle'}>
          <Col className={Style.energy_carbon_config_item}>
            <span>{source?.energyTypeName}</span>
            <span>能源</span>
          </Col>
          <Col className={Style.energy_carbon_config_item}>
            <span>{source?.carbon}</span>
            <span>碳排放(kg)</span>
          </Col>
          <Col className={Style.energy_carbon_config_item}>
            <span>{source?.carbonDioxide}</span>
            <span>二氧化碳排放(kg)</span>
          </Col>
          <Col className={Style.energy_carbon_config_item}>
            <span>{source?.gmtCreated}</span>
            <span>创建时间</span>
          </Col>
          <Col className={Style.energy_carbon_config_item}>
            <span>{source?.updater}</span>
            <span>最后操作人</span>
          </Col>
        </Row>
      </Card>
      <Update
        ref={updateRef}
        submit={async (values) => {
          try {
            await updateCarbonConfig({
              carbonStr: values.carbon,
            });
            getConfig();
            return true;
          } catch (err) {
            return false;
          }
        }}
      />
      <History ref={historyRef} submit={() => Promise.resolve(true)} />
    </>
  );
};
