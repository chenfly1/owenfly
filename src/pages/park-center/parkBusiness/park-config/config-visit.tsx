import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import type { ProFormInstance, PageContainerProps } from '@ant-design/pro-components';
import { Button, Card, Col, Form, TreeSelect, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { businessRuleVisitor, parkAreaTree, updateRuleConfigCharge } from '@/services/park';
import type { pProps } from './data.d';
import { Access, useAccess } from 'umi';

const ConfigCharge: React.FC<pProps & PageContainerProps> = forwardRef((props, ref) => {
  const { data, loading, parkId, projectId } = props;
  const chargeRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();
  const [disable, setDisable] = useState(true);
  const [onSave, setOnSaving] = useState(false);
  const access = useAccess();
  const [areaTreeData, setAreaTreeData] = useState<ParkAreaTreeType[]>([]);
  // access.functionAccess = () => true;

  const queryAreaData = async (para: any) => {
    const res = await parkAreaTree(para.parkId);
    if (res.code == 'SUCCESS') {
      setAreaTreeData(res.data as any);
    }
  };
  useEffect(() => {
    form.resetFields();
    if (parkId.length) {
      const currentParkRow =
        (data?.passScope || []).find((item: any) => item?.parkId === parkId) || {};
      form.setFieldsValue({
        passFlag: data?.passFlag === 1 ? true : false,
        otherPayFlag: data?.otherPayFlag === 1 ? true : false,
        passScope: currentParkRow.channelId || [],
      });
      queryAreaData(props);
    }
  }, [loading, parkId, data]);

  const onEditBtn = (callback?: any) => {
    if (!parkId.length) {
      message.warning('请选择车场');
      return;
    }
    if (disable) {
      setDisable(false);
    } else {
      setOnSaving(true);
      chargeRef.current?.validateFields().then((values) => {
        const params = {
          projectId: projectId,
          passFlag: values.passFlag ? 1 : 0,
          otherPayFlag: values.otherPayFlag ? 1 : 0,
          passScope: [
            {
              parkId: parkId,
              channelId: values.passScope,
            },
          ],
        };
        businessRuleVisitor(params)
          .then((res) => {
            setOnSaving(false);
            if (res.code == 'SUCCESS') {
              // 保存成功
              setDisable(true);
              form.setFieldsValue(values);
              message.success(res.message);
              if (typeof callback === 'function') {
                callback();
              }
            } else {
              message.error(res.message);
            }
          })
          .catch(() => {
            setOnSaving(false);
            message.error('操作失败，请重试');
          });
      });
    }
  };

  useImperativeHandle(ref, () => {
    return {
      onEditBtn,
      disable,
    };
  });

  return (
    <PageContainer loading={loading} header={{ title: null }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'self-start',
          justifyContent: 'space-between',
          margin: '7px 21px',
        }}
      >
        <ProForm
          key="1"
          layout="horizontal"
          formRef={chargeRef}
          form={form}
          disabled={disable}
          colon={false}
          style={{ width: '100%' }}
          submitter={false}
          validateTrigger="onBlur"
        >
          <ProFormSwitch name="passFlag" label="访客车辆通行" />
          <ProFormSwitch name="otherPayFlag" label="访客订单代缴" />
          <ProFormTreeSelect
            name="passScope"
            width={300}
            label={'通行范围'}
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
            rules={[{ required: true, message: '请选择通行范围' }]}
          />
        </ProForm>

        <Access accessible={access.functionAccess('alitaParking_editBusinessRule')}>
          <Button type="primary" onClick={onEditBtn} loading={onSave}>
            {disable ? '编辑' : '保存'}
          </Button>
        </Access>
      </div>
    </PageContainer>
  );
});

export default ConfigCharge;
