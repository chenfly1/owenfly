import { ProFormDigit } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Popover, Space, message } from 'antd';
import { setDeviceNo } from '@/services/door';
import ProForm from '@ant-design/pro-form';
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
        deviceNo: data.doorDevice && data.doorDevice.deviceNo ? data.doorDevice.deviceNo : null,
      });
    }
  }, [hovered]);

  const handleHoverChange = (open: boolean) => {
    setHovered(open);
  };

  const onFinish = async () => {
    try {
      const deviceNo = formRef?.current?.getFieldValue('deviceNo');
      const res = await setDeviceNo({
        deviceNo,
        deviceId: data.id,
      });
      if (res.code === 'SUCCESS') {
        onSubmit();
        setHovered(false);
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
        <ProFormDigit
          name="deviceNo"
          validateTrigger="onBlur"
          rules={[
            { required: true, message: '请输入1-255的整数' },
            {
              validator(rule, value, callback) {
                if (value < 1 || value > 255) {
                  callback('请输入1-255的整数');
                }
                callback();
              },
            },
          ]}
          width="xs"
          fieldProps={{
            size: 'small',
            maxLength: 3,
            precision: 0,
          }}
          placeholder="请输入1-255的整数"
        />
      </ProForm>
    );
  };

  return (
    <Popover
      content={PopoverContent}
      trigger="click"
      onOpenChange={handleHoverChange}
      open={hovered}
    >
      <a>
        <EditOutlined />
      </a>
    </Popover>
  );
};

export default DetailsModelForm;
