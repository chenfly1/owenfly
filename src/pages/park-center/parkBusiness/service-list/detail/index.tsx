import {
  generateChildList,
  generateTreeNodes,
  getChildArea,
  parkTitles,
  serviceTypeOptions,
} from '@/pages/park-center/utils/constant';
import { parkAreaTree, serviceDetail, updateService } from '@/services/park';
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, Form, message, Row, Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { useEffect, useState } from 'react';
import { history } from 'umi';

const Detail: React.FC = () => {
  const { query } = history.location;
  const { id, isEdit } = query as any;
  const [edit, setEdit] = useState<boolean>(isEdit == 'true');

  const [ruleMonth, setRuleMonth] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<DataNode[]>();
  const [form] = Form.useForm();

  const [orginTreeList, setOrignTreeList] = useState<ParkAreaTreeType[]>([]);
  const [childList, setChildList] = useState<ParkAreaTreeType[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<Record<string, any>>({});

  const cardSetting = {
    bordered: false,
    loading: loading,
    style: { marginBottom: 24 },
  };

  const onSubmit = async (values: any) => {
    const res = await updateService(id, {
      ...detailData,
      name: values.name,
      remark: values.remark,
    });
    if (res.code == 'SUCCESS') {
      message.success('更新成功！');
      history.goBack();
    } else {
      message.error(res.message);
    }
  };

  const getDetail = async () => {
    const res = await serviceDetail(id);
    setDetailData(res.data);
    form.setFieldsValue({
      ...res.data,
      price: res.data.price / 100,
    });
    const tree = await parkAreaTree(res.data.parkId || '');
    const keys = form.getFieldValue('passageIds');
    setSelectedKeys(keys);
    if (res.data.type == 2) {
      setRuleMonth(true);
    }
    console.log(keys, selectedKeys);

    if (tree.code == 'SUCCESS') {
      setOrignTreeList(tree.data);
      const aChildList: ParkAreaTreeType[] = [];
      generateChildList(tree.data, aChildList);
      setChildList(aChildList);
      const dataList: DataNode[] = [];
      generateTreeNodes(tree.data, dataList, '');
      setTreeData(dataList);
    }
    setLoading(false);
  };

  const onCheckAreaTreeKeys = (checked: any, info: any) => {
    console.log('select: ', checked, info);
    const areas: ParkAreaTreeType[] = [];

    if (checked.length && orginTreeList?.length) {
      checked.forEach((key: string) => {
        const child = getChildArea(childList, key as any);
        if (child != undefined) {
          areas.push(child);
        }
      });
    }
    form.setFieldValue('passageIds', areas);
  };

  useEffect(() => {
    getDetail();
  }, []);
  const FooterButtons = (props: Record<string, any>) => {
    if (edit) {
      return (
        <>
          <Button
            type="default"
            onClick={() => {
              history.goBack();
            }}
          >
            取消
          </Button>
          <Button type="primary" onClick={() => props.form?.submit?.()}>
            提交
          </Button>
        </>
      );
    }
    return (
      <Button
        type="primary"
        onClick={() => {
          setEdit(true);
        }}
      >
        编辑
      </Button>
    );
  };

  return (
    <ProForm
      form={form}
      submitter={{
        render(props) {
          return (
            <FooterToolbar>
              <FooterButtons {...props} />
            </FooterToolbar>
          );
        },
      }}
      onFinish={onSubmit}
    >
      <PageContainer
        header={{
          title: '车辆套餐详情',
          onBack: () => {
            history.goBack();
          },
        }}
      >
        <Card title="项目信息" {...cardSetting}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="projectName"
                label={parkTitles.projectName}
                placeholder=""
                disabled
              />
            </Col>

            <Col span={8}>
              <ProFormText
                name="projectCode"
                label={parkTitles.projectNum}
                placeholder=""
                disabled
              />
            </Col>
          </Row>
        </Card>

        <Card title="车场信息" {...cardSetting}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="parkName"
                label={parkTitles.alitaYardName}
                placeholder=""
                disabled
              />
            </Col>
            <Col span={8}>
              <ProFormText name="parkCode" label={parkTitles.alitaYardNo} placeholder="" disabled />
            </Col>
          </Row>
        </Card>

        <Card title="套餐信息" {...cardSetting}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="name"
                disabled={!edit}
                label={parkTitles.ruleName}
                placeholder="请输入套餐名称"
                fieldProps={{ maxLength: 20, showCount: true }}
                rules={[
                  { required: true, message: '请输入套餐名称' },
                  { pattern: /^[\u4e00-\u9fa50-9]+$/, message: '请输入中文或者数字' },
                ]}
              />
            </Col>

            <Col span={8}>
              <ProFormSelect
                name="type"
                disabled={true}
                label={parkTitles.ruleUsage}
                placeholder="请选择套餐用途"
                options={serviceTypeOptions as any}
                fieldProps={{
                  onChange: (val) => {
                    setRuleMonth(val == 2);
                  },
                }}
                rules={[{ required: true, message: '请选择套餐用途' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={4}>
              <ProFormDigit
                hidden={!ruleMonth}
                max={9999}
                min={0}
                disabled={true}
                name="price"
                label={`${parkTitles.rulePrice}(元/月)`}
                placeholder="请输入价格（一个车位的价格）"
                fieldProps={{ precision: 2 }}
                rules={[{ required: ruleMonth, message: '请输入价格' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={2}>
              <ProForm.Item
                name="passageIds"
                label={parkTitles.ruleAceessAreas}
                rules={[
                  {
                    required: true,
                    message: '请选择准入区域',
                  },
                ]}
              />
            </Col>
            <Col span={14}>
              <Tree
                disabled={true}
                treeData={treeData}
                defaultCheckedKeys={selectedKeys}
                checkable
                defaultExpandAll
                showLine
                onCheck={onCheckAreaTreeKeys}
              />
            </Col>
          </Row>
        </Card>

        <Card title="备注" {...cardSetting}>
          <Col span={16}>
            <ProFormTextArea
              disabled={!edit}
              name="remark"
              placeholder="请输入备注，最多不超过200字"
              fieldProps={{ maxLength: 200, showCount: true }}
            />
          </Col>
        </Card>
      </PageContainer>
    </ProForm>
  );
};

export default Detail;
