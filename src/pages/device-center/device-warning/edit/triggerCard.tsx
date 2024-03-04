import React, { useRef, useState } from 'react';
import { Col, Input, Row, Modal } from 'antd';
import styles from './style.less';
import ProForm, {
  FormListActionType,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-form';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import DevicesModal from './devices-modal';

type IProps = {
  from: any;
  disabled: boolean;
};

const TriggerCard: React.FC<IProps> = ({ from, disabled }) => {
  const actionRef = useRef<FormListActionType<any>>();
  const [deviceModalShow, setDeviceModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});
  const [selectKeys, setSelectKeys] = useState<any[]>([]);

  const onDoubleClick = (selectedRowKeys: string[], action: any) => {
    action.setCurrentRowData({
      ...action.getCurrentRowData(),
      deviceIds: selectedRowKeys,
    });
  };

  const onDevicesClick = (e: any, action: any, selectKey: any) => {
    setDeviceModalShow(true);
    setModalData(action);
    setSelectKeys(selectKey);
  };

  const actionGuard = {
    beforeRemoveRow: async (index: any) => {
      const row = actionRef.current?.get(index);
      console.log(row);
      if (!row.value || !row.unit) return true;
      return new Promise((resolve) => {
        Modal.confirm({
          icon: <ExclamationCircleFilled />,
          title: `确定删除触发条件-设备离线${row.value}${
            row.unit === 'm' ? '分钟' : '小时'
          }及项目自定义设备？`,
          centered: true,
          onOk: async () => {
            resolve(true);
          },
          onCancel() {
            resolve(false);
          },
        });
      });
    },
  };

  return (
    <ProFormList
      name="conditions"
      creatorButtonProps={
        disabled
          ? false
          : {
              creatorButtonText: '新增触发条件',
              block: false,
              size: 'large',
            }
      }
      actionGuard={actionGuard as any}
      actionRef={actionRef}
      deleteIconProps={{
        Icon: (_) => {
          return disabled ? null : <DeleteOutlined {..._} style={{ color: 'red' }} />;
        },
      }}
      min={1}
      copyIconProps={false}
      itemRender={({ listDom, action }, { index }) => (
        <ProCard
          bordered
          style={{ marginBlockEnd: 8 }}
          extra={action}
          headStyle={{ width: '20px', position: 'absolute', right: 0, padding: 0 }}
          bodyStyle={{
            paddingBlockEnd: 0,
            marginRight: 20,
            border: '1px solid #f0f0f0',
            borderRadius: 4,
          }}
        >
          {listDom}
        </ProCard>
      )}
    >
      {(f, index, action) => {
        console.log(f, index, action, action.getCurrentRowData());
        const deviceIds = action.getCurrentRowData().deviceIds || [];
        return (
          <Row key="index">
            <Col span={24}>
              <ProForm.Item
                colon={false}
                name="value"
                label="设备离线时间"
                className={styles.formTime}
                labelCol={{ flex: '100px' }}
                rules={[
                  {
                    required: true,
                    message: '',
                  },
                ]}
              >
                {/* <div className={styles.formTime}> */}
                <ProFormDigit
                  name="value"
                  width={220}
                  placeholder="请输入离线时间"
                  fieldProps={{ precision: 0 }}
                  rules={[{ required: true, message: '请输入离线时间' }]}
                />
                <ProFormSelect
                  name="unit"
                  width={100}
                  initialValue={'m'}
                  valueEnum={{
                    m: '分钟',
                    h: '小时',
                  }}
                  rules={[{ required: true, message: '请选择' }]}
                />
                {/* </div> */}
              </ProForm.Item>
            </Col>
            <Col span={24}>
              <ProForm.Item
                colon={false}
                name="deviceIds"
                label="选择设备"
                labelCol={{ flex: '100px' }}
                rules={[{ required: true }]}
              >
                <Input
                  allowClear={true}
                  placeholder="请选择设备"
                  disabled={false}
                  value={`已选择${deviceIds.length}个设备`}
                  style={{ width: '320px' }}
                  onClick={(e) => {
                    onDevicesClick(e, action, deviceIds);
                  }}
                  readOnly
                />
              </ProForm.Item>
            </Col>
          </Row>
        );
      }}
      <DevicesModal
        open={deviceModalShow}
        disabled={disabled}
        onOpenChange={setDeviceModalShow}
        data={modalData}
        selectKeys={selectKeys}
        onDoubleClick={onDoubleClick}
      />
    </ProFormList>
  );
};

export default TriggerCard;
