import {
  DrawerForm,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { contentBusiness } from '@/components/FileUpload/business';
import { articleList, getPlanDetails, savePlan } from '@/services/content';
import { generateGetUrl } from '@/services/file';
import Upload from 'antd/es/upload';
import Method from '@/utils/Method';
import { useModel } from 'umi';
import TransferProject from '@/pages/content-center/components/transferProject';
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
      const width = 702;
      const height = 160;
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
        message.error('请上传702*160的图片');
        return Upload.LIST_IGNORE;
      },
    );
    return isFormat && is5M && isSize;
  }
};

const AddModelForm: React.FC<IProps> = (props) => {
  const { modalVisit, onOpenChange, data, onSubmit } = props;
  const formRef = useRef<ProFormInstance>();
  const [objectId, setObjectId] = useState<string>();
  const [projectList, setProjectList] = useState<string[]>();
  const [title, setTitle] = useState<string>();
  const [detailsData, setDetailsData] = useState<any>({});
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
    setTitle('新建计划');
    setObjectId('');
    if (data?.id) {
      setTitle('编辑计划');
      getPlanDetails(data.id).then(async (res) => {
        if (res.code === 'SUCCESS') {
          const urlRes = await generateGetUrl({
            bussinessId: contentBusiness.id,
            urlList: [
              {
                objectId: res.data.cover,
              },
            ],
          });
          setDetailsData(res.data);
          setObjectId(res.data.cover);
          (res.data as any).icon = [
            {
              url: urlRes.data.urlList[0].presignedUrl.url,
            },
          ];
          formRef?.current?.setFieldsValue({
            ...res.data,
            selectContent: res.data.contentId
              ? {
                  label: (res.data as any).content,
                  value: (res.data as any).contentId,
                }
              : null,
          });
        }
      });
    }
  }, [modalVisit]);

  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    if (projectList?.length) values.projectBids = projectList;
    if (values.icon) delete values.icon;
    values.end = 'B';
    values.cover = objectId;
    values.type = 'MyCenter';
    if (values.selectContent) {
      values.content = values.selectContent.label;
      values.contentId = values.selectContent.value;
    }
    const res = await savePlan(data?.id ? { ...detailsData, ...values } : values);
    if (res.code === 'SUCCESS') {
      onSubmit();
      onOpenChange(false);
      message.success('操作成功');
      formRef?.current?.resetFields();
    }
  };

  const searchKeyword = async (params: any) => {
    const { keyWords } = params;
    const res = await articleList({ code: keyWords, end: 'B', status: 1 });
    return res.data.map((i) => ({ value: i.id, label: i.code, projectBidList: i.projectBids }));
  };

  return (
    <DrawerForm
      colon={false}
      formRef={formRef}
      onOpenChange={onOpenChange}
      title={title}
      layout="horizontal"
      width={560}
      labelCol={{
        flex: '80px',
      }}
      open={modalVisit}
      onFinish={onFinish}
    >
      <ProFormText
        name="titleName"
        label="计划类型"
        colon={false}
        initialValue={'个人中心广告位'}
        readonly
      />
      <ProFormText
        name="name"
        label="计划名称"
        rules={[
          {
            required: true,
            message: '请输入最多20个字符',
          },
        ]}
        fieldProps={{
          maxLength: 20,
          showCount: true,
        }}
        placeholder="请输入最多20个字符"
      />
      <ProFormItem
        label="上传图片"
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
            aspect: 702 / 160,
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
      <ProFormSelect
        label="跳转方式"
        name="jumpWay"
        placeholder="请选择"
        readonly={data?.id ? true : false}
        colon={data?.id ? true : false}
        rules={[
          {
            required: true,
            message: '请选择',
          },
        ]}
        fieldProps={{
          onChange: () => {
            setProjectList(isOneProject ? [projectAllList[0].bid] : []);
            formRef?.current?.setFieldsValue({
              content: null,
              selectContent: null,
              projectBids: null,
            });
          },
        }}
        options={[
          {
            value: 0,
            label: '站内跳转',
          },
          {
            value: 1,
            label: '站外跳转',
          },
        ]}
      />
      <ProFormDependency name={['jumpWay']}>
        {({ jumpWay }) => {
          return jumpWay === 1 ? (
            <ProFormText
              name="content"
              label="跳转内容"
              readonly={data?.id ? true : false}
              colon={data?.id ? true : false}
              rules={[
                {
                  required: true,
                  message: '请输入内容链接',
                },
              ]}
              fieldProps={{
                maxLength: 150,
              }}
              placeholder="请输入内容链接"
            />
          ) : (
            <ProFormSelect
              name="selectContent"
              label="跳转内容"
              showSearch
              readonly={data?.id ? true : false}
              colon={data?.id ? true : false}
              rules={[
                {
                  required: true,
                  message: '输入内容编号',
                },
              ]}
              fieldProps={{
                filterOption: () => {
                  return true;
                },
                labelInValue: true,
                onChange: () => {
                  setProjectList(isOneProject ? [projectAllList[0].bid] : []);
                  formRef?.current?.setFieldsValue({
                    projectBids: null,
                  });
                },
              }}
              request={searchKeyword}
              placeholder="输入内容编号"
            />
          );
        }}
      </ProFormDependency>
      {data?.id || isOneProject ? (
        <ProFormText colon={false} name="projectNames" readonly label="关联项目" />
      ) : (
        <ProFormDependency name={['jumpWay', 'selectContent']}>
          {({ jumpWay, selectContent }) => {
            const projectBids = formRef?.current?.getFieldValue('projectBids');
            const projectBidList = jumpWay ? [] : selectContent?.projectBidList;
            return (
              <ProFormItem
                label="关联项目"
                name="projectBids"
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
                  filterProjectBids={projectBidList}
                  setProjectBids={(vals: string[], list: any) => {
                    if (list) setProjectList(list);
                    formRef?.current?.setFieldsValue({
                      projectBids: vals,
                    });
                  }}
                />
              </ProFormItem>
            );
          }}
        </ProFormDependency>
      )}
    </DrawerForm>
  );
};

export default AddModelForm;
