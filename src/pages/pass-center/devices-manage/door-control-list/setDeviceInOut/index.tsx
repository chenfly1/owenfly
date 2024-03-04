import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Popover, Space, message } from 'antd';
import { editDevice } from '@/services/door';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { EditOutlined } from '@ant-design/icons';
import styles from './style.less';

type IProps = {
  onSubmit: () => void;
  data: any;
};

const DetailsModelForm: React.FC<IProps> = (props) => {
  const { data, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (data && hovered) {
      formRef?.current?.resetFields();
      formRef?.current?.setFieldsValue({
        inOut: data.doorDevice && data.doorDevice.inOut ? data.doorDevice.inOut : null,
      });
    }
  }, [hovered]);

  const handleClickChange = (open: boolean) => {
    setHovered(open);
  };

  const onFinish = async () => {
    try {
      const inOut = formRef?.current?.getFieldValue('inOut');
      const res = await editDevice({
        inOut,
        deviceId: data.id,
      });
      if (res.code === 'SUCCESS') {
        setHovered(false);
        onSubmit();
        message.success('操作成功');
      }
    } catch {
      // console.log
    }
  };

  const PopoverContent = () => {
    return (
      <ProForm
        formRef={formRef}
        className={styles.formItem}
        submitter={{
          render: (prop) => {
            return (
              <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setHovered(false);
                  }}
                >
                  取消
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    onFinish();
                  }}
                  type="primary"
                >
                  保存
                </Button>
              </Space>
            );
          },
        }}
      >
        <ProFormSelect
          placeholder="请选择"
          rules={[{ required: true, message: '请选择' }]}
          name="inOut"
          fieldProps={{
            size: 'small',
          }}
          options={[
            {
              value: '1',
              label: '进',
            },
            {
              value: '2',
              label: '出',
            },
            {
              value: '3',
              label: '进出',
            },
            {
              value: '0',
              label: '-',
            },
          ]}
        />
      </ProForm>
    );
  };

  return (
    <Popover
      content={PopoverContent}
      trigger="click"
      open={hovered}
      onOpenChange={handleClickChange}
    >
      <a>
        <EditOutlined />
      </a>
    </Popover>
  );
};

export default DetailsModelForm;
