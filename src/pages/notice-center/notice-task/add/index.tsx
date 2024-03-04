import {
  Button,
  Card,
  Col,
  Collapse,
  Pagination,
  Row,
  Tag,
  Tooltip,
  Transfer,
  message,
} from 'antd';
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import ProForm, { ProFormDependency } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history, useModel } from 'umi';
import styles from './style.less';
import {
  type ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProCard,
  ProFormTimePicker,
  ProFormDateTimePicker,
  ProFormItem,
} from '@ant-design/pro-components';
import WechatSevice from './wechatSevice';
import WechatApplet from './wechatApplet';
import WebMessage from './webMessage';
import NoteMessage from './noteMessage';
import {
  addNoticeTask,
  detailNoticeTask,
  getNoticeTempDetail,
  getNoticeTempList,
} from '@/services/notice';
import { InfoCircleOutlined } from '@ant-design/icons';
import UserModal from './userModal';
import dayjs from 'dayjs';
import { queryByPageCustomer } from '@/services/mda';
import { storageSy } from '@/utils/Setting';
import ProjectSelect from '@/components/ProjectSelect';
import { userQueryByPage } from '@/services/auth';
import { TransferDirection, TransferListProps } from 'antd/lib/transfer';
import { debounce } from 'lodash';
const { Panel } = Collapse;

const loopData = (treeData: OrgListType[]): OrgListType[] => {
  return treeData.map((item) => {
    const disabled = item.state === 'BAND' ? true : false;
    if (item.children) {
      return {
        ...item,
        disabled,
        children: loopData(item.children),
      };
    }
    return {
      ...item,
      disabled,
    };
  });
};

const Add: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();
  const [disabled] = useState<boolean>(query?.isView === 'true');
  const [userOpen, setUserOpen] = useState<boolean>(false);
  const [receiveUsers, setReceiveUsers] = useState<Record<string, any>[]>([]);
  const [cUserList, setCUserList] = useState<Record<string, any>[]>([]);
  const [cUserSlts, setCUserSltst] = useState<string[]>([]);
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
  const [projectBid, setProjectBid] = useState<string>(project.bid);
  const [title, setTitle] = useState<string>();

  const { initialState } = useModel('@@initialState');
  const orgBidList: string[] = initialState?.currentUser?.orgBidList || [];
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // 获取项目运营用户列表
  const getUserList = async () => {
    const params = {
      pageSize: 1000,
      pageNo: 1,
      state: 'NORMAL',
      orgBid: orgBidList.join(','),
    };
    const res = await userQueryByPage({ params });
    return res.data?.items || [];
  };

  const onUserSubmit = (userList: any) => {
    setReceiveUsers(userList);
  };

  // 模板详情
  const getTempDetails = async (id: string) => {
    const res = await getNoticeTempDetail({ id });
    const resData = res.data;
    if (res.code === 'SUCCESS') {
      formRef?.current?.setFieldsValue({
        ...resData,
        redirectStatus: resData.redirectStatus === 1 ? true : false,
        templateBid: {
          ...resData,
          value: resData.bid,
        },
      });
    }
  };

  // 获取单据详情
  const getDetails = async (id: string) => {
    const userList = await getUserList();
    const res = await detailNoticeTask({ bid: id });
    const resData = res.data;
    if (res.code === 'SUCCESS') {
      formRef?.current?.setFieldsValue({
        ...resData,
      });
      if (resData?.acceptUserType === 2) {
        setCUserSltst((resData.receiveUserBids || []).map((item) => item.userBid));
      } else {
        setReceiveUsers(
          userList.filter((item) =>
            resData.receiveUserBids.some((innerItem) => innerItem.userBid === item.bid),
          ),
        );
      }
      getTempDetails(resData.templateBid);
    }
  };

  const onFinish = async (values: Record<string, any>) => {
    let receiveUsersTemp = [];
    if (values.acceptUserType === 1) {
      receiveUsersTemp = receiveUsers;
    } else {
      receiveUsersTemp = cUserList.filter((item) => cUserSlts.includes(item.bid));
    }
    const params = {
      ...values,
      templateBid: values.templateBid.bid,
      sendTime: values.sendTime ? dayjs(values.sendTime).valueOf() : null,
      cycleTime: values.sendTime ? dayjs(values.sendTime).format('HH:mm:ss') : null,
      receiveUsers: receiveUsersTemp.map((item: any) => ({
        userBid: item.bid,
        phone: item.mobile,
      })),
    };
    const res = await addNoticeTask(params);
    if (res.code === 'SUCCESS') {
      history.goBack();
      message.success('操作成功');
    }
  };

  const getNoticeList = async () => {
    const res = await getNoticeTempList({
      pageNo: 1,
      pageSize: 1000,
      status: 1,
    });
    return (res.data.items || []).map((item: any) => ({
      ...item,
      label: item.templateName,
      value: item.bid,
    }));
  };

  const queryCUserList = async (pageNo = 1, value = '', bid = projectBid) => {
    const res = await queryByPageCustomer({
      pageSize: 20,
      pageNo,
      projectBid: bid,
      name: value,
    });
    setCUserList(res.data.items || []);
    setTotal(res.data.page.totalItems || 0);
  };

  const onpageChange = (page: number) => {
    setCurrent(page);
    queryCUserList(page);
  };
  // 勾选
  const onSelectChange = async (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setCUserSltst([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleChange = (bid: string, name: any) => {
    setProjectBid(bid);
    setCurrent(1);
    queryCUserList(1, '', bid);
  };
  const onSearch = debounce(async (direction: TransferDirection, value: any) => {
    if (direction === 'left') {
      setCurrent(1);
      queryCUserList(1, value);
    }
  }, 500);
  const renderFooter = (
    _: TransferListProps<any>,
    { direction }: { direction: TransferDirection },
  ) => {
    if (direction === 'left') {
      return (
        <Pagination
          simple
          current={current}
          defaultPageSize={20}
          pageSize={20}
          total={total}
          onChange={onpageChange}
          style={{ margin: '10px', textAlign: 'right' }}
        />
      );
    } else {
      return null;
    }
  };

  useEffect(() => {
    setTitle('新建消息发送');
    if (query?.id) {
      setTitle('消息发送详情');
      getDetails(query?.id as string);
    }
    queryCUserList();
  }, []);
  const formCommon = (
    <Row gutter={16}>
      <Col span={24}>
        <ProFormRadio.Group
          label="重发机制"
          name="resendType"
          options={[
            {
              label: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  自动重发
                  <Tooltip title="当消息首次发送失败时，每条消息自动再次发送3次，如仍未成功，则发送失败，需要进行手动发送">
                    <InfoCircleOutlined
                      style={{
                        color: '#8a8a8a',
                        fontSize: '14px',
                        verticalAlign: 'top',
                        paddingLeft: '5px',
                      }}
                    />
                  </Tooltip>
                </div>
              ),
              value: 'auto',
            },
            {
              label: '手动重发',
              value: 'manual',
            },
          ]}
          rules={[
            {
              required: true,
              message: '请选择重发机制',
            },
          ]}
        />
      </Col>
      <Col span={24}>
        <ProFormItem
          label="接收方"
          name="acceptUserTypeTem"
          className={styles.formItem}
          rules={[{ required: true }]}
        >
          <Row>
            <Col flex={'0 0 300px'}>
              <ProFormRadio.Group
                name="acceptUserType"
                options={[
                  {
                    label: '项目运营用户',
                    value: 1,
                  },
                  {
                    label: '用户客户（C）',
                    value: 2,
                  },
                ]}
                rules={[
                  {
                    required: true,
                    message: '请选择接受方',
                  },
                ]}
              />
            </Col>
            <Col flex={1}>
              <ProFormDependency name={['acceptUserType']}>
                {({ acceptUserType }) => {
                  if (acceptUserType === 1 && !disabled) {
                    return (
                      <a
                        // type="primary"
                        style={{ display: 'block', padding: '5px' }}
                        onClick={() => {
                          setUserOpen(true);
                        }}
                      >
                        详细选择
                      </a>
                    );
                  }
                  return null;
                }}
              </ProFormDependency>
            </Col>
          </Row>
        </ProFormItem>
      </Col>
      <Col span={8}>
        <ProFormDependency name={['acceptUserType']}>
          {({ acceptUserType }) => {
            if (acceptUserType === 1) {
              return (
                <ProFormItem label="已选用户">
                  <ProCard
                    bodyStyle={{ minHeight: '200px', padding: '5px' }}
                    split="vertical"
                    className={styles.myCard}
                  >
                    {receiveUsers.map((item: any) => (
                      <Tag key={item.bid}>{item.name}</Tag>
                    ))}
                  </ProCard>
                </ProFormItem>
              );
            } else if (acceptUserType === 2) {
              return (
                <ProFormItem label="已选用户">
                  <Transfer
                    className={styles.customTransfer}
                    titles={[
                      <ProjectSelect
                        key={'project'}
                        name="projectBid"
                        handleChange={handleChange}
                        allowClear={false}
                        showSearch={true}
                      />,
                    ]}
                    listStyle={{ width: '100%', height: '300px' }}
                    dataSource={cUserList}
                    showSearch
                    onSearch={onSearch}
                    selectedKeys={cUserSlts}
                    rowKey={(item) => item.bid as any}
                    onSelectChange={onSelectChange}
                    render={(item) => item.name}
                    footer={renderFooter}
                  />
                </ProFormItem>
              );
            }
            return null;
          }}
        </ProFormDependency>
      </Col>
      <UserModal
        open={userOpen}
        onOpenChange={setUserOpen}
        onSubmit={onUserSubmit}
        data={receiveUsers}
      />
    </Row>
  );

  return (
    <PageContainer header={{ title: title, onBack: () => history.goBack() }}>
      <ProForm
        layout="horizontal"
        formRef={formRef}
        colon={false}
        labelCol={{
          flex: '80px',
        }}
        disabled={disabled}
        scrollToFirstError
        submitter={{
          searchConfig: {
            resetText: '取消', //修改ProForm重置文字
          },
          render: (props, dom) => {
            if (disabled)
              return (
                <FooterToolbar>
                  <Button
                    key="back"
                    disabled={false}
                    onClick={() => {
                      history.goBack();
                    }}
                  >
                    返回
                  </Button>
                </FooterToolbar>
              );
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={() => history.goBack()}
        onFinish={onFinish}
      >
        <Card bordered={false} className={styles.card}>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24}>
              <Row gutter={16}>
                <Col span={8}>
                  <ProFormSelect
                    fieldProps={{
                      labelInValue: true,
                      onChange: (e) => {
                        if (e) {
                          getTempDetails(e?.bid);
                        }
                      },
                    }}
                    label="消息模板"
                    name="templateBid"
                    request={getNoticeList}
                    rules={[
                      {
                        required: true,
                        message: '请选择消息模版',
                      },
                    ]}
                    placeholder="请选择"
                  />
                </Col>
              </Row>
              <Collapse
                defaultActiveKey={['1']}
                expandIconPosition={'end'}
                ghost
                className={styles.myColapse}
              >
                <Panel header="模板详情" key="1">
                  <ProFormDependency name={['templateBid']}>
                    {({ templateBid }) => {
                      switch (templateBid?.channelType) {
                        case 'WECHAT_OFFICIAL_ACCOUNT':
                          return <WechatSevice formRef={formRef} />;
                        case 'MINI_MAIL':
                          return <WechatApplet formRef={formRef} />;
                        case 'WEB_MAIL':
                          return <WebMessage formRef={formRef} />;
                        case 'SMS':
                          return <NoteMessage formRef={formRef} />;
                        default:
                          return null;
                      }
                    }}
                  </ProFormDependency>
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </Card>
        <Card bordered={false} className={styles.card}>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24} className={styles.infoWrapper}>
              <Row gutter={16}>
                <Col span={24}>
                  <ProFormRadio.Group
                    label="发送方式"
                    name="sendType"
                    options={[
                      {
                        label: '直接发送',
                        value: 'immediate',
                      },
                      {
                        label: '触发发送',
                        value: 'waitingForCall',
                      },
                      {
                        label: '单次定时',
                        value: 'singleSchedule',
                      },
                      {
                        label: '周期循环',
                        value: 'cycleSchedule',
                      },
                    ]}
                    rules={[
                      {
                        required: true,
                        message: '请选择发送方式',
                      },
                    ]}
                  />
                </Col>
              </Row>
              <ProFormDependency name={['sendType']}>
                {({ sendType }) => {
                  switch (sendType) {
                    case 'immediate':
                      return formCommon;
                    case 'waitingForCall':
                      return null;
                    case 'singleSchedule':
                      return (
                        <>
                          <Row gutter={16}>
                            <Col span={6}>
                              <ProFormDateTimePicker
                                rules={[
                                  {
                                    required: true,
                                    message: '请选择发送时间',
                                  },
                                ]}
                                label="发送时间"
                                name="sendTime"
                                width={'lg'}
                              />
                            </Col>
                          </Row>
                          {formCommon}
                        </>
                      );
                    case 'cycleSchedule':
                      return (
                        <>
                          <Row gutter={16}>
                            <Col span={6}>
                              <ProFormSelect
                                label="重复规则"
                                name="scheduleType"
                                options={[
                                  {
                                    label: '按天',
                                    value: 1,
                                  },
                                  // {
                                  //   label: '按周',
                                  //   value: 2,
                                  // },
                                  // {
                                  //   label: '按月',
                                  //   value: 3,
                                  // },
                                ]}
                              />
                            </Col>
                            <Col span={6}>
                              <ProFormTimePicker label="发送时间" name="sendTime" width={'lg'} />
                            </Col>
                          </Row>
                          {formCommon}
                        </>
                      );
                    default:
                      return null;
                  }
                }}
              </ProFormDependency>
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default Add;
