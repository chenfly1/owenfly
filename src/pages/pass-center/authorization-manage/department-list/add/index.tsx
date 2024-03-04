import { ProFormItem } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import TransferAreas from '@/pages/pass-center/components/transferAreas';
import { getpassingAreaOrgByPage, saveOrgPassingArea } from '@/services/door';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  modalVisit: boolean;
  title: string;
  organizationId: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, organizationId, title } = props;
  const formRef = useRef<ProFormInstance>();
  const [disabledIds, setDisabledIds] = useState<number[]>([]);
  useEffect(() => {
    if (modalVisit && organizationId) {
      const params = {
        organizationId: organizationId,
        pageNo: 1,
        pageSize: 10000,
      };
      getpassingAreaOrgByPage(params).then((res) => {
        if (res.data && res.data.items && res.data.items.length) {
          const passingAreaIds = res.data.items.map((i) => i.passingAreaId);
          formRef?.current?.setFieldsValue({
            passingAreaIds: passingAreaIds,
          });
          setDisabledIds(passingAreaIds);
        } else {
          formRef?.current?.setFieldsValue({
            passingAreaIds: [],
          });
          setDisabledIds([]);
        }
      });
    }
  }, [modalVisit, organizationId]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      const res = await saveOrgPassingArea({
        organizationId: organizationId,
        passingAreas: values.passingAreaIds
          .filter((i: any) => !disabledIds.includes(i))
          .map((i: string) => ({ id: i })),
      });
      if (res.code === 'SUCCESS') {
        onSubmit();
        onOpenChange(false);
        formRef?.current?.resetFields();
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={480}
      labelCol={{
        flex: '80px',
      }}
      open={modalVisit}
      onFinish={onFinish}
      // submitter={{
      //   render: (_, dom) => {
      //     return <Space>{dom}</Space>;
      //   },
      // }}
    >
      <ProFormItem shouldUpdate>
        {(form) => {
          console.log(form);
          const passingAreaIds = form?.getFieldValue('passingAreaIds');
          return (
            <ProFormItem
              label="通行区域"
              name="passingAreaIds"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
              labelCol={{
                flex: '80px',
              }}
            >
              <TransferAreas
                passingAreaIds={passingAreaIds}
                disabledIds={disabledIds}
                selectHandle={(keys: string[]) => {
                  console.log(keys);
                  form?.setFieldsValue({
                    passingAreaIds: keys,
                  });
                }}
              />
            </ProFormItem>
          );
        }}
      </ProFormItem>
    </DrawerForm>
  );
};

export default AddModelForm;
