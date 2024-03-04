import {
  ModalForm,
  ProFormDependency,
  ProFormInstance,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import styles from './style.less';
import VariableInput from './VariableInput';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getNoticeCategoryList, getNoticeVariableList } from '@/services/notice';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
  onSubmit: (form: any) => void;
  data: any;
};

const EditMessage: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  onSubmit,
  data,
}) => {
  const inputRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();
  const [content, setContent] = useState<string>('');
  const [verObjList, setVerObjList] = useState<Record<string, any>[]>([]);

  const verList = useMemo(() => {
    return verObjList.map((item) => {
      return item.name;
    });
  }, [verObjList]);

  const onFinish = async (values: Record<string, any>) => {
    onOpenChange(false);
    onSubmit({ ...values, content });
  };

  const queryVerList = async (val: string) => {
    const res = await getNoticeVariableList({ categoryBid: val });
    setVerObjList(res.data || []);
  };

  useEffect(() => {
    if (open) {
      setContent(data?.content || '');
      formRef?.current?.setFieldsValue({
        ...data,
      });
      queryVerList(data.categoryBid);
    }
  }, [open]);
  return (
    <ModalForm<Record<string, any>>
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={'60%'}
      title="编辑信息内容"
      formRef={formRef}
      open={open}
      modalProps={{
        centered: true,
      }}
      onFinish={onFinish}
    >
      <ProFormSelect
        label="所属类目"
        placeholder="请选择"
        width="md"
        name="categoryBid"
        request={async () => {
          const res = await getNoticeCategoryList();
          return (res.data || []).map((item: any) => ({
            label: item.name,
            value: item.bid,
          }));
          // return [
          //   { value: 'alitaDoor', label: '智慧人行' },
          //   { value: 'alitaParking', label: '智慧车行' },
          //   { value: 'alitaBaseConfig', label: '工单中心' },
          //   { value: 'alitaMonitor', label: '智慧安防' },
          //   { value: 'alitaContent', label: '内容服务' },
          //   { value: 'AlitaSteward', label: '物业服务' },
          // ];
        }}
        fieldProps={{
          onChange: (val) => {
            if (val) {
              setContent('');
              queryVerList(val);
            }
          },
        }}
      />
      <VariableInput
        ref={inputRef}
        textList={verList}
        label="消息内容"
        name="content"
        value={content}
        variableChange={(value: string) => {
          setContent(value);
        }}
      />
      <ProFormItem className={styles.formItem} label="变量信息">
        <Space>
          {verObjList.map((item) => (
            <Button
              key={item.bid}
              size="small"
              ghost
              onClick={() => {
                inputRef.current.insertVariable(item.name);
              }}
              type="primary"
            >
              {item.nameDesc}
            </Button>
          ))}
        </Space>
      </ProFormItem>

      <ProFormDependency name={['categoryBid']}>
        {({ categoryBid }) => {
          if (categoryBid) {
            return <></>;
          } else {
            return null;
          }
        }}
      </ProFormDependency>
    </ModalForm>
  );
};

export default EditMessage;
