import React, { useEffect, useRef, useState } from 'react';
import {
  ProFormDateTimeRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import Upload from 'antd/es/upload';
import Method from '@/utils/Method';
import { face } from '@/components/FileUpload/business';
import styles from './style.less';
import { SearchOutlined, CloudUploadOutlined } from '@ant-design/icons';
import UserModal from './user-modal';
import { addVisitor, repeatVisitor, visitApplyDetail } from '@/services/door';
import dayjs from 'dayjs';
import { generateGetUrl } from '@/services/file';
import DrawerForm from '@/components/DrawerFormCount';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data?: any;
  isEdit: boolean;
};

const beforeUpload = async (file: any) => {
  // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
  const isFormat =
    file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
  // 校验图片大小
  const is5M = file.size / 1024 / 1024 < 10;

  if (!isFormat) {
    message.error('仅支持jpg，jpeg，png格式的图片');
    return Upload.LIST_IGNORE;
  } else if (!is5M) {
    message.error('图片不能超过10M,请重新选择图片');
    return Upload.LIST_IGNORE;
  }
  // 压缩到100k以内
  const files = await Method.compressorImageBySize(file, 100);
  // 转换格式
  const newImg = new File([files], Method.getUuid() + '.jpg', { type: 'image/jpg' });
  // console.log(newImg);

  console.log(`压缩后`, `${newImg.size / 1024}kb`);
  return Promise.resolve(newImg);
};

const disabledDate: any = (current: any) => {
  return current && current < dayjs().startOf('minute');
};

const Add: React.FC<IProps> = ({ open, onOpenChange, onSubmit, data, isEdit }) => {
  const formRef = useRef<ProFormInstance>();
  const [title, setTitle] = useState<string>('新增访客邀约');
  const [visitorFacePic, setVisitorFacePic] = useState<string>();
  const [appendix, setAppendix] = useState<string>();
  const [userModalShow, setUserModalShow] = useState<boolean>(false);

  const queryList = async (passingAreaId: string) => {
    const res = await visitApplyDetail(passingAreaId);
    if (res.code == 'SUCCESS') {
      if (data.visitorFacePic) {
        setVisitorFacePic(data.visitorFacePic);
        const urlRes = await generateGetUrl({
          bussinessId: face.id,
          urlList: [
            {
              objectId: data.visitorFacePic,
            },
          ],
        });
        data.faceImg = [
          {
            url: urlRes.data.urlList[0].presignedUrl.url,
          },
        ];
      }
      if (data.appendix) {
        setAppendix(data.appendix);
        const urlRes = await generateGetUrl({
          bussinessId: face.id,
          urlList: [
            {
              objectId: data.appendix,
            },
          ],
        });
        data.file = [
          {
            url: urlRes.data.urlList[0].presignedUrl.url,
          },
        ];
      }
      formRef?.current?.setFieldsValue({
        ...data,
        dateRange: [data.limitStartTime, data.limitEndTime],
      });
    }
  };

  useEffect(() => {
    if (open === true) {
      formRef?.current?.resetFields();
      setTitle('新增访客邀约');
      if (isEdit) {
        setTitle('查看邀约记录');
        queryList(data.id);
      }
    }
  }, [open]);

  const onDoubleClick = (row: any) => {
    formRef?.current?.setFieldsValue({
      ownerName: row.name,
      ownerPhoneNo: row.phone,
      ownerRoomAddress: row.house,
      enterprise: row.org,
    });
  };

  const onCheckDate = async () => {
    const visitorPhoneNo = formRef?.current?.getFieldsValue()?.visitorPhoneNo;
    const dateRange = formRef?.current?.getFieldsValue()?.dateRange;
    if (!visitorPhoneNo || !dateRange || dateRange.length !== 2) {
      return;
    }
    const res = await repeatVisitor({
      visitorPhoneNo,
      limitStartTime: dayjs(dateRange[0]).format('YYYY-MM-DD'),
      limitEndTime: dayjs(dateRange[1]).format('YYYY-MM-DD'),
    });
    if (res.code === 'SUCCESS' && res.data && res.data.length > 0) {
      Modal.confirm({
        title: '访客在该时间段已有预约记录，请修改预约时间段',
        okText: '确定',
        cancelText: '取消',
        centered: true,
        onCancel: () => {
          formRef?.current?.setFieldsValue({
            dateRange: null,
          });
        },
        onOk: async () => {
          formRef?.current?.setFieldsValue({
            dateRange: null,
          });
        },
      });
    }
  };

  // 提交
  const onFinish = async (values: any) => {
    console.log('values', values);
    try {
      values.visitorFacePic = visitorFacePic;
      values.appendix = appendix;
      values.limitStartTime = values.dateRange[0];
      values.limitEndTime = values.dateRange[1];
      // 是否不需要审核
      values.isNotApproval = true;
      // 是否下发人脸
      values.isFaceAuth = true;
      // 是否二维码
      values.isQrcodeAuth = true;
      // 是否发短信
      values.isSendSms = true;
      // 是否下发车辆权限
      values.isCarAuth = true;
      const res = await addVisitor(values);
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
    <>
      <DrawerForm
        colon={isEdit}
        labelCol={{ flex: isEdit ? '112px' : '80px' }}
        formRef={formRef}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={480}
        title={title}
        open={open}
        readonly={isEdit}
        className={isEdit ? styles.formItem : ''}
        drawerProps={{
          bodyStyle: { paddingRight: '50px' },
        }}
        labelAlign={isEdit ? 'left' : 'right'}
        submitter={{
          searchConfig: {
            resetText: isEdit ? '返回' : '取消', //修改ProForm重置文字
          },
          submitButtonProps: {
            style: {
              // 隐藏提交按钮
              display: isEdit ? 'none' : undefined,
            },
          },
        }}
        onFinish={onFinish}
      >
        <h3 style={{ fontWeight: 'bold' }}>被访人员信息</h3>
        <div className={styles.proText}>
          <ProFormText
            label="人员姓名"
            rules={[
              {
                required: !isEdit,
                message: '请选择人员',
              },
            ]}
            placeholder="请选择人员"
            disabled
            name="ownerName"
          />
          {isEdit ? null : (
            <Button onClick={() => setUserModalShow(true)} icon={<SearchOutlined />} />
          )}
        </div>
        <ProFormText
          name="ownerPhoneNo"
          label="手机号码"
          validateTrigger="onBlur"
          placeholder={'选择人员可查看'}
          disabled
          rules={[
            {
              required: !isEdit,
              message: '请输入手机号',
            },
          ]}
        />
        <ProFormText name="enterprise" label="所属部门" disabled placeholder="选择人员可查看" />
        <ProFormText
          name="ownerRoomAddress"
          label="关联房产"
          disabled
          placeholder="选择人员可查看"
        />
        <h3 style={{ fontWeight: 'bold' }}>访客信息</h3>
        <ProFormText
          name="visitorName"
          label="访客姓名"
          placeholder="请输入访客姓名"
          rules={[
            {
              required: !isEdit,
              message: '请输入访客姓名',
            },
          ]}
        />
        <ProFormText
          name="visitorPhoneNo"
          label="手机号码"
          validateTrigger="onBlur"
          placeholder={'请输入手机号'}
          fieldProps={{
            maxLength: 11,
            onChange: (value) => {
              onCheckDate();
            },
          }}
          rules={[
            {
              required: !isEdit,
              message: '请输入手机号',
            },
            {
              pattern: /^1[3456789]\d{9}$/,
              message: '手机号格式错误',
            },
          ]}
        />
        <ProFormText
          name="visitingCompany"
          label="来访单位"
          placeholder="请输入来访单位"
          rules={[
            {
              required: !isEdit,
              message: '请输入来访单位',
            },
          ]}
        />
        <ProFormDateTimeRangePicker
          name="dateRange"
          label="授权期限"
          width="lg"
          fieldProps={{
            disabledDate,
            onChange: () => {
              onCheckDate();
            },
          }}
          rules={[
            {
              required: !isEdit,
              message: '请选择授权期限',
            },
          ]}
          placeholder={['开始时间', '结束时间']}
        />
        <ProFormSelect
          label="来访目的"
          placeholder="请选择来访目的"
          rules={[{ required: !isEdit, message: '请选择' }]}
          name="visitorReason"
          options={[
            {
              value: '01',
              label: '快递',
            },
            {
              value: '02',
              label: '外卖',
            },
            {
              value: '03',
              label: '送货',
            },
            {
              value: '04',
              label: '搬家',
            },
            {
              value: '05',
              label: '亲友',
            },
            {
              value: '06',
              label: '商业访问',
            },
            {
              value: '07',
              label: '了解需求',
            },
            {
              value: '08',
              label: '签约下单',
            },
            {
              value: '09',
              label: '拜访约见',
            },
            {
              value: '99',
              label: '其他',
            },
          ]}
        />
        <ProFormText name="visitorCarNo" label="车牌号码" placeholder="请输入车牌号码" />
        {isEdit && !visitorFacePic ? (
          <ProFormText name="faceImg" label="人脸照片" />
        ) : (
          <ProFormUploadButton
            label="人脸照片"
            max={1}
            name="faceImg"
            icon={<CloudUploadOutlined />}
            disabled={isEdit}
            extra={isEdit ? null : '仅支持jpeg，jpg，png格式， 大小不超过100Kb'}
            fieldProps={{
              name: 'file',
              listType: 'picture-card',
              maxCount: 1,
              beforeUpload: beforeUpload,
              accept: 'image/*',
              customRequest: async (options: any) => {
                const { onSuccess, file, onError } = options;
                Method.uploadFile(file, face)
                  .then((url: any) => {
                    const _response = { name: file.name, status: 'done', path: url };
                    setVisitorFacePic(url);
                    onSuccess(_response, file);
                  })
                  .catch((err) => {
                    onError();
                    message.error(err);
                  });
              },
            }}
          />
        )}
        <div className={styles.uploadFile}>
          {isEdit && !appendix ? (
            <ProFormText name="file" label="附件" />
          ) : (
            <ProFormUploadButton
              label="附件"
              max={1}
              name="file"
              disabled={isEdit}
              fieldProps={{
                name: 'file',
                maxCount: 1,
                // beforeUpload: beforeUpload,
                // accept: 'image/*',
                customRequest: async (options: any) => {
                  const { onSuccess, file, onError } = options;
                  Method.uploadFile(file, face)
                    .then((url: any) => {
                      const _response = { name: file.name, status: 'done', path: url };
                      setAppendix(url);
                      onSuccess(_response, file);
                    })
                    .catch((err) => {
                      onError();
                      message.error(err);
                    });
                },
              }}
            />
          )}
        </div>
        <UserModal
          open={userModalShow}
          onOpenChange={setUserModalShow}
          onDoubleClick={onDoubleClick}
        />
      </DrawerForm>
    </>
  );
};

export default Add;
