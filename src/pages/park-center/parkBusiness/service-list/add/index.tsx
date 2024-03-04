import {
  cycleAddChildId,
  parkTitles,
  serviceTypeOptions,
} from '@/pages/park-center/utils/constant';
// import NameSearchSelect from '@/pages/park-center/NameSearchSelect';
import { addService, parkAreaTree, parkYardListByPage } from '@/services/park';
import { getProjectBid } from '@/utils/project';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormMoney } from '@ant-design/pro-components';

import {
  ProCard,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  StepsForm,
} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Alert, Button, message, Result, TreeSelect } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import styles from './style.less';

const Add: React.FC = () => {
  const form1 = useRef<ProFormInstance>();
  const form2 = useRef<ProFormInstance>();
  const [ruleMonth, setRuleMonth] = useState<boolean>(false);
  const [areaTreeData, setAreaTreeData] = useState<ParkAreaTreeType[]>([]);
  const [onNext, setOnNext] = useState(false);

  // 车场下拉
  const queryParkList = async () => {
    const res = await parkYardListByPage({
      pageSize: 1000,
      pageNo: 1,
      // state: '1',
      projectId: getProjectBid(),
    });
    return (res.data.items || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const createService = async (value: any): Promise<boolean> => {
    setOnNext(true);
    const value1 = form1.current?.getFieldFormatValueObject!();
    const selectingPassages = value.selectingPassages;
    const list: string[] = [];
    cycleAddChildId(selectingPassages, list, areaTreeData);
    value.selectingPassages = list;
    value.price = (value1.price || 0) * 100;
    if (value1.type === 2) {
      value.cycle = 1;
    }
    return addService({ ...value1, ...value })
      .then((res) => {
        setOnNext(false);
        const result = res.code == 'SUCCESS' ? true : false;
        if (!result) {
          message.error(res.message);
        }
        return result;
      })
      .catch(() => {
        setOnNext(false);
        message.error('操作失败，请重试');
        return false;
      });
  };

  const queryAreaData = async (para: any): Promise<boolean> => {
    setOnNext(true);

    return parkAreaTree(para.parkId)
      .then((res) => {
        setOnNext(false);
        const result = res.code == 'SUCCESS' ? true : false;
        if (!result) {
          message.error(res.message);
        } else {
          form2.current?.resetFields();
          const channels = res.data; //[0].child;
          setAreaTreeData(channels as any);
        }
        return result;
      })
      .catch(() => {
        setOnNext(false);
        message.error('操作失败，请重试');
        return false;
      });
  };

  return (
    <PageContainer
      header={{
        title: '创建车辆套餐',
        //title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProCard className={styles.customForm}>
        <StepsForm<{
          name: string;
        }>
          formProps={{
            validateMessages: {
              required: '此项为必填项',
            },
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Button type="primary" onClick={() => props.onSubmit?.()} loading={onNext}>
                    下一步
                  </Button>
                );
              }

              if (props.step === 1) {
                return [
                  <Button key="pre" onClick={() => props.onPre?.()}>
                    上一步
                  </Button>,
                  <Button
                    type="primary"
                    key="goToTree"
                    onClick={() => props.onSubmit?.()}
                    loading={onNext}
                  >
                    创建
                  </Button>,
                ];
              }

              return [];
            },
          }}
        >
          <StepsForm.StepForm<{
            name: string;
          }>
            name="base"
            title="套餐基础信息"
            formRef={form1}
            stepProps={{
              description: '输入套餐基础信息',
            }}
            onFinish={async (value) => {
              return queryAreaData(value);
            }}
          >
            <ProFormText
              name="name"
              label={parkTitles.ruleName}
              placeholder="请输入套餐名称"
              fieldProps={{ maxLength: 20, showCount: true }}
              rules={[
                { required: true, message: '请输入套餐名称' },
                { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '请输入中文或者数字' },
              ]}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              // width={300}
              name="parkId"
              label="车场名称"
              allowClear={false}
              request={queryParkList}
            />

            <ProFormSelect
              name="type"
              label={parkTitles.ruleUsage}
              placeholder="请选择套餐用途"
              options={serviceTypeOptions as any}
              fieldProps={{
                onChange: (val) => {
                  setRuleMonth(val == 2);
                },
              }}
              rules={[{ required: true, message: '请选择套餐用途' }]}
            />

            <ProFormMoney
              hidden={!ruleMonth}
              max={9999}
              min={0}
              name="price"
              label={parkTitles.rulePrice + '(元/月)'}
              placeholder="请输入价格（一个车位的价格）"
              fieldProps={{ precision: 2 }}
              rules={[{ required: ruleMonth, message: '请输入价格' }]}
            />

            {/* <ProFormDigit
              hidden={!ruleMonth}
              label={parkTitles.ruleCycleTime}
              name="cycle"
              max={99}
              min={0}
              addonAfter="月"
              placeholder="请输入周期"
              rules={[{ required: ruleMonth, message: '请输入周期' }]}
            /> */}
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="pass"
            title="套餐通行信息"
            formRef={form2}
            stepProps={{
              description: '选择套餐的计费与通行范围',
            }}
            onFinish={createService}
          >
            <ProFormTreeSelect
              name="selectingPassages"
              label={parkTitles.ruleAceessAreas}
              fieldProps={{
                multiple: true,
                treeDefaultExpandAll: true,
                treeNodeFilterProp: 'name',
                treeData: areaTreeData,
                treeCheckable: true,
                treeLine: true,
                showCheckedStrategy: TreeSelect.SHOW_PARENT,
                placeholder: '请选择',
                fieldNames: {
                  label: 'name',
                  value: 'id',
                  children: 'child',
                },
              }}
              rules={[{ required: true, message: '请选择准入区域' }]}
            />

            <ProFormTextArea
              name="remark"
              label="备注"
              placeholder="请输入备注，最多不超过200字"
              fieldProps={{ maxLength: 200, showCount: true }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="succ"
            title="完成创建"
            stepProps={{
              description: '创建成功',
            }}
            onFinish={async () => {
              return true;
            }}
          >
            <Result
              status="success"
              title="创建成功"
              subTitle="套餐创建成功"
              extra={[
                <Button type="primary" key="console" onClick={() => history.goBack()}>
                  返回
                </Button>,
              ]}
            />
            <Alert
              message="车辆套餐说明"
              description="车辆套餐用于车辆授权，同类型的车辆准入方式与计费方式相同。"
              type="info"
            />
          </StepsForm.StepForm>
        </StepsForm>
      </ProCard>
    </PageContainer>
  );
};

export default Add;
