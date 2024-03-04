import type { SelectProps } from 'antd';
import { Card, Col, Row, message } from 'antd';

import type { FC } from 'react';
import { useState } from 'react';
import ProForm, { ProFormItem, ProFormText } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { setMealCreate, setMealDetail, setMealUpdate } from '@/services/wps';
import { history } from 'umi';
import styles from './style.less';
import FileUpload from '@/components/FileUpload';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';

const fieldLabels = {
  name: '应用名称',
  logo: '应用图标',
  type: '应用类型',
  code: '应用编码',
  url: '应用链接',
  desc: '应用描述',
  sourceSystem: '源系统',
};

const ApplicationEdit: FC<Record<string, any>> = () => {
  const { query } = history.location;
  const [detailData, setDetailData] = useState({});
  const [objectId, setObjectId] = useState<string>();

  const getDetails = async () => {
    const res = await setMealDetail((query as any).id);
    const urlRes = await generateGetUrl({
      bussinessId: publicMaterialLib.id,
      urlList: [
        {
          objectId: res.data.icon,
        },
      ],
    });
    setObjectId(res.data.icon);
    if (res.data.icon) {
      res.data.icon = [
        {
          url: urlRes.data.urlList[0].presignedUrl.url,
        },
      ];
    } else {
      res.data.icon = [];
    }
    const state = res.data.state === 'BAND' ? false : true;
    const desc = JSON.parse(res.data.extension).desc;
    const result = { ...res.data, state, desc };
    setDetailData(result);
    return result;
  };
  const typeOptions: SelectProps<any>['options'] | string[] = [
    { label: '底座应用', value: 'base' },
    { label: '垂类应用', value: 'verticals' },
  ];
  const sourceSystemOptions: SelectProps<{ label: string }>['options'] | string[] = [
    { label: '自建应用', value: 'SELF' },
    { label: '第三方应用', value: 'THIRD' },
  ];
  const onFinish = async (values: Record<string, any>) => {
    const state = values.state ? 'NORMAL' : 'BAND';
    const extension = JSON.stringify({ desc: values.desc });
    try {
      values.icon = objectId;
      const id = (query as any).id;
      if (id) {
        await setMealUpdate((query as any).id, { ...detailData, ...values, state, extension });
      } else {
        await setMealCreate({ ...detailData, ...values, state, extension });
      }

      message.success('提交成功');
      history.goBack();
    } catch {
      // console.log
    }
  };

  return (
    <ProForm
      layout="vertical"
      submitter={{
        searchConfig: {
          resetText: '取消', //修改ProForm取消文字
          submitText: '提交', //修改ProForm提交文字
        },
        render: (props, dom) => {
          return <FooterToolbar>{dom}</FooterToolbar>;
        },
      }}
      request={(query as any).id && getDetails}
      onReset={() => history.goBack()}
      onFinish={onFinish}
    >
      <PageContainer
        header={{
          onBack: () => {
            history.goBack();
          },
          title: (query as any).id ? '编辑应用' : '创建应用',
        }}
      >
        <Card title="基础信息" className={styles.card} bordered={false}>
          <Row gutter={24}>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.name}
                name="name"
                // disabled
                fieldProps={{
                  maxLength: 50,
                }}
                placeholder="请输入应用名称"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText label={fieldLabels.desc} name="desc" placeholder="请输入应用描述" />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText
                label={fieldLabels.code}
                name="code"
                // disabled
                fieldProps={{
                  maxLength: 50,
                }}
                placeholder="请输入应用编码"
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormText label={fieldLabels.url} name="url" placeholder="请输入应用链接" />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.type}
                name="type"
                placeholder="请输入应用类型"
                options={typeOptions}
              />
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSelect
                label={fieldLabels.sourceSystem}
                name="sourceSystem"
                placeholder="请输入源系统"
                options={sourceSystemOptions}
              />
            </Col>

            <Col lg={6} md={12} sm={24}>
              <ProFormItem
                label={fieldLabels.logo}
                name="icon"
                rules={[{ required: true, message: '请上传应用图标' }]}
                valuePropName="fileList"
                extra="仅支持png，jpeg，jpg 格式文件"
                getValueFromEvent={(e: any) => {
                  const file = e.file;
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng && file.status === 'uploading') {
                    message.error('仅支持jpg，jpeg，png格式的图片');
                  }
                  const isLt2M = file.size && file.size / 1024 / 1024 < 2;
                  if (!isLt2M && file.status === 'uploading') {
                    message.error('图片不能超过2M,请重新选择图片');
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
                  buttonText="上传图标"
                  fileType="image"
                  listType="picture-card"
                  onUploadSuccess={(objectIdCb: string) => {
                    setObjectId(objectIdCb);
                  }}
                  business={publicMaterialLib}
                />
              </ProFormItem>
            </Col>
            <Col lg={6} md={12} sm={24}>
              <ProFormSwitch
                name="state"
                label="应用状态"
                fieldProps={{
                  defaultChecked: true,
                }}
              />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default ApplicationEdit;
