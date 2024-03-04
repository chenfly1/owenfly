import { contentBusiness } from '@/components/FileUpload/business';
import { DrawerForm, ProFormItem, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { getAuthorDetails, saveAuthor } from '@/services/content';
import { generateGetUrl } from '@/services/file';
import Method from '@/utils/Method';
import Upload from 'antd/es/upload';
import TransferProject from '../../components/transferProject';
import FileUpload from '@/components/FileUpload';

type IProps = {
  modalVisit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  data: any;
};

const beforeUpload = (file: any) => {
  // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
  const isFormat =
    file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
  // 校验图片大小
  const is5M = file.size / 1024 / 1024 < 5;

  if (!isFormat) {
    message.error('仅支持jpg，jpeg，png格式的图片');
    return Upload.LIST_IGNORE;
  } else if (!is5M) {
    message.error('图片不能超过5M,请重新选择图片');
    return Upload.LIST_IGNORE;
  } else {
    // 校验图片宽高大小
    const isSize = new Promise((resolve, reject) => {
      const width = 200;
      const height = 200;
      const _URL = window.URL || window.webkitURL;
      const img = new Image();
      img.onload = () => {
        // 限制宽高必须为 18*18 像素
        const valid = img.width == width && img.height == height;
        // // 限制宽高必须为 1:1 比例
        // const valid = img.width == img.height;
        // // 限制必须为竖屏图片(宽必须小于高)
        // const valid = img.width < img.height;
        // // 限制必须为横屏图片(宽必须大于高)
        // const valid = img.width > img.height;
        if (valid) {
          resolve(true);
        } else {
          reject();
        }
      };
      img.src = _URL.createObjectURL(file);
    }).then(
      () => {
        return file;
      },
      () => {
        message.error('请上传200*200的图片');
        return Upload.LIST_IGNORE;
      },
    );
    return isFormat && is5M && isSize;
  }
};

const fieldLabels = {
  name: '作者名称',
  icon: '上传图片',
  projectBids: '关联项目',
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, onSubmit, data } = props;
  const formRef = useRef<ProFormInstance>();
  const [objectId, setObjectId] = useState<string>();
  const [projectList, setProjectList] = useState<string[]>();
  const [detailsData, setDetailsData] = useState<any>({});
  const [title, setTitle] = useState<string>('新建作者');
  const { initialState } = useModel('@@initialState');
  const projectAllList: any[] = initialState?.projectList || [];
  // 只有一个项目默认选中
  const isOneProject = projectAllList.length === 1 ? true : false;

  useEffect(() => {
    formRef?.current?.resetFields();
    if (isOneProject) {
      formRef?.current?.setFieldsValue({
        projectNames: projectAllList[0].name,
        projectBids: [projectAllList[0].bid],
      });
      setProjectList([projectAllList[0].bid]);
    }
    setTitle('新建作者');
    setObjectId('');
    if (data?.id) {
      setTitle('编辑作者');
      getAuthorDetails(data.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          const urlRes = await generateGetUrl({
            bussinessId: contentBusiness.id,
            urlList: [
              {
                objectId: res.data.avatar,
              },
            ],
          });
          setDetailsData(res.data);
          setObjectId(res.data.avatar);
          (res.data as any).icon = [
            {
              url: urlRes.data.urlList[0].presignedUrl.url,
            },
          ];
          formRef?.current?.setFieldsValue({
            ...res.data,
          });
        }
      });
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    try {
      console.log(values);
      values.avatar = objectId;
      if (projectList) values.projectBids = projectList;
      delete values.icon;
      const res = await saveAuthor(data?.id ? { ...detailsData, ...values } : values);
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
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={560}
      open={modalVisit}
      onFinish={onFinish}
      submitter={{
        render: (_, dom) => {
          return <Space>{dom}</Space>;
        },
      }}
    >
      <ProFormText
        name="name"
        label={fieldLabels.name}
        rules={[
          {
            required: true,
            message: '请输入最多6个字符',
          },
        ]}
        fieldProps={{
          maxLength: 6,
          showCount: true,
        }}
        placeholder="请输入最多6个字符"
      />
      <ProFormItem
        label={fieldLabels.icon}
        name="icon"
        valuePropName="fileList"
        extra="仅支持jpeg，jpg，png格式， 大小不超过5M"
        rules={[
          {
            required: true,
            message: '请上传文章封面',
          },
        ]}
        getValueFromEvent={(e: any) => {
          const file = e.file;
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng && file.status === 'uploading') {
            message.error('仅支持jpg，jpeg，png格式的图片');
          }
          const isLt10M = file.size && file.size / 1024 / 1024 < 5;
          if (!isLt10M && file.status === 'uploading') {
            message.error('图片不能超过5M,请重新选择图片');
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
          cropImgProps={{
            aspect: 200 / 200,
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
            Method.uploadFile(file, contentBusiness).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setObjectId(url);
              onSuccess(_response, file);
            });
          }}
          onRemove={() => {
            setObjectId('');
          }}
          business={contentBusiness}
        />
      </ProFormItem>
      {data?.id || isOneProject ? (
        <ProFormText name="projectNames" colon={false} readonly label="关联项目" />
      ) : (
        <ProFormItem shouldUpdate>
          {(form) => {
            console.log(form);
            const projectBids = form?.getFieldValue('projectBids');
            return (
              <ProFormItem
                label={fieldLabels.projectBids}
                name="projectBids"
                shouldUpdate
                rules={[
                  {
                    required: true,
                    validator: () => {
                      if (projectList?.length) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject('请选择项目');
                      }
                    },
                    message: '请选择项目',
                  },
                ]}
              >
                <TransferProject
                  projectBids={projectBids}
                  setProjectBids={(vals: string[], list: any) => {
                    if (list) setProjectList(list);
                    form?.setFieldsValue({
                      projectBids: vals,
                    });
                  }}
                />
              </ProFormItem>
            );
          }}
        </ProFormItem>
      )}
    </DrawerForm>
  );
};

export default AddModelForm;
