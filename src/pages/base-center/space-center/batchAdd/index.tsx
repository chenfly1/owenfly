import { batchCreateSpace, getPhysicalSpaceList } from '@/services/space';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';

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
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [continueBtnLoading, setContinueBtnLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([]);
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

  const getOptions = async (parentType: string): Promise<{ label: string; value: string }[]> => {
    if (parentType === 'PROJECT') {
      return typeListAll.filter((item) =>
        ['PROJECT_STAGE', 'BUILDING', 'PUBLIC_AREA'].includes(item.value),
      );
    } else if (parentType === 'PROJECT_STAGE') {
      return typeListAll.filter((item) => ['BUILDING', 'PUBLIC_AREA'].includes(item.value));
    } else if (parentType === 'BUILDING') {
      return typeListAll.filter((item) => ['UNIT', 'FLOOR', 'PUBLIC_AREA'].includes(item.value));
    } else if (parentType === 'UNIT') {
      return typeListAll.filter((item) => ['FLOOR', 'PUBLIC_AREA'].includes(item.value));
    } else if (parentType === 'FLOOR') {
      return typeListAll.filter((item) => ['ROOM', 'PUBLIC_AREA'].includes(item.value));
    } else if (parentType === 'ROOM') {
      return [];
    } else if (parentType === 'PUBLIC_AREA') {
      return typeListAll.filter((item) => ['PUBLIC_AREA'].includes(item.value));
    }
    // else if (parentType === 'CARPARK') {
    //   return typeListAll.filter((item) => ['区域', '通道'].includes(item.label));
    // } else if (parentType === 'AREA') {
    //   return typeListAll.filter((item) => ['区域', '通道'].includes(item.label));
    // } else if (parentType === 'PASSAGE') {
    //   return [];
    // }
    else {
      return [];
    }
  };
  const getParentOptions = () => {
    const tempParents: { label: string; value: string }[] = typeListAll.filter(
      (item) => !['CARPARK', 'AREA', 'PASSAGE', 'ROOM'].includes(item.value),
    );
    setParentOptions(tempParents);
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('批量新建空间');
      getParentOptions();
    }
  }, [open]);
  const onSubmitAll = async (formData: any) => {
    const { spaceType, startNumber, endNumber, parentIds, name, exclude } = formData;
    const excludeList = exclude?.split('、') || [];
    const params: { spaceType: string; createSpaces: any[]; projectBid: string } = {
      spaceType,
      createSpaces: [],
      projectBid: project.bid,
    };
    const createSpaces = [];
    // const spaceTypeName = (typeListAll.find((item) => item.value === spaceType) || {}).label;
    if (['PROJECT_STAGE', 'BUILDING', 'UNIT', 'FLOOR', 'ROOM'].includes(spaceType)) {
      for (let j = 0; j < parentIds.length; j++) {
        for (let i = startNumber; i <= endNumber; i++) {
          if (!excludeList.includes(i + ''))
            createSpaces.push({
              parentId: parentIds[j],
              spaceType: formData.spaceType,
              name: i,
            });
        }
      }
    } else {
      for (let j = 0; j < parentIds.length; j++) {
        createSpaces.push({
          parentId: parentIds[j],
          spaceType: formData.spaceType,
          name,
        });
      }
    }
    params.createSpaces = createSpaces;
    const res = await batchCreateSpace(params);
    return res;
  };
  return (
    <DrawerForm
      {...rest}
      colon={false}
      labelCol={{ flex: '100px' }}
      layout="horizontal"
      onOpenChange={onOpenChange}
      drawerProps={{ bodyStyle: { paddingRight: '60px' } }}
      width={620}
      title={title}
      formRef={formRef}
      open={open}
      submitter={{
        render: (props, defaultDoms) => {
          return [
            <Button
              key="extra-reset"
              loading={continueBtnLoading}
              onClick={async () => {
                const vaildFlag = await formRef.current?.validateFields();
                if (vaildFlag) {
                  setContinueBtnLoading(true);
                  const res = await onSubmitAll(vaildFlag);
                  if (res.code === 'SUCCESS') {
                    const parentType = formRef?.current?.getFieldValue('spaceType');
                    formRef?.current?.resetFields();
                    formRef?.current?.setFieldsValue({
                      parentType,
                      parentIds: ((res.data as any) || []).map((item: any) => item.id),
                    });
                  }
                  setContinueBtnLoading(false);
                }
              }}
            >
              继续批量新建下级
            </Button>,
            defaultDoms[0],
            defaultDoms[1],
          ];
        },
      }}
      onFinish={async (formData) => {
        const res = await onSubmitAll(formData);
        if (res.code === 'SUCCESS') {
          onSubmit();
          return true;
        }
        return false;
      }}
    >
      <ProFormSelect
        name="parentType"
        label="上级空间类型"
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请选择上级空间类型"
        options={parentOptions}
        fieldProps={{
          onChange: () => {
            formRef?.current?.resetFields(['parentIds', 'spaceType']);
          },
        }}
      />
      <ProFormSelect
        name="parentIds"
        label="上级空间名称"
        dependencies={['parentType']}
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请选择上级空间"
        fieldProps={{
          showSearch: true,
          mode: 'multiple',
        }}
        request={async ({ parentType }) => {
          if (parentType) {
            const res = await getPhysicalSpaceList({
              projectBid: project.bid,
              selectSpaceType: 'PROJECT',
              spaceType: parentType,
              pageSize: 1000,
              pageNo: 1,
              // pageSize: 20,
            });
            return res.data.items.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          } else {
            return [];
          }
        }}
      />
      <ProFormSelect
        name="spaceType"
        label="空间类型"
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="请选择空间类型"
        dependencies={['parentType']}
        request={async ({ parentType }) => {
          return await getOptions(parentType);
        }}
      />
      <ProFormDependency name={['spaceType']}>
        {({ spaceType }) => {
          if (['PROJECT_STAGE', 'BUILDING', 'UNIT', 'FLOOR', 'ROOM'].includes(spaceType)) {
            const typeName = (typeListAll.find((item) => item.value === spaceType) || {}).unit;
            return (
              <>
                <ProFormDigit
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  min={-100}
                  max={1000}
                  name="startNumber"
                  dependencies={['type']}
                  label="起始编号"
                  placeholder="请输入数字"
                  fieldProps={{
                    controls: false,
                    addonAfter: typeName,
                  }}
                />
                <ProFormDigit
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  min={-100}
                  max={1000}
                  name="endNumber"
                  dependencies={['type']}
                  label="终止编号"
                  placeholder="请输入数字"
                  fieldProps={{
                    controls: false,
                    addonAfter: typeName,
                  }}
                />
                <ProFormText
                  tooltip={`多个用 “、”分隔`}
                  name="exclude"
                  rules={[
                    {
                      pattern: /^\d+(、\d+)*$/,
                      message: '只能输入"、"分隔的数字',
                    },
                  ]}
                  label={`排除${typeName}`}
                  placeholder="请输入数字"
                />
              </>
            );
          } else {
            return (
              <ProFormText
                rules={[
                  {
                    required: true,
                  },
                ]}
                name="name"
                label="空间名称"
                placeholder="请输入"
              />
            );
          }
        }}
      </ProFormDependency>
    </DrawerForm>
  );
};

export default Add;
