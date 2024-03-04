import ProjectSelect from '@/components/ProjectSelect';
import { factoryList, parkBind, spaceParkList } from '@/services/park';
import { DeleteOutlined } from '@ant-design/icons';
import type { FormListActionType, ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import { ProCard, ProFormList } from '@ant-design/pro-components';
import { DrawerForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Input, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import YardModal from './yard-modal';

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
  const [yardModalShow, setYardModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, any>>({});
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
      setTitle('项目绑定车场');
    }
  }, [open]);
  const onFinish = async (formData: any) => {
    // 新增
    const res = await parkBind(formData);
    if (res.code === 'SUCCESS') {
      message.success('绑定成功');
      onSubmit();
      return true;
    }
    return false;
  };
  // 项目变化
  const handleChange = (bid: string, item: ProjectListType) => {
    formRef.current?.setFieldsValue({
      area: item.region ? [item.province, item.city, item.region] : [item.province, item.city],
      address: item.address,
      projectBid: item.bid,
    });
  };

  // 车场编码
  const onYardNumberClick = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
    action: Record<string, any>,
  ) => {
    console.log(e, action);
    setYardModalShow(true);
    setModalData(action);
  };

  // 车场编码回填
  const onDoubleClick = (row: any, action: any) => {
    const parkList: Record<string, any>[] = formRef.current?.getFieldValue('list');
    if (parkList.some((item) => item.parkCode === row.code)) {
      message.warning('该车场已存在');
      return;
    }
    action.setCurrentRowData({
      factoryCode: row.factoryCode,
      parkCode: row.code,
      parkName: row.name,
    });
    setYardModalShow(false);
  };
  // // 查询空间车场
  // const queryParks = async () => {
  //   const res = await spaceParkList({
  //     projectId: project.bid,
  //   });
  //   return res.data.map((item: SpaceParkType) => ({
  //     label: item.name,
  //     value: item.id,
  //   }));
  // };
  return (
    <>
      <DrawerForm
        {...rest}
        labelCol={{ flex: '100px' }}
        layout="horizontal"
        onOpenChange={onOpenChange}
        colon={false}
        width={560}
        title={title}
        formRef={formRef}
        open={open}
        onFinish={onFinish}
        initialValues={{
          area: `${project.province}/${project.city}/${project.region}`,
          address: project.address,
          projectId: project.bid,
        }}
        // request={async () => {
        //   return {
        //     area: `${project.province}/${project.city}/${project.region}`,
        //     address: project.address,
        //     projectId: project.bid,
        //   };
        // }}
      >
        <h3 style={{ fontWeight: 'bold' }}>项目信息</h3>
        <ProjectSelect
          label="项目"
          width={300}
          allowClear={false}
          disabled
          name="projectId"
          handleChange={handleChange}
          readonly
          rules={[{ required: true, message: '请选择所属项目' }]}
          placeholder="请选择所属项目"
        />
        <ProFormText
          width={300}
          name="projectId"
          readonly
          label="项目编号"
          placeholder="请输入项目编号"
        />
        {/* <ProFormText width={300} name="area" label="所在区域" readonly />
        <ProFormText width={300} name="address" label="项目地址" readonly /> */}
        <h3 style={{ fontWeight: 'bold' }}>车场信息</h3>
        <ProFormList
          name="list"
          actionRef={actionRef}
          creatorButtonProps={{
            creatorButtonText: '新增车场',
          }}
          deleteIconProps={{
            Icon: (_) => {
              return <DeleteOutlined {..._} style={{ color: 'red' }} />;
            },
          }}
          min={1}
          copyIconProps={false}
          itemRender={({ listDom, action }, { index }) => (
            <ProCard
              bordered
              style={{ marginBlockEnd: 8 }}
              title={`车场${index + 1}`}
              extra={action}
              bodyStyle={{ paddingBlockEnd: 0 }}
            >
              {listDom}
            </ProCard>
          )}
          initialValue={[{ factoryCode: undefined, parkCode: undefined, parkName: undefined }]}
        >
          {(f, index, action) => {
            return (
              <>
                <ProFormSelect
                  name="factoryCode"
                  width={300}
                  label="设备品牌"
                  readonly
                  rules={[{ required: true }]}
                  placeholder="通过车场编号带出"
                  request={async () => {
                    const res = await factoryList();
                    return res.data.map((item: any) => ({
                      label: item.name,
                      value: item.code,
                    }));
                  }}
                />
                <ProForm.Item name="parkCode" label="车场编号" rules={[{ required: true }]}>
                  <Input
                    allowClear={true}
                    placeholder="请搜索车场编号"
                    style={{ width: '300px' }}
                    onClick={(e) => {
                      onYardNumberClick(e, action);
                    }}
                    readOnly
                  />
                </ProForm.Item>
                <ProFormText
                  label="车场名称"
                  name="parkName"
                  width={300}
                  readonly
                  placeholder="通过车场编号带出"
                  rules={[{ required: true }]}
                />
                {/* <ProFormSelect
                  label="空间车场"
                  name="masParkId"
                  width={300}
                  request={queryParks}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                /> */}
              </>
            );
          }}
        </ProFormList>
      </DrawerForm>
      <YardModal
        open={yardModalShow}
        onOpenChange={setYardModalShow}
        onDoubleClick={onDoubleClick}
        data={modalData}
      />
    </>
  );
};

export default Add;
