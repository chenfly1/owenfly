// import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Button, Card, Col, Row, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import { passageQrcode } from '@/services/park';
import { Method } from '@/utils';
// import styles from './style.less';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
};

const passType = [
  {
    label: '入口',
    value: '1',
  },
  {
    label: '出口',
    value: '2',
  },
  {
    label: '出入口',
    value: '3',
  },
];

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  // const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}' as string);
  const [qrList, setQrList] = useState<Record<string, any>>([]);
  const id = data?.id;
  const [qrType, setQrType] = useState<string>('WP');

  const changeCanvasToPic = () => {
    const canvasImg = document.getElementById('qrCode') as HTMLCanvasElement; // 获取canvas类型的二维码
    const img = new Image();
    img.src = canvasImg?.toDataURL('image/png'); // 将canvas对象转换为图片的data url
    const downLink = document.getElementById('down_link') as any;
    downLink.href = img.src;
    downLink.download = '二维码'; // 图片name
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('通道二维码');
      if (id) {
        passageQrcode({ id, qrType: qrType }).then((res) => {
          const temList = res.data.map((item: any) => {
            const label =
              (passType.find((i) => i.value === item.passageType) || {}).label + '二维码';
            return { label, qrCode: item.qrCode };
          });
          setQrList(temList);
          formRef?.current?.setFieldsValue({
            ...data,
          });
        });
      }
    } else {
      setQrType('WP');
    }
  }, [open, qrType]);
  return (
    <ModalForm
      {...rest}
      modalProps={{
        centered: true,
      }}
      colon={false}
      labelCol={{ flex: '78px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={500}
      title={title}
      formRef={formRef}
      open={open}
      submitter={{
        searchConfig: {
          resetText: '关闭', //修改ProForm重置文字
        },
        render: (props, dom) => {
          return dom[0];
        },
      }}
    >
      <ProFormText
        name="parkName"
        readonly={true}
        // width={300}
        label="车场名称"
        placeholder="车场名称"
      />
      <ProFormText name="parkCode" label="车场编号" readonly={true} placeholder="车场编号" />
      <ProFormText name="areaName" label="所属区域" readonly={true} placeholder="请输入所属区域" />
      <ProFormText name="name" label="通道名称" readonly={true} placeholder="请输入通道名称" />
      <ProFormSelect
        name="qrType"
        label="二维码类型"
        readonly={false}
        options={[
          {
            label: '小程序',
            value: 'WP',
          },
          {
            label: 'H5',
            value: 'H5',
          },
        ]}
        fieldProps={{
          value: qrType,
          onChange: (newVal) => {
            setQrType(newVal);
          },
        }}
      />
      {qrList.map((item: any) => (
        <Card
          bordered
          key={item.qrCode}
          bodyStyle={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div>
            <QRCode
              id="qrCode"
              value={item.qrCode}
              size={200} // 二维码的大小
              fgColor="#000000" // 二维码的颜色
              style={{ margin: '10px auto' }}
              imageSettings={{
                // 二维码中间的logo图片
                src: 'logoUrl',
                height: 100,
                width: 100,
                excavate: true, // 中间图片所在的位置是否镂空
              }}
            />
            <div style={{ width: '200px', display: 'flex', justifyContent: 'space-between' }}>
              <a
                onClick={() => {
                  Method.copyText(item.qrCode);
                }}
              >
                复制路径
              </a>
              <a>
                <a id="down_link" onClick={changeCanvasToPic}>
                  下载二维码
                </a>
              </a>
            </div>
          </div>
        </Card>
        // <Row key={item.qrCode} style={{ flexFlow: 'row nowrap' }}>
        //   <Col flex="140px" style={{ textAlign: 'right' }}>
        //     {`${item.label}：`}
        //   </Col>
        //   <Col flex="0 0 200px">
        //     <Tooltip title={item.qrCode}>
        //       <div
        //         style={{
        //           whiteSpace: 'nowrap',
        //           overflow: 'hidden',
        //           textOverflow: 'ellipsis',
        //           width: '200px',
        //         }}
        //       >
        //         {item.qrCode}
        //       </div>
        //     </Tooltip>

        //     <div style={{ textAlign: 'center', marginBlockStart: '30px' }}>
        //       <Button type="primary">
        //         <a id="down_link" onClick={changeCanvasToPic}>
        //           下载
        //         </a>
        //       </Button>
        //     </div>
        //   </Col>
        // </Row>
      ))}
    </ModalForm>
  );
};

export default Add;
