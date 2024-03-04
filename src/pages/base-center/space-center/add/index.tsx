import FileUpload from '@/components/FileUpload';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { getPhysicalSpaceTree } from '@/components/SpaceTree/service';
import { generateGetUrl } from '@/services/file';
import { createSpace, updateSpace } from '@/services/space';
import { Method } from '@/utils';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { message, TreeSelect, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';

export type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Record<string, any>;
  onSubmit: () => void;
};

export type TreeNodeType = {
  key: string;
  id: string;
  parentId: string;
  spaceType: string;
  name: string;
  children: TreeNodeType[];
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
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [typeList, setTypeList] = useState<{ label: string; value: string }[]>();
  const [spaceTreeData, setSpaceTreeData] = useState<TreeNodeType[]>();
  const [objectId, setObjectId] = useState<string>();
  const [isAdd, setIsAdd] = useState<boolean>(true);
  const typeListAll = [
    {
      label: '项目',
      value: 'PROJECT',
    },
    {
      label: '分期',
      value: 'PROJECT_STAGE',
      unit: '区',
    },
    {
      label: '楼栋',
      value: 'BUILDING',
      unit: '幢',
    },
    {
      label: '单元',
      value: 'UNIT',
      unit: '单元',
    },
    {
      label: '楼层',
      value: 'FLOOR',
      unit: '层',
    },
    {
      label: '房间',
      value: 'ROOM',
      unit: '室',
    },
    {
      label: '公区',
      value: 'PUBLIC_AREA',
    },
    {
      label: '车场',
      value: 'CARPARK',
    },
    {
      label: '区域',
      value: 'AREA',
    },
    {
      label: '通道',
      value: 'PASSAGE',
    },
  ];

  const getOptions = () => {
    if (data?.spaceType === 'PROJECT') {
      setTypeList(
        typeListAll.filter((item) =>
          ['PROJECT_STAGE', 'BUILDING', 'PUBLIC_AREA'].includes(item.value),
        ),
      );
    } else if (data?.spaceType === 'PROJECT_STAGE') {
      setTypeList(typeListAll.filter((item) => ['BUILDING', 'PUBLIC_AREA'].includes(item.value)));
    } else if (data?.spaceType === 'BUILDING') {
      setTypeList(
        typeListAll.filter((item) => ['UNIT', 'FLOOR', 'PUBLIC_AREA'].includes(item.value)),
      );
    } else if (data?.spaceType === 'UNIT') {
      setTypeList(typeListAll.filter((item) => ['FLOOR', 'PUBLIC_AREA'].includes(item.value)));
    } else if (data?.spaceType === 'FLOOR') {
      setTypeList(typeListAll.filter((item) => ['ROOM', 'PUBLIC_AREA'].includes(item.value)));
    } else if (data?.spaceType === 'ROOM') {
      setTypeList([]);
    } else if (data?.spaceType === 'PUBLIC_AREA') {
      setTypeList(typeListAll.filter((item) => ['PUBLIC_AREA'].includes(item.value)));
    } else {
      setTypeList([]);
    }
    //  else if (data?.spaceType === 'CARPARK') {
    //   setTypeList(typeListAll.filter((item) => ['区域', '通道'].includes(item.label)));
    // } else if (data?.spaceType === 'AREA') {
    //   setTypeList(typeListAll.filter((item) => ['区域', '通道'].includes(item.label)));
    // }
    // else if (data?.spaceType === 'PASSAGE') {
    //   setTypeList([]);
    // }
  };
  const setDetail = async () => {
    const objectIdTem = data?.spaceImgUrl;
    const urlRes = await generateGetUrl({
      bussinessId: publicMaterialLib.id,
      urlList: [
        {
          objectId: objectIdTem,
        },
      ],
    });
    const url = urlRes?.data?.urlList[0]?.presignedUrl?.url;
    setObjectId(objectIdTem);
    let nameTem;
    if (['PROJECT_STAGE', 'BUILDING', 'UNIT', 'ROOM', 'FLOOR'].includes(data?.spaceType)) {
      const listName = data?.name.split('');
      const index = listName.findLastIndex((j: any) => j === '/');
      nameTem = index > -1 ? parseInt(data?.name.substr(index + 1)) : parseInt(data?.name);
    } else {
      nameTem = data?.name;
    }
    formRef?.current?.setFieldsValue({
      parentName: data?.name,
      spaceType: data?.spaceType,
      name: nameTem,
      labels: objectIdTem ? [{ url }] : [],
    });
  };
  useEffect(() => {
    if (open) {
      const isAddTem = data?._type === 'addSub';
      setIsAdd(isAddTem);
      if (isAddTem) {
        formRef?.current?.resetFields();
        setObjectId('');
        setTitle('新建空间');
        getOptions();
        formRef?.current?.setFieldsValue({
          parentName: data?.name,
        });
      } else {
        getPhysicalSpaceTree({
          projectBid: project.bid,
        }).then((res) => {
          setSpaceTreeData(res.data);
          formRef?.current?.setFieldsValue({
            parentId: data?.parentId,
          });
        });
        setTitle('编辑空间');
        setDetail();
      }
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    const { spaceType, name } = formData;
    let nameTem;
    if (['PROJECT_STAGE', 'BUILDING', 'UNIT', 'FLOOR', 'ROOM'].includes(spaceType)) {
      nameTem = Number(name);
    } else {
      nameTem = name;
    }
    if (isAdd) {
      const params = {
        projectBid: project.bid,
        parentId: data?.id,
        spaceType: formData.spaceType,
        name: nameTem,
        spaceImgUrl: objectId,
      };
      const res = await createSpace(params);
      if (res.code === 'SUCCESS') {
        message.success('提交成功');
        onSubmit();
        return true;
      }
    } else {
      const params = {
        id: data?.id,
        spaceType: formData.spaceType,
        name: nameTem,
        spaceImgUrl: objectId,
        parentId: formData.parentId,
        projectBid: project.bid,
      };
      const res = await updateSpace(params);
      if (res.code === 'SUCCESS') {
        message.success('更新成功');
        onSubmit();
        return true;
      }
    }
  };
  return (
    <DrawerForm
      {...rest}
      colon={false}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      drawerProps={{ bodyStyle: { paddingRight: '40px' } }}
      width={520}
      title={title}
      formRef={formRef}
      open={open}
      onFinish={onFinish}
    >
      {isAdd && (
        <ProFormText
          name="parentName"
          label="上级空间名称"
          colon={false}
          disabled={!isAdd}
          readonly
          rules={[
            {
              required: true,
            },
          ]}
          placeholder="请输入名称"
        />
      )}
      {!isAdd && (
        <ProForm.Item
          label="上级空间名称"
          rules={[
            {
              required: true,
            },
          ]}
          name="parentId"
        >
          <TreeSelect
            treeLine={true}
            treeDefaultExpandAll={true}
            treeData={spaceTreeData}
            fieldNames={{
              label: 'name',
              value: 'id',
            }}
            // treeCheckable={true}
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            placeholder="请选择所属组织"
            treeNodeFilterProp="title"
          />
        </ProForm.Item>
      )}
      <ProFormSelect
        name="spaceType"
        label="空间类型"
        options={isAdd ? typeList : typeListAll}
        readonly={isAdd ? false : true}
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请选择空间类型"
      />
      <ProFormDependency name={['spaceType']}>
        {({ spaceType }) => {
          if (['PROJECT_STAGE', 'BUILDING', 'UNIT', 'FLOOR', 'ROOM'].includes(spaceType)) {
            const typeName = (typeListAll.find((item) => item.value === spaceType) || {}).unit;
            return (
              <ProFormDigit
                rules={[
                  {
                    required: true,
                    message: '',
                  },
                ]}
                name="name"
                dependencies={['type']}
                label="空间名称"
                placeholder="请输入数字"
                fieldProps={{
                  controls: false,
                  addonAfter: typeName,
                  min: -10,
                  max: 1000,
                }}
              />
            );
          } else {
            return (
              <ProFormText
                rules={[
                  {
                    required: true,
                    message: '',
                  },
                ]}
                name="name"
                dependencies={['type']}
                label="空间名称"
                placeholder="请输入"
              />
            );
          }
        }}
      </ProFormDependency>

      <ProFormItem
        name="labels"
        label="平面图"
        valuePropName="fileList"
        extra="仅支持png，jpeg，jpg格式，20M以内"
        getValueFromEvent={(e: any) => {
          const file = e.file;
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng && file.status === 'uploading') {
            message.error('仅支持jpg，jpeg，png格式的图片');
          }
          const isLt10M = file.size && file.size / 1024 / 1024 < 20;
          if (!isLt10M && file.status === 'uploading') {
            message.error('图片不能超过20M,请重新选择图片');
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
          fileType="image"
          listType="picture-card"
          beforeUpload={async (file: any) => {
            // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
            const isFormat =
              file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg';
            // 校验图片大小
            const is20M = file.size / 1024 / 1024 < 20;
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
            Method.uploadFile(file, publicMaterialLib).then((url: any) => {
              const _response = { name: file.name, status: 'done', path: url };
              setObjectId(url);
              onSuccess(_response, file);
            });
          }}
          onRemove={() => {
            setObjectId('');
          }}
          business={publicMaterialLib}
        />
      </ProFormItem>
    </DrawerForm>
  );
};

export default Add;
