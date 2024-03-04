import FileUpload from '@/components/FileUpload';
import { deviceBusiness, publicMaterialLib } from '@/components/FileUpload/business';
import { batchCreateSpaceV2, createSpace, updateSpace } from '@/services/space';
import { Method } from '@/utils';
import { storageSy } from '@/utils/Setting';
import type { ProFormInstance } from '@ant-design/pro-components';
import { FooterToolbar, ProForm, ProFormRadio, ProFormSwitch } from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormDigit } from '@ant-design/pro-components';
import { ProFormDependency } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { Button, Col, Drawer, message, Row, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import SpacePreview from './preview';
import Style from './style.less';

export type Props = {
  treeNode: any;
  selectedSpaceType: string;
  onSubmit: () => void;
  onCancel: () => void;
};

export type TreeNodeType = {
  key: string;
  id: string;
  parentId: string;
  spaceType: string;
  name: string;
  children: TreeNodeType[];
};

type batchNoteType = {
  name: string;
  prefixName?: string;
  spaceType: string;
  children: batchNoteType[];
};

const SpaceForm: React.FC<Props> = ({ treeNode, selectedSpaceType, onSubmit, onCancel }) => {
  const formRef = useRef<ProFormInstance>();
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [objectId, setObjectId] = useState<string>();
  const [previewShow, setPreviewShow] = useState<boolean>(false);
  const [batchNode, setBatchNode] = useState<batchNoteType[]>([]);

  const spaceTypeMap = {
    PROJECT: '项目',
    PROJECT_STAGE: '分期',
    BUILDING: '楼栋',
    UNIT: '单元',
    FLOOR: '楼层',
    ROOM: '房屋',
    PUBLIC_AREA: '公区',
    CARPARK: '车场 ',
    AREA: '区域',
    PASSAGE: '通道',
  };

  // 批量新增房间
  const batchRomm = (isUnit: boolean) => (
    <>
      {isUnit && (
        <ProFormDigit
          rules={[
            {
              required: true,
            },
          ]}
          min={1}
          max={100}
          name="unitNumber"
          label="每栋单元数"
          placeholder="请输入数字"
          fieldProps={{
            controls: false,
            addonAfter: '单元',
          }}
        />
      )}
      <ProFormDigit
        rules={[
          {
            required: true,
          },
        ]}
        min={1}
        max={100}
        name="groundFloor"
        label={`地上层数`}
        placeholder="请输入数字"
        fieldProps={{
          controls: false,
          addonAfter: '层',
        }}
      />
      <ProFormDigit
        min={1}
        max={100}
        name="undergroundFloor"
        label={`地下层数`}
        placeholder="请输入数字"
        fieldProps={{
          controls: false,
          addonAfter: '层',
        }}
      />
      <ProFormText
        tooltip={`多个用 “、”分隔`}
        name="excludeFloor"
        rules={[
          {
            pattern: /^-?\d+(、-?\d+)*$/,
            message: '只能输入"、"分隔的数字',
          },
        ]}
        label={`排除楼层`}
        placeholder="请输入"
      />
      <ProFormDigit
        min={1}
        max={20}
        name="roomNumber"
        label="每层户数"
        placeholder="请输入数字"
        fieldProps={{
          controls: false,
          addonAfter: '户',
        }}
      />
      <ProFormText name="roomPrefix" label="房屋前缀" placeholder="请输入" extra="xxx-1室" />
    </>
  );

  // 构建批量树
  const buildBatchData = () => {
    const {
      startBuilding,
      endBuilding,
      unitNumber,
      groundFloor,
      undergroundFloor,
      roomNumber,
      unitType,
      startRoom,
      endRoom,
      roomPrefix,
      buildPrefix,
      name,
      excludeBuilding,
      excludeRoom,
      excludeFloor,
    } = formRef.current?.getFieldsValue();

    const excludeBuildingArr = excludeBuilding?.split('、') || [];
    const excludeRoomArr = excludeRoom?.split('、') || [];
    const excludeFloorArr = excludeFloor?.split('、') || [];

    const _batchData: batchNoteType[] = [];

    if (selectedSpaceType === 'BUILDING') {
      if (unitType) {
        for (let i = startBuilding; i <= endBuilding; i++) {
          if (excludeBuildingArr.includes(`${i}`)) {
            continue;
          }
          const children: batchNoteType[] = [];
          for (let j = 1; j <= unitNumber; j++) {
            const unitChildren: batchNoteType[] = [];
            for (let k = 1; k <= groundFloor; k++) {
              if (excludeFloorArr.includes(`${k}`)) {
                continue;
              }
              const floorChildren: batchNoteType[] = [];
              for (let l = 1; l <= roomNumber; l++) {
                if (excludeRoomArr.includes(`${l}`)) {
                  continue;
                }
                floorChildren.push({
                  name: `${l}`,
                  spaceType: 'ROOM',
                  prefixName: roomPrefix,
                  children: [],
                });
              }
              unitChildren.push({
                name: `${k}`,
                spaceType: 'FLOOR',
                children: floorChildren,
              });
            }
            for (let k = 1; k <= undergroundFloor; k++) {
              if (excludeFloorArr.includes(`${-k}`)) {
                continue;
              }
              const floorChildren: batchNoteType[] = [];
              unitChildren.push({
                name: `${-k}`,
                spaceType: 'FLOOR',
                children: floorChildren,
              });
            }
            children.push({
              name: `${j}`,
              spaceType: 'UNIT',
              children: unitChildren,
            });
          }
          _batchData.push({
            name: `${i}`,
            spaceType: 'BUILDING',
            prefixName: buildPrefix,
            children: children,
          });
        }
      } else {
        for (let i = startBuilding; i <= endBuilding; i++) {
          if (excludeBuildingArr.includes(`${i}`)) {
            continue;
          }
          const children: batchNoteType[] = [];
          for (let k = 1; k <= groundFloor; k++) {
            if (excludeFloorArr.includes(`${k}`)) {
              continue;
            }
            const floorChildren: batchNoteType[] = [];
            for (let l = 1; l <= roomNumber; l++) {
              if (excludeRoomArr.includes(`${l}`)) {
                continue;
              }
              floorChildren.push({
                name: `${l}`,
                spaceType: 'ROOM',
                prefixName: roomPrefix,
                children: [],
              });
            }
            children.push({
              name: `${k}`,
              spaceType: 'FLOOR',
              children: floorChildren,
            });
          }
          for (let k = 1; k <= undergroundFloor; k++) {
            if (excludeFloorArr.includes(`${-k}`)) {
              continue;
            }
            const floorChildren: batchNoteType[] = [];
            children.push({
              name: `${-k}`,
              spaceType: 'FLOOR',
              children: floorChildren,
            });
          }
          _batchData.push({
            name: `${i}`,
            spaceType: 'BUILDING',
            prefixName: buildPrefix,
            children: children,
          });
        }
      }
    } else if (selectedSpaceType === 'UNIT') {
      const unitChildren: batchNoteType[] = [];
      for (let k = 1; k <= groundFloor; k++) {
        if (excludeFloorArr.includes(`${k}`)) {
          continue;
        }
        const groundChildren: batchNoteType[] = [];
        for (let l = 1; l <= roomNumber; l++) {
          if (excludeRoomArr.includes(`${l}`)) {
            continue;
          }
          groundChildren.push({
            name: `${l}`,
            spaceType: 'ROOM',
            prefixName: roomPrefix,
            children: [],
          });
        }
        unitChildren.push({
          name: `${k}`,
          spaceType: 'FLOOR',
          children: groundChildren,
        });
      }
      for (let k = 1; k <= undergroundFloor; k++) {
        if (excludeFloorArr.includes(`${-k}`)) {
          continue;
        }
        const floorChildren: batchNoteType[] = [];
        unitChildren.push({
          name: `${-k}`,
          spaceType: 'FLOOR',
          children: floorChildren,
        });
      }
      _batchData.push({
        name,
        spaceType: 'UNIT',
        prefixName: buildPrefix,
        children: unitChildren,
      });
    } else if (selectedSpaceType === 'FLOOR') {
      for (let k = 1; k <= groundFloor; k++) {
        if (excludeFloorArr.includes(`${k}`)) {
          continue;
        }
        const groundChildren: batchNoteType[] = [];
        for (let l = 1; l <= roomNumber; l++) {
          groundChildren.push({
            name: `${l}`,
            spaceType: 'ROOM',
            prefixName: roomPrefix,
            children: [],
          });
        }
        _batchData.push({
          name: `${k}`,
          spaceType: 'FLOOR',
          children: groundChildren,
        });
      }
      for (let k = 1; k <= undergroundFloor; k++) {
        if (excludeFloorArr.includes(`${-k}`)) {
          continue;
        }
        const floorChildren: batchNoteType[] = [];
        _batchData.push({
          name: `${-k}`,
          spaceType: 'FLOOR',
          children: floorChildren,
        });
      }
    } else {
      for (let l = startRoom; l <= endRoom; l++) {
        if (excludeRoomArr.includes(`${l}`)) {
          continue;
        }
        _batchData.push({
          name: `${l}`,
          spaceType: formRef.current?.getFieldValue('roomType') || 'ROOM',
          prefixName: roomPrefix,
          children: [],
        });
      }
    }

    console.log('_batchData', _batchData);

    return _batchData;
  };

  const onPreview = () => {
    buildBatchData();
  };

  const onFinish = async (formData: any) => {
    console.log('formData', formData);
    message.loading('正在提交中...');
    const { roomType, addMode = 'single', name, batchRoom } = formData;
    if (addMode === 'single' && !batchRoom) {
      if (['RENAME'].includes(selectedSpaceType)) {
        const params = {
          id: treeNode.id,
          spaceType: selectedSpaceType,
          name,
          spaceImgUrl: objectId,
          parentId: treeNode.parentId,
          projectBid: project.bid,
        };
        const msg = await updateSpace(params);
        if (msg.code === 'SUCCESS') {
          message.success('编辑成功');
          onSubmit();
        }
      } else {
        const params = {
          projectBid: project.bid,
          parentId: treeNode.id,
          spaceType: roomType || selectedSpaceType,
          name,
          spaceImgUrl: objectId,
          spaceNo: formData.number,
        };
        const msg = await createSpace(params);
        if (msg.code === 'SUCCESS') {
          message.success('新增成功');
          onSubmit();
        }
      }
    } else {
      const batchCreates = buildBatchData();

      const params = {
        projectBid: project.bid,
        parentId: treeNode.id,
        batchCreates,
      };
      const msg = await batchCreateSpaceV2(params);
      if (msg.code === 'SUCCESS') {
        message.success('新增成功');
        onSubmit();
      }
    }
    message.destroy();
  };

  const reset = () => {
    formRef?.current?.resetFields();
    formRef?.current?.setFieldsValue({
      spaceType: selectedSpaceType,
      addMode: 'single',
      unitType: true,
      batchRoom: false,
    });
  };

  useEffect(() => {
    reset();
  }, [selectedSpaceType, treeNode]);

  return (
    <>
      <ProForm
        onFinish={onFinish}
        formRef={formRef}
        layout={'horizontal'}
        labelCol={{ span: 3 }}
        submitter={{
          render: () => (
            <FooterToolbar>
              <Button
                onClick={() => {
                  onCancel();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                确定
              </Button>
            </FooterToolbar>
          ),
        }}
      >
        {/* 新增方式表单：只有 BUILDING、FLOOR、ROOM 四种空间类型才会出现 */}
        <ProFormDependency name={['spaceType']}>
          {({ spaceType }) => {
            if (['BUILDING', 'FLOOR', 'ROOM'].includes(spaceType)) {
              return (
                <div className={Style.addModeRadio}>
                  <ProFormRadio.Group
                    name="addMode"
                    label="新建方式"
                    rules={[{ required: true }]}
                    options={[
                      {
                        label: `单个${spaceTypeMap[spaceType]}新增`,
                        value: 'single',
                      },
                      {
                        label: '批量新增',
                        value: 'batch',
                      },
                      {
                        label: spaceType === 'BUILDING' && (
                          <ProFormDependency name={['addMode']}>
                            {({ addMode }) =>
                              addMode === 'batch' && (
                                <Button
                                  size="small"
                                  onClick={() => {
                                    setBatchNode(buildBatchData());
                                    setPreviewShow(true);
                                  }}
                                >
                                  预览
                                </Button>
                              )
                            }
                          </ProFormDependency>
                        ),
                        value: 'none',
                        disabled: true,
                      },
                    ]}
                  />
                </div>
              );
            } else {
              return <></>;
            }
          }}
        </ProFormDependency>

        {/* 房屋新建类型：只有 ROOM 空间类型才会出现 */}
        <ProFormDependency name={['spaceType']}>
          {({ spaceType }) => {
            if (['ROOM'].includes(spaceType)) {
              return (
                <>
                  <ProFormRadio.Group
                    name="roomType"
                    label="新建类型"
                    rules={[{ required: true }]}
                    options={[
                      ...(treeNode?.spaceType === 'FLOOR'
                        ? [
                            {
                              label: '住宅',
                              value: 'ROOM',
                            },
                          ]
                        : []),
                      ...[
                        {
                          label: '设备房',
                          value: 'ROOM_DEVICE',
                        },
                        {
                          label: '商业',
                          value: 'ROOM_BUSINESS',
                        },
                      ],
                    ]}
                  />
                </>
              );
            } else {
              return <></>;
            }
          }}
        </ProFormDependency>

        {/* 名称字段：只有单个添加才会出现 */}
        <ProFormDependency name={['addMode']}>
          {({ addMode }) => {
            if (addMode === 'single') {
              return (
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="name"
                  label={`${spaceTypeMap[selectedSpaceType]}名称`}
                  placeholder="请输入"
                />
              );
            } else {
              return <></>;
            }
          }}
        </ProFormDependency>

        {/* 编号字段：只有单个添加同时空间类型为 'BUILDING', 'UNIT', 'FLOOR', 'ROOM' 才会出现 */}
        <ProFormDependency name={['spaceType']}>
          {({ spaceType }) => {
            if (['BUILDING', 'UNIT', 'FLOOR', 'ROOM'].includes(spaceType)) {
              return (
                <ProFormDependency name={['addMode']}>
                  {({ addMode }) => {
                    if (addMode === 'single') {
                      return (
                        <ProFormText
                          rules={[
                            {
                              required: true,
                              len: 2,
                            },
                          ]}
                          name="number"
                          label={`${spaceTypeMap[selectedSpaceType]}编号`}
                          placeholder="请输入"
                        />
                      );
                    } else {
                      return <></>;
                    }
                  }}
                </ProFormDependency>
              );
            } else {
              return <></>;
            }
          }}
        </ProFormDependency>

        {/* 批量开关 */}
        <ProFormDependency name={['addMode']}>
          {({ addMode }) => {
            if (addMode === 'single') {
              return (
                <>
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
                          file.type === 'image/png' ||
                          file.type === 'image/jpg' ||
                          file.type === 'image/jpeg';
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
                        Method.uploadFile(file, deviceBusiness).then((url: any) => {
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
                  <ProFormDependency name={['spaceType']}>
                    {({ spaceType }) => {
                      if (['UNIT'].includes(spaceType)) {
                        return (
                          <>
                            <ProFormSwitch name="batchRoom" label="批量新增房间" />
                            <ProFormDependency name={['batchRoom']}>
                              {({ batchRoom }) => batchRoom && batchRomm(false)}
                            </ProFormDependency>
                          </>
                        );
                      } else {
                        return <></>;
                      }
                    }}
                  </ProFormDependency>
                </>
              );
            } else {
              return (
                <ProFormDependency name={['spaceType']}>
                  {({ spaceType }) => {
                    if (['BUILDING'].includes(spaceType)) {
                      return (
                        <>
                          <ProFormDigit
                            rules={[
                              {
                                required: true,
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    !getFieldValue('endBuilding') ||
                                    getFieldValue('endBuilding') > value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('起始幢数不能大于最大幢数'));
                                },
                              }),
                            ]}
                            min={1}
                            max={100}
                            name="startBuilding"
                            label="起始幢数"
                            placeholder="请输入数字"
                            fieldProps={{
                              controls: false,
                              addonAfter: '幢',
                            }}
                          />
                          <ProFormDigit
                            rules={[
                              {
                                required: true,
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    !getFieldValue('startBuilding') ||
                                    getFieldValue('startBuilding') < value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('最大幢数不能小于最小幢数'));
                                },
                              }),
                            ]}
                            min={1}
                            max={100}
                            name="endBuilding"
                            label="最大幢数"
                            placeholder="请输入数字"
                            fieldProps={{
                              controls: false,
                              addonAfter: '幢',
                            }}
                          />
                          <ProFormText
                            tooltip={`多个用 “、”分隔`}
                            name="excludeBuilding"
                            rules={[
                              {
                                pattern: /^-?\d+(、-?\d+)*$/,
                                message: '只能输入"、"分隔的数字',
                              },
                            ]}
                            label={`排除幢`}
                            placeholder="请输入"
                          />
                          <ProFormText
                            name="buildPrefix"
                            label="楼栋前缀"
                            placeholder="请输入"
                            extra="xxx-1幢"
                          />
                          <ProFormSwitch name="batchRoom" label="批量新增房间" />
                          <ProFormDependency name={['batchRoom']}>
                            {({ batchRoom }) =>
                              batchRoom && (
                                <>
                                  <ProFormRadio.Group
                                    name="unitType"
                                    label="单元设置"
                                    rules={[{ required: true }]}
                                    options={[
                                      {
                                        label: `有单元`,
                                        value: true,
                                      },
                                      {
                                        label: '无单元',
                                        value: false,
                                      },
                                    ]}
                                  />
                                  <ProFormDependency name={['unitType']}>
                                    {({ unitType }) => batchRomm(unitType as boolean)}
                                  </ProFormDependency>
                                </>
                              )
                            }
                          </ProFormDependency>
                        </>
                      );
                    } else if (['FLOOR'].includes(spaceType)) {
                      return batchRomm(false);
                    } else if (['ROOM'].includes(spaceType)) {
                      return (
                        <>
                          <ProFormDigit
                            rules={[
                              {
                                required: true,
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    !getFieldValue('endRoom') ||
                                    getFieldValue('endRoom') > value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('起始房号不能大于最大房号'));
                                },
                              }),
                            ]}
                            min={1}
                            max={100}
                            name="startRoom"
                            label={`起始房号`}
                            placeholder="请输入数字"
                          />
                          <ProFormDigit
                            rules={[
                              {
                                required: true,
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    !getFieldValue('startRoom') ||
                                    getFieldValue('startRoom') < value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('最大房号不能小于最小房号'));
                                },
                              }),
                            ]}
                            min={1}
                            max={100}
                            name="endRoom"
                            label={`最大房号`}
                            placeholder="请输入数字"
                          />
                          <ProFormText
                            tooltip={`多个用 “、”分隔`}
                            name="excludeRoom"
                            rules={[
                              {
                                pattern: /^-?\d+(、-?\d+)*$/,
                                message: '只能输入"、"分隔的数字',
                              },
                            ]}
                            label={`排除房号`}
                            placeholder="请输入"
                          />
                          <ProFormText
                            name="roomPrefix"
                            label="房屋前缀"
                            placeholder="请输入"
                            extra="xxx-1室"
                          />
                        </>
                      );
                    } else {
                      return <></>;
                    }
                  }}
                </ProFormDependency>
              );
            }
          }}
        </ProFormDependency>
      </ProForm>
      <Drawer
        title="预览"
        placement="right"
        width={600}
        onClose={() => {
          setPreviewShow(false);
        }}
        open={previewShow}
        destroyOnClose={true}
      >
        <SpacePreview
          batchNode={batchNode}
          onlyBuild={
            selectedSpaceType === 'BUILDING' && !formRef.current?.getFieldValue('batchRoom')
          }
        />
      </Drawer>
    </>
  );
};

export default SpaceForm;
