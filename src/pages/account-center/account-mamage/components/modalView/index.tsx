import { useEffect, useRef, useState } from 'react';
import { Button, Steps, Modal, Form, Table, Select, Tooltip, message } from 'antd';
import { SelectStaff, StaffType } from '@/components/SelectStaff';
import DataMasking from '@/components/DataMasking';
import type { ColumnsType } from 'antd/es/table';
import './style.less';
import type { SelectProps } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import { roleQueryByPage } from '@/services/auth';
import { createAccount } from '@/services/base';
import { getProjectAllList } from '@/services/mda';
type IProps = {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
};
const steps: any = [
  {
    title: '选择员工',
    description: '请先选择需要开账号的员工',
  },
  {
    title: '完善账号信息',
    description: '请完善账号信息',
  },
  {
    title: '完成账号创建',
    description: '账号创建完成',
  },
];
let projectAllList: any = null;
const ModalView: React.FC<IProps & Record<string, any>> = ({ open, onCancel, onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [requestParams, setRequestParams] = useState({
    selectAllRole: '',
    staffList: [],
    accountList: [],
  });
  const [hadSameFlag, setHadSameFlag] = useState(false);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const cancelModal = () => {
    onCancel();
  };
  const selectChange = (e: string[], record: StaffType) => {
    console.log(e);
    const myAccountList = JSON.parse(JSON.stringify(requestParams.accountList));
    myAccountList.some((item: any) => {
      if (item.id === record.id) {
        item.roles = e;
        return true;
      }
    });
    let mySelectAllRole = '';
    if (myAccountList.every((item: any) => item.roles && item.roles.length > 0)) {
      mySelectAllRole = '1';
    }
    setRequestParams({
      ...requestParams,
      accountList: myAccountList,
      selectAllRole: mySelectAllRole,
    });
    form.setFieldsValue({
      selectAllRole: mySelectAllRole,
    });
  };
  const items = steps.map((item: any, index: number) => ({
    ...item,
    key: item.title,
    status: current === index ? 'process' : 'wait',
  }));

  const [options, setOptions] = useState<SelectProps[]>([]);
  const columns: ColumnsType<StaffType> = [
    {
      align: 'center',
      title: '用户姓名',
      dataIndex: 'name',
      render: (_: any, record: StaffType) => {
        return [record.name];
      },
    },
    {
      align: 'center',
      title: (_: any, record: StaffType) => {
        return (
          <>
            <span>账号名 </span>
            <Tooltip title="邮箱作为账号名">
              <InfoCircleFilled style={{ color: '#606266' }} />
            </Tooltip>
          </>
        );
      },
      key: 'account',
      dataIndex: 'account',
    },
    {
      align: 'center',
      title: '手机号',
      key: 'mobile',
      dataIndex: 'mobile',
      width: '150px',
      render: (_: any, record: StaffType) => {
        return [<DataMasking key="onlysee" text={record.mobile} />];
      },
    },
    {
      align: 'center',
      title: '电子邮箱',
      key: 'workEmail',
      dataIndex: 'workEmail',
    },
    {
      align: 'center',
      title: '所属组织',
      key: 'departmentName',
      dataIndex: 'departmentName',
    },
    {
      align: 'center',
      title: '角色',
      key: 'role',
      dataIndex: 'role',
      // width: '120px',
      render: (_: any, record: StaffType) => {
        return (
          <Select
            mode="multiple"
            placeholder="请选择"
            style={{ width: '120px' }}
            onChange={(e) => selectChange(e, record)}
            options={options}
            optionFilterProp="label"
          />
        );
      },
    },
  ];
  const getRoleOption = async () => {
    const res = await roleQueryByPage({ current: 1, pageNo: 1, pageSize: 1000 });
    if (res.code === 'SUCCESS') {
      setOptions(res.data.items.map((item) => ({ label: item.name, value: item.bid })));
    }
  };
  const getProjectAllListFoo = async () => {
    const res = await getProjectAllList();
    if (res.code === 'SUCCESS') {
      projectAllList = res.data.items && res.data.items.length > 0 ? res.data.items : [];
    }
  };
  const onFinish = async (values: any) => {
    if (current === 0 && values.staffList && values.staffList.length > 0) {
      if (hadSameFlag) return;
      setRequestParams({
        ...requestParams,
        accountList: values.staffList.map((item: StaffType) => {
          let departmentName = '';
          let orgBid = '';
          projectAllList.some((sitem: any) => {
            if (sitem.bid === item.projectId) {
              departmentName = sitem.name;
              orgBid = sitem.orgBid;
              return true;
            }
          });
          return {
            id: item.id,
            name: item.name,
            mobile: item.mobile,
            workEmail: item.workEmail,
            parentId: item.parentId,
            departmentName,
            account: item.workEmail,
            roles: [],
            orgBids: [orgBid],
          };
        }),
        selectAllRole: '',
      });
      form.setFieldsValue({
        selectAllRole: '',
      });
      next();
    } else if (current === 1 && values.selectAllRole) {
      setLoading(true);
      const res = await createAccount({
        userAccountList: requestParams.accountList.map((item: any) => ({
          orgStaffRelationId: item.id,
          account: item.account,
          roleBids: item.roles,
          orgBids: item.orgBids,
        })),
      });
      setLoading(false);
      if (res.code === 'SUCCESS') {
        message.success(res.message);
        onSuccess();
        next();
      }
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const changeStaff = (staffList: any, hadSame: boolean) => {
    console.log('changeStaff', staffList);
    setHadSameFlag(hadSame);
    setRequestParams({
      ...requestParams,
      staffList,
    });
    form.setFieldsValue({
      staffList,
    });
  };
  useEffect(() => {
    getRoleOption();
    getProjectAllListFoo();
  }, []);
  return (
    <Modal width={1223} title="给员工开账号" open={open} footer={null} onCancel={cancelModal}>
      <div className="stepView">
        <Steps current={current} items={items} />
        <div className="stepView-content">
          <Form
            name="basic"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            layout="vertical"
            form={form}
            initialValues={{ staffList: [], accountList: [] }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <div className="stepView-carousel">
              <div
                className={
                  current === 0
                    ? 'stepView-carousel-item stepView-carousel-active'
                    : 'stepView-carousel-item'
                }
              >
                <Form.Item
                  label="选择员工"
                  name="staffList"
                  rules={[{ required: true, message: '请选择员工' }]}
                >
                  <SelectStaff onChange={changeStaff} />
                </Form.Item>
              </div>

              <div
                className={
                  current === 1
                    ? 'stepView-carousel-item stepView-carousel-active'
                    : 'stepView-carousel-item'
                }
              >
                {current === 1 && (
                  <Form.Item
                    label="完善账号信息"
                    name="selectAllRole"
                    rules={[{ required: true, message: '请完善账号信息' }]}
                  >
                    <div>
                      <Table
                        columns={columns}
                        dataSource={requestParams.accountList}
                        scroll={{ y: 240 }}
                        rowKey="id"
                        pagination={false}
                      />
                    </div>
                  </Form.Item>
                )}
              </div>
            </div>
            <div
              className={
                current === 2
                  ? 'stepView-carousel-item stepView-finish stepView-carousel-active'
                  : 'stepView-carousel-item stepView-finish'
              }
            >
              <img src={require('@/assets/svg/finish.svg')} className="stepView-finish-img" />
              <div className="stepView-finish-text">
                {requestParams.accountList.length}个账号创建完成
              </div>
              <Button type="primary" onClick={() => cancelModal()}>
                返回账号列表
              </Button>
            </div>

            <Form.Item wrapperCol={{ span: 24 }}>
              <div className="footer">
                {current > 0 && current < items.length - 1 && (
                  <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                    上一步
                  </Button>
                )}
                {current === 0 && (
                  <Button style={{ margin: '0 8px' }} onClick={() => cancelModal()}>
                    取消
                  </Button>
                )}
                {current < steps.length - 1 && (
                  <Button type="primary" htmlType="submit" loading={loading}>
                    下一步
                  </Button>
                )}
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default ModalView;
