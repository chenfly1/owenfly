import React, { useEffect, useRef, useState } from 'react';
import {
  DrawerForm,
  ProFormText,
  ProFormItem,
  ProFormSelect,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import OssImage from '@/components/OssImage';
import { staffBusiness } from '@/components/FileUpload/business';
import { history } from 'umi';
import { addStaff, getStaffDetails, updateStaff } from '@/services/base';
import { TreeSelect, Upload, message } from 'antd';
import { getStaffTree } from '@/components/DepartmentTree/service';
import FileUpload from '@/components/FileUpload';
import { Method } from '@/utils';
import { generateGetUrl } from '@/services/file';

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSubmit: () => void;
};

const Add: React.FC<IProps> = ({ open, onOpenChange, data, onSubmit }) => {
  const [orgTreeData, setOrgTreeData] = useState<Record<string, any>[]>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const formRef = useRef<ProFormInstance>();
  const [objectId, setObjectId] = useState<string>('');

  const getTeeData = async () => {
    const res = await getStaffTree({
      // projectId: project.bid,
    });
    setOrgTreeData(res.data);
  };
  const getUrl = async (id: string) => {
    const res = await generateGetUrl({
      bussinessId: staffBusiness.id,
      urlList: [
        {
          objectId: id,
        },
      ],
    });
    return res.data.urlList[0].presignedUrl.url;
  };

  useEffect(() => {
    formRef?.current?.resetFields();
    getTeeData();
    if (open) {
      if (data?.id) {
        getStaffDetails(data?.id).then(async (res) => {
          if (res.data.headPortrait) {
            setObjectId(res.data.headPortrait);
            const url = await getUrl(res.data.headPortrait);
            formRef?.current?.setFieldsValue({
              icon: [{ url }],
            });
          }
          formRef?.current?.setFieldsValue({
            ...res.data,
          });
        });
      }
    } else {
      setObjectId('');
    }
  }, [open]);

  // 提交
  const onFinish = async (values: any) => {
    let res: any;
    if (data?.id) {
      res = await updateStaff({ ...values, id: data?.id, headPortrait: objectId });
    } else {
      res = await addStaff({ ...values, headPortrait: objectId, source: 1 });
    }
    if (res.code === 'SUCCESS') {
      message.success('操作成功');
      onSubmit();
    }
  };

  return (
    <DrawerForm
      labelCol={{ flex: '110px' }}
      formRef={formRef}
      layout="horizontal"
      colon={false}
      onOpenChange={onOpenChange}
      width={550}
      title="员工详情"
      open={open}
      readonly={data?.readonly}
      onFinish={onFinish}
      submitter={{
        searchConfig: {
          resetText: '返回', //修改ProForm重置文字
        },
        // submitButtonProps: {
        //   style: {
        //     // 隐藏提交按钮
        //     display: 'none',
        //   },
        // },
      }}
      onReset={() => history.goBack()}
    >
      <ProFormText
        name="name"
        label="员工姓名"
        required={true}
        fieldProps={{
          showCount: true,
          maxLength: 20,
        }}
      />
      <ProFormSelect
        label="性别"
        name="sex"
        options={[
          {
            value: 1,
            label: '男',
          },
          {
            value: 2,
            label: '女',
          },
        ]}
      />
      {/* <ProFormText label="所属部门" name="orgName" required={true} /> */}
      <ProFormItem
        label="所属部门"
        rules={[
          {
            required: true,
          },
        ]}
        name="orgIds"
      >
        <TreeSelect
          treeLine={true}
          multiple
          treeDefaultExpandAll={true}
          disabled={data?.readonly}
          treeData={orgTreeData}
          fieldNames={{
            label: 'name',
            value: 'id',
          }}
          treeCheckable={true}
          showCheckedStrategy={TreeSelect.SHOW_PARENT}
          placeholder="请选择所属组织"
          treeNodeFilterProp="title"
        />
      </ProFormItem>
      <ProFormText
        label="手机号"
        name="mobile"
        rules={[
          { required: true },
          {
            pattern: /^1[356789]\d{9}$/,
            message: '手机号格式错误',
          },
        ]}
      />
      <ProFormText label="工号" name="empNo" />
      <ProFormText
        label="车牌号码"
        name="carNum"
        placeholder="请输入车牌号码"
        rules={[
          {
            pattern:
              /(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}[A-Z0-9]{1}$)|(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$)/,
            message: '格式不正确',
          },
        ]}
      />
      <ProFormSelect
        label="在离职状态"
        name="status"
        required={true}
        options={[
          {
            value: 1,
            label: '在职',
          },
          {
            value: 2,
            label: '离职',
          },
          {
            value: 3,
            label: '未入职',
          },
          {
            value: 4,
            label: '未知',
          },
        ]}
      />
      <ProFormSelect
        label="证件类型"
        name="idType"
        options={[
          {
            value: 1,
            label: '身份证',
          },
          {
            value: 2,
            label: '港澳通行证',
          },
          {
            value: 3,
            label: '港澳居民来往内地通行证',
          },
          {
            value: 4,
            label: '外国户照',
          },
          {
            value: 5,
            label: '台湾居民来往大陆通行证',
          },
        ]}
      />
      <ProFormText label="证件号码" name="idNo" />
      {data?.id && <ProFormDateTimePicker readonly label="创建时间" name="gmtCreated" />}
      <ProFormItem
        label="人脸照片"
        name="icon"
        valuePropName="fileList"
        extra="仅支持jpeg，jpg，png格式， 大小不超过5M"
        getValueFromEvent={(e: any) => {
          return e?.fileList;
        }}
      >
        <FileUpload
          buttonText="上传图片"
          fileType="avatar"
          disabled={data?.readonly}
          cropImgProps={{
            rotationSlider: true,
          }}
          listType="picture-card"
          beforeUpload={async (file: any) => {
            // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
            const isFormat =
              file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
            // 校验图片大小
            const is20M = file.size / 1024 / 1024 < 5;
            if (!isFormat) {
              message.error('仅支持jpg，jpeg，png格式的图片');
              return Upload.LIST_IGNORE;
            } else if (!is20M) {
              message.error('图片不能超过5M,请重新选择图片');
              return Upload.LIST_IGNORE;
            }
            return isFormat && is20M;
          }}
          customRequest={async (options: any) => {
            const { onSuccess, file } = options;
            const newImage = await Method.compressorImageBySize(file, 100);
            Method.uploadFile(newImage, staffBusiness).then((url: any) => {
              const _response = { name: newImage.name, status: 'done', path: url };
              setObjectId(url);
              onSuccess(_response, newImage);
            });
          }}
          onRemove={() => {
            setObjectId('');
          }}
          business={staffBusiness}
        />
      </ProFormItem>
    </DrawerForm>
  );
};

export default Add;
