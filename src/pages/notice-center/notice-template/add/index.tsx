import { Card, Col, Row, message } from 'antd';
import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProForm, { ProFormDependency, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import styles from './style.less';
import { type ProFormInstance, ProFormRadio } from '@ant-design/pro-components';
import WechatSevice from './wechatSevice';
import WechatApplet from './wechatApplet';
import WebMessage from './webMessage';
import NoteMessage from './noteMessage';
import { addNoticeTemp, getNoticeTempDetail, updateNoticeTemp } from '@/services/notice';
import { uniq } from 'lodash';

export const VARIABLE_REG = /\{\{(.*?)\}\}/g; // 正则匹配变量[X..]

const Add: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();
  const [categoryBid, setCategoryBid] = useState<any>();
  const [used, setUsed] = useState<boolean>(false);
  const [detail, setDetail] = useState<any>();

  const getDetails = async (id: string) => {
    const res = await getNoticeTempDetail({ id });
    const resData = res.data;
    if (res.code === 'SUCCESS') {
      setCategoryBid(resData.categoryBid || null);
      const detailTem = {
        ...resData,
        redirectStatus: resData.redirectStatus === 1 ? true : false,
      };
      formRef?.current?.setFieldsValue(detailTem);
      setDetail(detailTem);
      setUsed(resData.used);
    }
  };

  const contentSubmit = (values: any) => {
    setCategoryBid(values.categoryBid);
  };

  useEffect(() => {
    if (query?.id) {
      getDetails(query?.id as string);
    }
  }, []);

  const onFinish = async (values: Record<string, any>) => {
    const params: any = {
      ...values,
      variableBids: uniq((values.content || '').match(VARIABLE_REG) || []),
      categoryBid,
      redirectStatus: values.redirectStatus ? 1 : 0,
      smsTemplateBId: values?.smsTemplateBId?.value,
      channelBid: values.channelBid || values.channelBid2,
    };
    let res: any;
    if (query?.id) {
      params.bid = query?.id;
      res = await updateNoticeTemp(params);
    } else {
      res = await addNoticeTemp(params);
    }
    if (res.code === 'SUCCESS') {
      history.goBack();
      message.success('操作成功');
    }
  };

  const handlerChangeType = (val: string) => {
    formRef?.current?.setFieldsValue({
      wechatTemplateId: null,
      channelBid: null,
      title: '',
      wechatDeputyIndustry: '',
      wechatPrimaryIndustry: '',
      content: '',
      simpleDesc: '',
      categoryBid: null,
      variableBids: [],
      redirectStatus: 0,
      type: '',
      redirectUrl: '',
      thirdpartyChannel: null,
      smsTemplateBId: null,
      channelBid2: null,
    });
  };

  return (
    <PageContainer header={{ title: '消息模板新建', onBack: () => history.goBack() }}>
      <ProForm
        layout="horizontal"
        disabled={used}
        formRef={formRef}
        colon={false}
        labelCol={{
          flex: '100px',
        }}
        scrollToFirstError
        submitter={{
          searchConfig: {
            resetText: '取消', //修改ProForm重置文字
          },
          render: (_, dom) => {
            return <FooterToolbar>{dom}</FooterToolbar>;
          },
        }}
        onReset={() => history.goBack()}
        onFinish={onFinish}
      >
        <Card bordered={false} className={styles.card}>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24} className={styles.infoWrapper}>
              <Row gutter={16}>
                <Col span={8}>
                  <ProFormText
                    label="模版名称"
                    name="templateName"
                    fieldProps={{
                      maxLength: 20,
                      showCount: true,
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入模版名称',
                      },
                    ]}
                    placeholder="请输入模版名称"
                  />
                </Col>
                <Col span={24}>
                  <ProFormRadio.Group
                    name="channelType"
                    colon={true}
                    initialValue={'WECHAT_OFFICIAL_ACCOUNT'}
                    label="发送渠道"
                    rules={[
                      {
                        required: true,
                        message: '请选择',
                      },
                    ]}
                    fieldProps={{
                      onChange: handlerChangeType,
                    }}
                    options={[
                      {
                        label: '微信服务号',
                        value: 'WECHAT_OFFICIAL_ACCOUNT',
                      },
                      {
                        label: '小程序站内',
                        value: 'MINI_MAIL',
                      },
                      {
                        label: 'web站内信',
                        value: 'WEB_MAIL',
                      },
                      {
                        label: '短信',
                        value: 'SMS',
                      },
                    ]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <Card bordered={false} className={styles.card}>
          <div className={styles.headTitle}>模版设置</div>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24} className={styles.infoWrapper}>
              <ProFormDependency name={['channelType']}>
                {({ channelType }) => {
                  switch (channelType) {
                    case 'WECHAT_OFFICIAL_ACCOUNT':
                      return <WechatSevice formRef={formRef} />;
                    case 'MINI_MAIL':
                      return (
                        <WechatApplet
                          formRef={formRef}
                          onSubmit={contentSubmit}
                          categoryBid={categoryBid}
                        />
                      );
                    case 'WEB_MAIL':
                      return (
                        <WebMessage
                          formRef={formRef}
                          onSubmit={contentSubmit}
                          categoryBid={categoryBid}
                        />
                      );
                    case 'SMS':
                      return (
                        <NoteMessage
                          formRef={formRef}
                          onSubmit={contentSubmit}
                          categoryBid={categoryBid}
                        />
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
