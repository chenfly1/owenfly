import FileUpload from '@/components/FileUpload';
import { alitaParkingLicense } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { merchantCreatUpdate, merchantDetail } from '@/services/park';
import { DeleteOutlined } from '@ant-design/icons';
import type { FormListActionType, ProFormInstance, CaptFieldRef } from '@ant-design/pro-components';
import { ProFormTextArea } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProCard, ProFormList } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Upload, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import VerifyCodeModal from './verifyCode/index';
import dayjs from 'dayjs';
import { Method } from '@/utils';

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
  const [modalData, setModalData] = useState<Record<string, any>>();
  const [visit, setVisit] = useState<boolean>(false);
  const id = data?.id;
  const [objectId, setObjectId] = useState<string>();
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  const setDetailData = async () => {
    let img: any[] = [];
    if (data?.img) {
      const urlRes = await generateGetUrl({
        bussinessId: alitaParkingLicense.id,
        urlList: [
          {
            objectId: data?.img as string,
          },
        ],
      });
      img = [{ url: urlRes?.data?.urlList[0]?.presignedUrl?.url }];
      setObjectId(urlRes?.data?.urlList[0]?.presignedUrl?.url);
    }
    formRef?.current?.setFieldsValue({
      ...data,
      gmtCreated: dayjs(data?.gmtCreated).format('YYYY-MM-DD HH:mm:ss'),
      img,
    });
    if (!data?.adminsRel || data?.adminsRel.length === 0) {
      formRef?.current?.setFieldValue('adminsRel', [
        { accountName: undefined, mobile: undefined, verifyCode: undefined, status: 1 },
      ]);
    }
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('新增商家');
      formRef?.current?.setFieldsValue({
        adminsRel: [
          { accountName: undefined, mobile: undefined, verifyCode: undefined, status: 1 },
        ],
      });
      if (id) {
        // merchantDetail({ id: data.id }).then(async (res) => {
        //   if (res.code === 'SUCCESS') {
        //     let img: any[] = [];
        //     if (res.data.img) {
        //       const urlRes = await generateGetUrl({
        //         bussinessId: alitaParkingLicense.id,
        //         urlList: [
        //           {
        //             objectId: res.data.img as string,
        //           },
        //         ],
        //       });
        //       img = [{ url: urlRes?.data?.urlList[0]?.presignedUrl?.url }];
        //       setObjectId(urlRes?.data?.urlList[0]?.presignedUrl?.url);
        //     }
        //     formRef?.current?.setFieldsValue({
        //       ...res.data,
        //       gmtCreated: dayjs(res.data.gmtCreated).format('YYYY-MM-DD HH:mm:ss'),
        //       img,
        //     });
        //   }
        // });
        setDetailData();
      }
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    console.log(formData);
    let res;
    // 编辑
    if (id) {
      const params = {
        id: data?.id,
        merchantName: formData.merchantName,
        legalPerson: formData.legalPerson,
        mark: formData.mark,
        img: objectId,
        status: data.status,
        adminsRel: formData.adminsRel.map((item: any) => {
          return {
            ...item,
          };
        }),
      };
      res = await merchantCreatUpdate(params);
    } else {
      //新增
      const params = {
        merchantName: formData.merchantName,
        status: 1,
        legalPerson: formData.legalPerson,
        mark: formData.mark,
        img: objectId,
        adminsRel: formData.adminsRel,
      };
      // 新增
      res = await merchantCreatUpdate(params);
    }
    if (res?.code === 'SUCCESS') {
      if (res.data === '') {
        if (!id) {
          message.success('创建成功');
        } else {
          message.success('更新成功');
        }
        onSubmit();
        return true;
      } else {
        message.warning(res.data);
        return false;
      }
    } else {
      return false;
    }
  };

  const onModalSubmit = (formData: Record<string, any>, action: any) => {
    const row = action.getCurrentRowData();
    action.setCurrentRowData({ ...row, ...formData });
    setVisit(false);
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
      >
        <h3 style={{ fontWeight: 'bold' }}>商家信息</h3>
        <ProFormText
          label="商家名称"
          colon={readonly || !!id}
          name="merchantName"
          width={300}
          readonly={readonly}
          placeholder="请输入商家姓名"
          fieldProps={{
            maxLength: 20,
            showCount: true,
          }}
          rules={[{ required: true }]}
        />
        <ProFormText
          label="法人姓名"
          colon={readonly || !!id}
          name="legalPerson"
          width={300}
          readonly={readonly}
          placeholder="请输入法人姓名"
          fieldProps={{
            maxLength: 20,
            showCount: true,
          }}
          rules={[{ required: true }]}
        />
        <ProFormItem
          name="img"
          label="营业执照"
          valuePropName="fileList"
          extra="仅支持png，jpeg，jpg 格式文件"
          getValueFromEvent={(e: any) => {
            return e?.fileList;
          }}
        >
          <FileUpload
            buttonText="上传图片"
            fileType="image"
            disabled={readonly}
            listType="picture-card"
            beforeUpload={async (file: any) => {
              // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
              const isFormat =
                file.type === 'image/png' ||
                file.type === 'image/jpg' ||
                file.type === 'image/jpeg';
              // 校验图片大小
              const is20M = file.size / 1024 / 1024 < 20;
              if (!isFormat) {
                message.error('仅支持jpg，jpeg，png格式的图片');
                return Upload.LIST_IGNORE;
              } else if (!is20M) {
                message.error('图片不能超过20M,请重新选择图片');
                return Upload.LIST_IGNORE;
              }
              return isFormat && is20M;
            }}
            customRequest={async (options: any) => {
              const { onSuccess, file } = options;
              Method.uploadFile(file, alitaParkingLicense).then((url: any) => {
                const _response = { name: file.name, status: 'done', path: url };
                // setTableUrl(record?.id, url);
                setObjectId(url);
                onSuccess(_response, file);
              });
            }}
            onRemove={() => {
              setObjectId('');
            }}
            business={alitaParkingLicense}
          />
        </ProFormItem>
        <h3 style={{ fontWeight: 'bold' }}>管理员信息</h3>
        <ProFormList
          actionRef={actionRef}
          name="adminsRel"
          deleteIconProps={{
            Icon: (_) => {
              return <DeleteOutlined {..._} style={{ color: 'red' }} />;
            },
          }}
          creatorButtonProps={{
            creatorButtonText: '新增管理员',
          }}
          min={1}
          max={1}
          copyIconProps={false}
          itemRender={({ listDom, action }, { index }) => (
            <ProCard
              bordered
              style={{ marginBlockEnd: 8 }}
              // title={maxLength > 1 ? `车辆${index + 1}` : false}
              extra={action}
              bodyStyle={{ paddingBlockEnd: 0 }}
            >
              {listDom}
            </ProCard>
          )}
        >
          {(f, index, action) => {
            const { mobile } = action.getCurrentRowData();
            return (
              <>
                <ProFormText
                  label="管理员姓名"
                  colon={readonly || !!id}
                  name="accountName"
                  width={300}
                  readonly={readonly}
                  placeholder="请输入管理员姓名"
                  labelCol={{ flex: '98px' }}
                  fieldProps={{
                    maxLength: 20,
                    showCount: true,
                  }}
                  rules={[{ required: true }]}
                />
                <ProFormItem
                  label="手机号"
                  name="mobile"
                  rules={[{ required: true }]}
                  labelCol={{ flex: '98px' }}
                >
                  <div>
                    {action.getCurrentRowData().mobile}{' '}
                    <a
                      onClick={() => {
                        setVisit(true);
                        setModalData(action);
                      }}
                    >
                      {mobile ? '修改' : '去绑定'}
                    </a>
                  </div>
                </ProFormItem>
                {/* <ProFormText
                  label="手机号"
                  name="mobile"
                  labelCol={{ flex: '98px' }}
                  width={300}
                  rules={[
                    { required: true },
                    {
                      pattern: /^1[356789]\d{9}$/,
                      message: '手机号格式错误',
                    },
                  ]}
                  fieldProps={{
                    addonAfter: !readonly && (
                      <a
                        onClick={() => {
                          setVisit(true);
                          setModalData(action);
                        }}
                      >
                        {mobile ? '修改' : '绑定'}
                      </a>
                    ),
                    disabled: true,
                  }}
                /> */}
              </>
            );
          }}
        </ProFormList>
        <ProFormTextArea
          name="mark"
          label="备注"
          width={300}
          readonly={readonly}
          fieldProps={{
            maxLength: 50,
          }}
          placeholder="请输入备注"
        />
        {data?.id && <ProFormText name="gmtCreated" label="注册时间" width={300} readonly={true} />}
        {data?.id && <ProFormText name="creator" label="注册人" width={300} readonly={true} />}
      </DrawerForm>
      <VerifyCodeModal
        open={visit}
        onOpenChange={setVisit}
        onSubmit={onModalSubmit}
        data={modalData}
      />
    </>
  );
};

export default Add;
