import { Card, Col, List, Row, message, Typography, Input, Modal, Space, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import ProForm, { ProFormSwitch } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { getModuleList, getTenantDetails, updateBatchState, setMealUpdate } from '@/services/wps';
// import ModelCard from './modelCard';
import { history } from 'umi';
import styles from './style.less';

const { Paragraph } = Typography;
const { confirm } = Modal;
let tenantData: any = {};
// 表单初始数据
let fromData: Record<string, any> = {};
// 保存操作过的开关表单数据
let handleData: Record<string, any> = {};
const TenantAuthDetail: FC<Record<string, any>> = () => {
  const formRef = useRef<ProFormInstance>();
  const { query } = history.location;
  const [list, setList] = useState<ApplicationItemType[]>([]);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [appChecked, setAppChecked] = useState<boolean>(
    (query as any).mobileApp ? JSON.parse((query as any).mobileApp) : false,
  );
  // const [modalVisit, setModalVisit] = useState<boolean>(false);
  // const [modalDatas, setModalDatas] = useState<ApplicationItemType[]>([]);
  // const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getTenantDetails((query as any).tenantId).then((res) => {
      if (res.code === 'SUCCESS') {
        tenantData = res.data;
        getModuleList({ systemType: '', tenantId: tenantData.code, id: (query as any).id }).then(
          (listRes) => {
            const data = listRes.data;
            if (listRes.code === 'SUCCESS') {
              if (data.length) {
                // 通过id去绑定开关
                const obj: Record<string, any> = {};
                let arrList: ApplicationItemType[] = [];
                data.forEach((item) => {
                  arrList = arrList.concat(item.children);
                  item.children.map((i: ApplicationItemType) => {
                    // if (i.children.length) {
                    //   i.children.map((j: ApplicationItemType) => {
                    //     obj[j.id] = j.state === 'NORMAL' ? true : false;
                    //   });
                    // } else {
                    obj[i.id] = i.state === 'NORMAL' ? true : false;
                    // }
                  });
                });
                setLoading(false);
                fromData = obj;
                formRef.current?.setFieldsValue(obj);
                setList(() => arrList);
                setAllChecked((data[0] && data[0].all) || false);
              }
            }
          },
        );
      }
    });
  }, []);

  const onFinish = async () => {
    try {
      confirm({
        icon: <ExclamationCircleFilled />,
        title: '开通应用',
        content: <p>提交后，该租户的应用授权即刻生效，请谨慎操作</p>,
        okText: '确定提交',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          const paramsList: { state: string; tenantId: string; id: number }[] = [];
          Object.keys(handleData).forEach((i) => {
            // 只提交打开的数据
            if (handleData[i]) {
              paramsList.push({ state: 'NORMAL', tenantId: (query as any).tenantId, id: i as any });
            }
          });
          const res = await updateBatchState(paramsList);
          if (res.code === 'SUCCESS') {
            handleData = {};
            message.success('提交成功');
            history.goBack();
          }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } catch {
      // console.log
    }
  };

  const onFinishFailed = () => {};

  // 全选按钮操作
  const onAllChange = (checked: boolean) => {
    setAllChecked(checked);
    const obj = {};
    console.log(fromData);
    Object.keys(fromData || {}).forEach((i) => {
      obj[i] = checked;
    });
    if (checked) {
      handleData = obj;
    } else {
      handleData = {};
    }
    // 父级子级全选反选
    formRef.current?.setFieldsValue(obj);
  };

  // 单个开关操作
  const onChange = (checked: boolean, item: ApplicationItemType) => {
    handleData[item.id] = checked;
    const obj = { ...fromData, ...handleData };
    const arr = Object.values(obj);
    // 判断是否全选
    if (arr.some((i: boolean) => !i)) {
      setAllChecked(false);
    } else {
      setAllChecked(true);
    }
  };

  // 移动端操作开关
  const onAppChange = (checked: boolean) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: '开通移动端应用',
      content: <p>提交后，该租户的应用授权即刻生效，请谨慎操作</p>,
      okText: '确定提交',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        const res = await setMealUpdate((query as any).id, { mobileApp: true });
        if (res.code === 'SUCCESS') {
          setAppChecked(checked);
          message.success('提交成功');
        } else {
          setAppChecked(!checked);
        }
      },
      onCancel() {
        setAppChecked(!checked);
        console.log('Cancel');
      },
    });
  };

  // const onOpenChange = () => {
  //   setModalVisit(!modalVisit);
  // };

  return (
    <PageContainer
      header={{
        onBack: () => {
          return history.goBack();
        },
        title: null,
      }}
    >
      <Card title="租户信息" className={styles.card} bordered={false} loading={loading}>
        <Row gutter={16}>
          <Col lg={6} md={12} sm={24}>
            <div className={styles.labels}>租户账号</div>
            <Input disabled value={tenantData?.tenantAccount} />
          </Col>
          <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <div className={styles.labels}>公司名称</div>
            <Input disabled value={tenantData?.name} />
          </Col>
        </Row>
      </Card>
      <Card
        title={(query as any).name}
        className={styles.card}
        loading={loading}
        extra={
          <Space className={styles.allSwitch}>
            <ProFormSwitch
              label="开通移动端"
              fieldProps={{
                disabled: appChecked,
                checked: appChecked,
                onChange: onAppChange,
              }}
            />
            <ProFormSwitch
              label="全选"
              fieldProps={{
                checked: allChecked,
                onChange: onAllChange,
              }}
            />
          </Space>
        }
        bordered={false}
      >
        <ProForm
          layout="vertical"
          formRef={formRef}
          submitter={{
            searchConfig: {
              resetText: '取消', //修改ProForm取消文字
              submitText: '提交', //修改ProForm提交文字
            },
            render: (props, dom) => {
              return <FooterToolbar>{dom}</FooterToolbar>;
            },
          }}
          onReset={() => history.goBack()}
          onFinish={onFinish}
          initialValues={fromData}
          onFinishFailed={onFinishFailed}
        >
          <div className={styles.cardList}>
            <List<Partial<ApplicationItemType>>
              rowKey="id"
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3,
                xxl: 4,
              }}
              dataSource={list}
              renderItem={(item) => {
                return (
                  <List.Item key={item.id}>
                    <Card hoverable bodyStyle={{ height: '180px' }}>
                      <Card.Meta
                        title={
                          <Space>
                            <a>{item.text}</a>
                            <div>
                              {item.state === 'NORMAL' ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                  已启用
                                </Tag>
                              ) : null}
                            </div>
                          </Space>
                        }
                        description={
                          <Paragraph className={styles.item} ellipsis={{ rows: 3 }}>
                            <Tooltip title={item.extension}>{item.extension}</Tooltip>
                          </Paragraph>
                        }
                      />
                      {item.state === 'NORMAL' ? null : (
                        <div className={styles.cardSwitch}>
                          <ProFormSwitch
                            name={item.id}
                            fieldProps={{
                              disabled: item.state === 'NORMAL',
                              onChange: (checked: boolean) =>
                                onChange(checked, item as ApplicationItemType),
                            }}
                          />
                        </div>
                      )}
                      {/* {item.children && item.children.length ? (
                        <div>
                          <div className="selectMore">
                            已选中{item.children.filter((i) => i.state === 'NORMAL').length}个
                          </div>
                          <Button
                            className="cardMore"
                            onClick={() => {
                              setModalVisit(true);
                              if (item.children) {
                                setModalDatas(item.children);
                              }
                              if (item.text) {
                                setText(item.text);
                              }
                            }}
                            type="link"
                          >
                            {'选择>>'}
                          </Button>
                        </div>
                      ) : (
                        <div className="cardSwitch">
                          <ProFormSwitch
                            name={item.id}
                            fieldProps={{
                              disabled: item.state === 'NORMAL',
                              onChange: (checked: boolean) =>
                                onChange(checked, item as ApplicationItemType),
                            }}
                          />
                        </div>
                      )} */}
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
          {/* <ModelCard
            modalVisit={modalVisit}
            text={text}
            modalDatas={modalDatas}
            childChange={onChange}
            onOpenChange={onOpenChange}
          /> */}
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default TenantAuthDetail;
