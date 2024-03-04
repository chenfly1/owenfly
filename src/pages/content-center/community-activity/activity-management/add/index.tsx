import { Button, Card, Col, Row, Upload, message } from 'antd';
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import ProForm, {
  ProFormCheckbox,
  ProFormDateTimeRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import styles from './style.less';
import { type ProFormInstance, ProFormItem, ProFormRadio } from '@ant-design/pro-components';
import { generateGetUrl } from '@/services/file';
import { contentBusiness, face } from '@/components/FileUpload/business';
import { getProjectAllList } from '@/services/mda';
import Method from '@/utils/Method';
import RichTextEditor from '@/components/RichTextEditor';
import { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import FileUpload from '@/components/FileUpload';
import { getActivityDetails, saveActivity } from '@/services/content';

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
      const height = 234;
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
        message.error('请上传702*234的图片');
        return Upload.LIST_IGNORE;
      },
    );
    return isFormat && is5M && isSize;
  }
};

const Add: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const formRef = useRef<ProFormInstance>();
  const [cover, setCover] = useState<string>();
  const [signUpLimitRequire, setSignUpLimitRequire] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');

  const getDetails = async (id: string) => {
    const res = await getActivityDetails(id);
    const resData = res.data;
    if (res.code === 'SUCCESS') {
      setContent(resData.text);
      formRef?.current?.setFieldsValue({
        ...res.data,
        signTime: [resData.signUpStartTime, resData.signUpEndTime],
        activitytime: [resData.startTime, resData.endTime],
        signUpCond: resData.signUpCond.split(','),
        signUpLimitRadio: resData.signUpLimit ? 'b' : 'a',
      });
      setSignUpLimitRequire(resData.signUpLimit ? true : false);
      if (res.data.cover) {
        setCover(res.data.cover);
        const urlRes = await generateGetUrl({
          bussinessId: face.id,
          urlList: [
            {
              objectId: res.data.cover,
            },
          ],
        });
        const url = urlRes?.data?.urlList[0]?.presignedUrl?.url;
        formRef?.current?.setFieldsValue({
          icon: [
            {
              url,
            },
          ],
        });
      }
    }
  };

  useEffect(() => {
    if (query?.id) {
      getDetails(query?.id as string);
    }
    if (query?.pageType === 'view') {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, []);

  const onFinish = async (values: Record<string, any>) => {
    try {
      try {
        console.log(values);
        values.id = query?.id ? query?.id : null;
        values.signUpStartTime = values.signTime[0] + ':00';
        values.signUpEndTime = values.signTime[1] + ':00';
        values.startTime = values.activitytime[0] + ':00';
        values.endTime = values.activitytime[1] + ':00';
        values.cover = cover;
        values.text = values.text.level ? values.text.level.content : values.text;
        values.signUpCond = values.signUpCond.join(',');
        values.signUpLimit = values.signUpLimitRadio === 'a' ? null : values.signUpLimit;
        const res = await saveActivity(values);
        if (res.code === 'SUCCESS') {
          history.goBack();
          message.success('操作成功');
        }
      } catch {
        // console.log
      }
    } catch {
      // console.log
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < moment().startOf('day');
  };

  const routes = [
    {
      path: '/content-center/community-activity',
      breadcrumbName: '社区管理',
    },
    {
      path: '/content-center/community-activity/activity-management',
      breadcrumbName: '活动管理',
    },
    {
      path: '/content-center/community-activity/activity-management/add',
      breadcrumbName:
        query?.pageType === 'view'
          ? '活动详情'
          : query?.pageType === 'edit'
          ? '编辑活动'
          : '新建活动',
    },
  ];

  return (
    <PageContainer
      header={{
        title: null,
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProForm
        layout="horizontal"
        formRef={formRef}
        colon={false}
        labelCol={{
          flex: '100px',
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
          <div className={styles.headTitle}>活动信息</div>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24} className={styles.infoWrapper}>
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24}>
                  <ProFormSelect
                    label="活动关联项目"
                    placeholder="请选择"
                    rules={[{ required: true, message: '请选择' }]}
                    name="projectBid"
                    request={async () => {
                      const res = await getProjectAllList();
                      console.log(res);
                      return (res.data.items as any).map((i: any) => ({
                        value: i.bid,
                        label: i.name,
                      }));
                    }}
                  />
                </Col>
                <Col xl={{ span: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <ProFormText
                    label="活动标题"
                    name="title"
                    fieldProps={{
                      maxLength: 20,
                      showCount: true,
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入活动标题',
                      },
                    ]}
                    placeholder="请输入活动标题"
                  />
                </Col>
                <Col xl={{ span: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <ProFormDateTimeRangePicker
                    name="signTime"
                    label="报名时间"
                    fieldProps={{
                      disabledDate,
                      format: 'YYYY-MM-DD HH:mm',
                      onChange: (value) => {
                        formRef.current?.setFieldsValue({
                          activitytime: null,
                        });
                      },
                    }}
                    width="lg"
                    placeholder={['报名开始时间', '报名结束时间']}
                    rules={[{ required: true, message: '请选择报名时间' }]}
                  />
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <ProFormDependency name={['signTime']}>
                    {({ signTime }) => {
                      return (
                        <ProFormDateTimeRangePicker
                          name="activitytime"
                          label="活动时间"
                          fieldProps={{
                            disabledDate: (current) => {
                              return (
                                current &&
                                current <
                                  moment(signTime ? signTime[1] : new Date()).startOf('second')
                              );
                            },
                            format: 'YYYY-MM-DD HH:mm',
                          }}
                          width="lg"
                          placeholder={['活动开始时间', '活动结束时间']}
                          rules={[{ required: true, message: '请选择活动时间' }]}
                        />
                      );
                    }}
                  </ProFormDependency>
                </Col>
                <Col xl={{ span: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                  <ProFormText
                    label="活动地址"
                    name="address"
                    fieldProps={{
                      maxLength: 50,
                      showCount: true,
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入活动地址',
                      },
                    ]}
                    placeholder="请输入活动地址"
                  />
                </Col>
                <Col lg={24} md={24} sm={24}>
                  <ProFormItem
                    label="活动封面"
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
                        aspect: 702 / 234,
                        rotationSlider: true,
                      }}
                      listType="picture-card"
                      beforeUpload={async (file: any) => {
                        // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
                        const isFormat =
                          file.type === 'image/png' ||
                          file.type === 'image/jpg' ||
                          file.type === 'image/jpeg';
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
                          setCover(url);
                          onSuccess(_response, file);
                        });
                      }}
                      onRemove={() => {
                        setCover('');
                      }}
                      business={contentBusiness}
                    />
                  </ProFormItem>
                </Col>
                <Col lg={24} md={24} sm={24}>
                  <ProFormItem
                    name="text"
                    label="活动详情"
                    className="editorHeight"
                    labelCol={{
                      flex: '100px',
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入正文内容',
                      },
                    ]}
                  >
                    <RichTextEditor
                      content={content}
                      disabled={disabled}
                      key={'activity-content'}
                      setContent={(text: string) => {
                        console.log(text);
                        formRef?.current?.setFieldsValue({
                          text: text,
                        });
                      }}
                    />
                  </ProFormItem>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <Card bordered={false} className={styles.card}>
          <div className={styles.headTitle}>活动规则</div>
          <Row>
            <Col xl={22} lg={24} md={24} sm={24} className={styles.infoWrapper}>
              <Row gutter={16}>
                <Col lg={24} md={24} sm={24}>
                  <ProFormCheckbox.Group
                    name="signUpCond"
                    label="活动参加条件"
                    labelCol={{
                      flex: '130px',
                    }}
                    colon={true}
                    rules={[
                      {
                        required: true,
                        message: '请选择',
                      },
                    ]}
                    options={[
                      {
                        label: '业主及同住人（在当前项目下有产权的人）',
                        value: 'IS_CUSTOMER',
                      },
                      {
                        label: '员工',
                        value: 'IS_STAFF',
                      },
                    ]}
                  />
                </Col>
                <Col lg={24} md={24} sm={24}>
                  <ProFormRadio.Group
                    name="signUpLimitRadio"
                    colon={true}
                    labelCol={{
                      flex: '130px',
                    }}
                    label="活动人数"
                    rules={[
                      {
                        required: true,
                        message: '请选择',
                      },
                    ]}
                    fieldProps={{
                      onChange(e) {
                        console.log(e);
                        const signUpLimitRadio = e?.target?.value;
                        if (signUpLimitRadio === 'a') {
                          formRef?.current?.setFieldsValue({
                            signUpLimit: null,
                          });
                          setSignUpLimitRequire(false);
                        } else {
                          setSignUpLimitRequire(true);
                        }
                      },
                    }}
                    options={[
                      {
                        label: '不限制人数',
                        value: 'a',
                      },
                      {
                        label: (
                          <div>
                            限制
                            <div className={styles.signUpLimit}>
                              <ProFormDigit
                                width={100}
                                name="signUpLimit"
                                disabled={!signUpLimitRequire}
                                fieldProps={{ precision: 0, size: 'small' }}
                                rules={[{ required: signUpLimitRequire, message: '请输入' }]}
                              />
                            </div>
                            人
                          </div>
                        ),
                        value: 'b',
                      },
                    ]}
                  />
                </Col>
                <Col lg={24} md={24} sm={24}>
                  <ProFormRadio.Group
                    name="needSignIn"
                    colon={true}
                    labelCol={{
                      flex: '130px',
                    }}
                    label="活动是否需要签到"
                    rules={[
                      {
                        required: true,
                        message: '请选择',
                      },
                    ]}
                    options={[
                      {
                        label: '需要签到',
                        value: true,
                      },
                      {
                        label: '不需要签到',
                        value: false,
                      },
                    ]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </ProForm>
    </PageContainer>
  );
};

export default Add;
