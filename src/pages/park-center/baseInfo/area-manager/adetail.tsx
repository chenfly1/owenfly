import {
  DrawerForm,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef } from 'react';
import { parkTitles } from '@/pages/park-center/utils/constant';
import { updateParkArea } from '@/services/park';
import { Col } from 'antd';

type Props = {
  data?: ParkAreaType;
  edit: boolean;
  visiable: boolean;
  onChange: (show: boolean) => void;
};

const Detail: React.FC<Props> = (props) => {
  const { edit, visiable, data, onChange } = props;
  const formRef = useRef<ProFormInstance>();
  formRef.current?.resetFields();
  formRef.current?.setFieldsValue({ ...data });

  const onFinish = async (values: Record<string, any>) => {
    console.log('values: ', values);
    // 成功后返回    history.goBack();
    const id = data?.id as string;
    const params = formRef.current?.getFieldFormatValueObject!();
    const res = await updateParkArea(id, params);
    return res.code == 'SUCCESS' ? true : false;
  };

  return (
    <DrawerForm
      width={600}
      title="区域信息"
      layout="vertical"
      formRef={formRef}
      disabled={!edit}
      open={visiable}
      submitter={{
        render: (_, dom) => {
          return edit ? dom : null;
        },
      }}
      onFinish={onFinish}
      onOpenChange={onChange}
      grid={true}
    >
      <ProFormGroup title="项目信息">
        <Col span={12}>
          <ProFormText name="projectName" label={parkTitles.projectName} placeholder="-" disabled />
        </Col>
        <Col span={12}>
          <ProFormText name="projectCode" label={parkTitles.projectNum} placeholder="-" disabled />
        </Col>
      </ProFormGroup>
      <ProFormGroup title="车场信息">
        <Col span={12}>
          <ProFormText name="parkName" label={parkTitles.alitaYardName} placeholder="-" disabled />
        </Col>
        <Col span={12}>
          <ProFormText name="parkCode" label={parkTitles.alitaYardNo} placeholder="-" disabled />
        </Col>
      </ProFormGroup>
      <ProFormGroup title="区域信息">
        <Col span={12}>
          <ProFormText
            name="name"
            label={parkTitles.areaName}
            rules={[{ required: true, message: '请输入区域名称' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormText name="code" label={parkTitles.areaNum} placeholder="-" disabled />
        </Col>

        <Col span={12}>
          <ProFormDigit
            name="parkNumber"
            label={parkTitles.total}
            max={99999}
            min={1}
            rules={[{ required: true, message: '请输入车位数量' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormRadio.Group
            name="limitState"
            label={parkTitles.fullAccess}
            options={[
              { label: '是', value: true },
              { label: '否', value: false },
            ]}
            rules={[{ required: true, message: '请选择满位是否允许进入' }]}
          />
        </Col>
      </ProFormGroup>

      <ProFormGroup title="备注">
        <Col span={24}>
          <ProFormTextArea
            name="remark"
            placeholder="这个区域的备注描述"
            fieldProps={{ maxLength: 200, showCount: true }}
          />
        </Col>
      </ProFormGroup>
    </DrawerForm>
  );
};

export default Detail;
