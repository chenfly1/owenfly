import { couponCreate } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Col, Row, message } from 'antd';
import { useEffect, useRef } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue(data);
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const params = {
      ...formData,
      value: (formData.value * 100).toFixed(0),
      condition: (formData.condition * 100 || 0).toFixed(0),
    };
    // 新增
    const res = await couponCreate(params);
    if (res.code === 'SUCCESS') {
      message.success('创建成功');
      onSubmit();
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <ModalForm
        colon={false}
        {...rest}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={1100}
        title={'报表详情'}
        formRef={formRef}
        modalProps={{
          bodyStyle: {
            padding: '20px 40px',
          },
        }}
        open={open}
        submitter={false}
        readonly={true}
      >
        <ProCard split="horizontal">
          <ProCard title="基础信息">
            <Row>
              <Col span={8}>
                <ProFormText label="统计日期" name="recordDtStr" />
              </Col>
              <Col span={8}>
                <ProFormText label="仪表编号" name="syncId" />
              </Col>
              <Col span={8}>
                <ProFormText label="仪表名称" name="insName" />
              </Col>
              <Col span={8}>
                <ProFormText label="计量位置" name="meterSpaceFullName" />
              </Col>
              <Col span={8}>
                <ProFormText label="安装位置" name="installationSpaceName" />
              </Col>
              <Col span={8}>
                <ProFormText label="分项名称" name="insTagName" />
              </Col>
              <Col span={8}>
                <ProFormText label="关联主表" name="parentSyncId" />
              </Col>
              <Col span={8}>
                <ProFormText label="是否含从表" name="inCloudChildStr" />
              </Col>
              <Col span={8}>
                <ProFormText label="公区类型" name="publicTypeName" />
              </Col>
              <Col span={8}>
                <ProFormText label="用电量" name="increment" addonAfter="kW·h" />
              </Col>
              <Col span={8}>
                <ProFormText label="碳排放" name="realCarbonSize" addonAfter="kg" />
              </Col>
              <Col span={8}>
                <ProFormText label="二氧化碳排放" name="carbonDioxide" addonAfter="kg" />
              </Col>
            </Row>
          </ProCard>
          <ProCard title="用电分布">
            <Row>
              <Col span={8}>
                <ProFormText label="尖期用电" name={['readDetail', 'readOfA']} addonAfter="kW·h" />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="尖期碳排放"
                  name={['carbonSizeDetail', 'readOfA']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="尖期二氧化碳排放"
                  name={['carbonDioxideDetail', 'readOfA']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText label="峰期用电" name={['readDetail', 'readOfB']} addonAfter="kW·h" />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="峰期碳排放"
                  name={['carbonSizeDetail', 'readOfB']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="峰期二氧化碳排放"
                  name={['carbonDioxideDetail', 'readOfB']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText label="平期用电" name={['readDetail', 'readOfC']} addonAfter="kW·h" />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="平期碳排放"
                  name={['carbonSizeDetail', 'readOfC']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="平期二氧化碳排放"
                  name={['carbonDioxideDetail', 'readOfC']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText label="谷期用电" name={['readDetail', 'readOfD']} addonAfter="kW·h" />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="谷期碳排放"
                  name={['carbonSizeDetail', 'readOfD']}
                  addonAfter="kg"
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  label="谷期二氧化碳排放"
                  name={['carbonDioxideDetail', 'readOfD']}
                  addonAfter="kg"
                />
              </Col>
            </Row>
          </ProCard>
        </ProCard>
      </ModalForm>
    </>
  );
};

export default Add;
