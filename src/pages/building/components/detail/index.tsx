import { alitaParkingLicense } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { passageRecord } from '@/services/park';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormItem,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Col, Image, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const Detail: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange, data }) => {
  const [title, setTitle] = useState<string>();
  const [enterUrl, setEnterUrl] = useState<string>('');
  const [exiterUrl, setExiterUrl] = useState<string>('');
  const formRef = useRef<ProFormInstance>();
  const id = data?.id;
  const [isShow, setIsShow] = useState(false);

  const passageModeEnum = {
    0: '未知',
    1: '自动放行',
    2: '确认放行',
    3: '异常放行',
    4: '遥控开闸',
    5: '自助开闸',
    6: '可疑跟车',
    7: '盘点进场',
    8: '离线自动放行',
    9: '离线遥控放行',
    98: '盘点离场',
    99: '虚拟放行',
    // 离场放行方式 0未知，1自动放行，2确认放行，3异常放行，4遥控开闸，5自助开闸，6可疑跟车，7盘点进场，8离线自动放行，9离线遥控放行，98盘点离场，99虚拟放行
  };

  const getImageSrc = async (objectId: string) => {
    const res = await generateGetUrl({
      bussinessId: alitaParkingLicense.id,
      urlList: [
        {
          objectId: objectId,
        },
      ],
    });
    return res?.data?.urlList[0]?.presignedUrl?.url;
  };

  const queryDetail = async () => {
    const res = await passageRecord({
      pageNo: 1,
      pageSize: 1,
      id,
    });
    const row = res.data.items[0];
    // if (row.entryImage) {
    //   const src = await getImageSrc(row.entryImage);
    //   setEnterUrl(src);
    // }
    // if (row.exitImage) {
    //   const src = await getImageSrc(row.exitImage);
    //   setExiterUrl(src);
    // }
    formRef?.current?.setFieldsValue({
      ...row,
    });
  };

  useEffect(() => {
    if (open) {
      setTitle('查看详情');
      setIsShow(data?.type === 'abnormal');
      formRef?.current?.resetFields();
      // queryDetail();
    }
  }, [open]);

  const getImage = (type: string) => {
    if (enterUrl) {
      return (
        <Image
          src={type === 'eneter' ? enterUrl : exiterUrl}
          style={{ width: '200px', height: '200px' }}
        />
      );
    } else {
      return '-';
    }
  };

  return (
    <DrawerForm
      colon={false}
      labelCol={{ flex: '120px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={1000}
      title={title}
      formRef={formRef}
      open={open}
      submitter={false}
    >
      <h3 className={styles.tikTitle}>
        <div />
        设备信息
      </h3>
      <Row>
        <Col span={12}>
          <ProFormText label="设备编号" name="plateNumber" readonly={true} />
        </Col>
        <Col span={12}>
          <ProFormText label="设备名称" name="parkName" readonly={true} />
        </Col>
        <Col span={12}>
          <ProFormText label="备注名" name="parkName" readonly={true} />
        </Col>
        <Col span={12}>
          <ProFormText label="设备位置" name="parkName" readonly={true} />
        </Col>
        <Col span={12}>
          <ProFormSelect
            label="网络状态"
            readonly={true}
            name="parkName"
            options={[
              {
                label: '在线',
                value: 1,
              },
              {
                label: '离线',
                value: 0,
              },
            ]}
          />
        </Col>
      </Row>
      <h3 className={styles.tikTitle}>
        <div />
        运行信息
      </h3>
      <Row>
        <Col span={12}>
          <ProFormSelect
            label="运行状态"
            name="plateNumber"
            readonly={true}
            options={[
              {
                label: '停止',
                value: 0,
              },
              {
                label: '正常',
                value: 1,
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            label="故障状态"
            name="plateNumber"
            readonly={true}
            options={[
              {
                label: '故障',
                value: 0,
              },
              {
                label: '正常',
                value: 1,
              },
            ]}
          />
        </Col>
        <Col span={24}>
          <ProFormSelect
            label="自动状态"
            readonly={true}
            name="plateNumber"
            options={[
              {
                label: '手动',
                value: 0,
              },
              {
                label: '自动',
                value: 1,
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            label="风机压差激活状态"
            readonly={true}
            name="plateNumber"
            options={[
              {
                label: '未激活',
                value: 0,
              },
              {
                label: '已激活',
                value: 1,
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            label="过滤网报警"
            readonly={true}
            name="parkName"
            options={[
              {
                label: '堵塞',
                value: 1,
              },
              {
                label: '通畅',
                value: 0,
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormText label="送风温度" readonly={true} name="parkName" />
        </Col>
        <Col span={12}>
          <ProFormText label="回风温度" readonly={true} name="parkName" />
        </Col>
        <Col span={12}>
          <ProFormText label="送风阀反馈" readonly={true} name="parkName" />
        </Col>
        <Col span={12}>
          <ProFormText label="回风阀反馈" readonly={true} name="parkName" />
        </Col>
        <Col span={12}>
          <ProFormText label="水阀反馈" readonly={true} name="parkName" />
        </Col>
        <Col span={12}>
          <ProFormText label="变频反馈" readonly={true} name="parkName" />
        </Col>
      </Row>
      <h3 className={styles.tikTitle}>
        <div />
        控制设备
      </h3>
      <Row>
        <Col span={12}>
          <ProFormSwitch
            checkedChildren={'自动'}
            unCheckedChildren={'手动'}
            label="控制模式"
            name="parkName"
          />
        </Col>
        <Col span={12}>
          <ProFormSwitch
            checkedChildren={'开'}
            unCheckedChildren={'关'}
            label="开关控制"
            name="parkName"
          />
        </Col>
      </Row>
    </DrawerForm>
  );
};

export default Detail;
