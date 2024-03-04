import FileUpload from '@/components/FileUpload';
import { alitaParkingLicense } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import {
  platformVehicleCreate,
  platformVehicleDetail,
  platformVehicleModify,
  queryUser,
} from '@/services/park';
import { DeleteOutlined } from '@ant-design/icons';
import type { FormListActionType, ProFormInstance } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { ProCard, ProFormList } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CarTypeEnum } from '../data.d';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

const Add: React.FC<IProps & Record<string, any>> = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  readonly,
  ...rest
}) => {
  const [title, setTitle] = useState<string>();
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}');
  const id = data?.relId;
  const [maxLength, setMaxLength] = useState<number>(20);
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('新增车辆');
      formRef?.current?.setFieldsValue({
        userType: 1,
        plates: [{}],
        staffId: '',
      });
      setMaxLength(10);
      if (id) {
        if (readonly) {
          setTitle('查看车辆');
        } else {
          setTitle('编辑车辆');
        }
        setMaxLength(1);
        platformVehicleDetail(id).then(async (res) => {
          if (res.code === 'SUCCESS') {
            let imageUrl: any[] = [];
            if (res.data.imageUrl) {
              const urlRes = await generateGetUrl({
                bussinessId: alitaParkingLicense.id,
                urlList: [
                  {
                    objectId: res.data.imageUrl as string,
                  },
                ],
              });
              imageUrl = [{ url: urlRes?.data?.urlList[0]?.presignedUrl?.url }];
            }
            formRef?.current?.setFieldsValue({
              name: res.data.name,
              mobile: res.data.mobile,
              userType: res.data.userType,
              staffId: res.data.staffId,
              plates: [
                {
                  ...res.data,
                  imageUrl,
                },
              ],
            });
          }
        });
      }
    }
  }, [open]);
  const onFinish = async () => {
    const formData = formRef?.current?.getFieldFormatValueObject!();
    let res;
    // 编辑
    if (id) {
      const plate = formData.plates[0];
      const params = {
        id,
        ...plate,
        name: formData.name,
        mobile: formData.mobile,
        staffId: formData.staffId,
        userType: formData.userType,
        imageUrl: plate.objectId || null,
      };
      res = await platformVehicleModify(params);
    } else {
      //新增
      const params = {
        projectId: project.bid,
        name: formData.name,
        mobile: formData.mobile,
        staffId: formData.staffId,
        userType: formData.userType,
        plates: formData.plates.map((item: any) => {
          return {
            ...item,
            imageUrl: item.objectId,
          };
        }),
      };
      // 新增
      res = await platformVehicleCreate(params);
    }
    if (res?.code === 'SUCCESS') {
      if (!id) {
        message.success('创建成功');
      } else {
        message.success('更新成功');
      }
      onSubmit();
      return true;
    } else {
      return false;
    }
  };
  // 项目变化
  // const   = (bid: string, item: ProjectListType) => {
  //   formRef.current?.setFieldsValue({
  //     area: item.region ? [item.province, item.city, item.region] : [item.province, item.city],
  //     address: item.address,
  //     projectBid: item.bid,
  //   });
  // };

  const queryUserList = async (e: any) => {
    if (e.keyWords) {
      const res = await queryUser({
        name: e.keyWords,
      });
      return res.data.map((item: any) => ({
        ...item,
        label: `${item.name} (${item.mobile})`,
        value: item.staffId,
      }));
    }
  };

  const resetPersonField = () => {
    formRef.current?.setFieldValue('name', '');
    formRef.current?.setFieldValue('mobile', '');
    formRef.current?.setFieldValue('staffId', '');
  };

  return (
    <>
      <DrawerForm
        colon={readonly}
        {...rest}
        labelCol={{ flex: '120px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        submitter={readonly ? false : undefined}
        onFinish={onFinish}
        initialValues={{
          address: project.address,
          projectBid: project.bid,
        }}
        // request={async () => {
        //   return {
        //     area: `${project.province}/${project.city}/${project.region}`,
        //     address: project.address,
        //     projectBid: project.bid,
        //   };
        // }}
      >
        <h3 style={{ fontWeight: 'bold' }}>车主信息</h3>
        <ProFormSelect
          label="车主类型"
          colon={readonly || !!id}
          name="userType"
          width={300}
          readonly={readonly}
          placeholder="请选择车主类型"
          rules={[{ required: true }]}
          fieldProps={{
            onChange: () => {
              resetPersonField();
            },
          }}
          options={[
            {
              label: '业主',
              value: 1,
            },
            {
              label: '员工',
              value: 2,
            },
          ]}
        />
        <ProFormDependency name={['userType']}>
          {({ userType }) => {
            if (userType === 1) {
              // 业主
              return (
                <>
                  <ProFormText
                    label="车主姓名"
                    colon={readonly || !!id}
                    name="name"
                    width={300}
                    readonly={readonly}
                    placeholder="请输入车主姓名"
                    fieldProps={{
                      maxLength: 20,
                      showCount: true,
                    }}
                    rules={[{ required: true }]}
                  />
                  <ProFormText
                    label="车主手机号"
                    colon={readonly || !!id}
                    name="mobile"
                    width={300}
                    validateTrigger="onBlur"
                    readonly={readonly}
                    placeholder="请输入车主手机号"
                    rules={[
                      { required: true },
                      {
                        pattern: /^1[356789]\d{9}$/,
                        message: '手机号格式错误',
                      },
                    ]}
                  />
                </>
              );
            } else {
              return (
                <>
                  <ProFormSelect
                    label="车主姓名"
                    colon={readonly || !!id}
                    name="name"
                    width={300}
                    readonly={readonly}
                    placeholder="请选择员工姓名"
                    // fieldProps={{
                    //   maxLength: 20,
                    //   showCount: true,
                    // }}
                    request={queryUserList}
                    debounceTime={500}
                    fieldProps={{
                      showSearch: true,
                      labelInValue: true,
                      onChange: (val) => {
                        if (val) {
                          formRef.current?.setFieldsValue({
                            name: val.name,
                            mobile: val.mobile,
                            staffId: val.staffId,
                          });
                        } else {
                          resetPersonField();
                        }
                      },
                    }}
                    rules={[{ required: true }]}
                  />
                  <ProFormText
                    label="车主手机号"
                    colon={readonly || !!id}
                    name="mobile"
                    width={300}
                    validateTrigger="onBlur"
                    readonly={true}
                    placeholder="请选择车主手机号"
                    rules={[
                      { required: true },
                      {
                        pattern: /^1[356789]\d{9}$/,
                        message: '手机号格式错误',
                      },
                    ]}
                  />
                </>
              );
            }
          }}
        </ProFormDependency>
        <h3 style={{ fontWeight: 'bold' }}>车辆信息</h3>
        <ProFormList
          actionRef={actionRef}
          name="plates"
          deleteIconProps={{
            Icon: (_) => {
              return <DeleteOutlined {..._} style={{ color: 'red' }} />;
            },
          }}
          creatorButtonProps={{
            creatorButtonText: '新增车牌',
          }}
          min={1}
          max={maxLength}
          copyIconProps={false}
          itemRender={({ listDom, action }, { index }) => (
            <ProCard
              bordered
              style={{ marginBlockEnd: 8 }}
              title={maxLength > 1 ? `车辆${index + 1}` : false}
              extra={action}
              bodyStyle={{ paddingBlockEnd: 0 }}
            >
              {listDom}
            </ProCard>
          )}
        >
          {(f, index, action) => {
            return (
              <>
                <ProFormText
                  label="车牌号码"
                  labelCol={{ flex: '96px' }}
                  name="plate"
                  // validateTrigger="onBlur"
                  width={300}
                  readonly={readonly || id}
                  placeholder="请输入车牌号码"
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern:
                        /(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}[A-Z0-9]{1}$)|(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$)/,
                      message: '格式不正确',
                    },
                  ]}
                />
                <ProFormSelect
                  name="vehicleType"
                  labelCol={{ flex: '96px' }}
                  width={300}
                  label="车辆类型"
                  readonly={readonly}
                  rules={[{ required: true }]}
                  placeholder="请选择车辆类型"
                  request={async () => {
                    return Object.entries(CarTypeEnum).map((item) => {
                      return {
                        label: item[1].text,
                        value: item[0],
                      };
                    });
                  }}
                />
                <ProFormText
                  label="品牌"
                  labelCol={{ flex: '96px' }}
                  name="model"
                  width={300}
                  readonly={readonly}
                  placeholder="请输入品牌"
                  // rules={[{ required: true }]}
                />
                {/* <ProFormSelect
                  labelCol={{ flex: '96px' }}
                  width={300}
                  label="品牌1"
                  readonly={readonly}
                  rules={[{ required: true }]}
                  placeholder="请选择车辆类型"
                  request={async () => {
                    return request(
                      'https://www.autohome.com.cn/ashx/AjaxIndexCarFind.ashx?type=11',
                      {
                        method: 'GET',
                      },
                    ).then((res) => {
                      console.log('res: ', res);
                    });
                  }}
                /> */}
                <ProFormText
                  label="颜色"
                  labelCol={{ flex: '96px' }}
                  name="color"
                  width={300}
                  readonly={readonly}
                  placeholder="请输入颜色"
                  // rules={[{ required: true }]}
                />
                <ProFormItem
                  name="imageUrl"
                  label="行驶证"
                  labelCol={{ flex: '96px' }}
                  valuePropName="fileList"
                  extra="仅支持png，jpeg，jpg 格式文件"
                  getValueFromEvent={(e: any) => {
                    console.log('Upload event:', e);
                    const file = e.file;
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                    if (!isJpgOrPng && file.status === 'uploading') {
                      message.error('仅支持jpg，jpeg，png格式的图片');
                    }
                    const isLt10M = file.size && file.size / 1024 / 1024 < 10;
                    if (!isLt10M && file.status === 'uploading') {
                      message.error('图片不能超过10M,请重新选择图片');
                    }
                    if (isJpgOrPng && isJpgOrPng) {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }
                  }}
                >
                  <FileUpload
                    buttonText="上传图片"
                    fileType="avatar"
                    disabled={readonly}
                    listType="picture-card"
                    onUploadSuccess={(objectIdCd: string) => {
                      action.setCurrentRowData({
                        objectId: objectIdCd,
                      });
                    }}
                    onRemove={() => {
                      action.setCurrentRowData({
                        objectId: '',
                      });
                    }}
                    business={alitaParkingLicense}
                  />
                </ProFormItem>
              </>
            );
          }}
        </ProFormList>
      </DrawerForm>
    </>
  );
};

export default Add;
