import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Input, Modal, message, Space } from 'antd';
import { ProFormItem, ProFormText } from '@ant-design/pro-components';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import styles from './style.less';
import FaceModal from './face-modal';
import OssImage from '@/components/OssImage';
import { face } from '@/components/FileUpload/business';
import IdModal from './id-modal';
import IcModal from './ic-modal';
import { facePassDel, icCancelLose, icLose, idCardDel } from '@/services/door';

type IProps = {
  form?: any;
  formRef?: any;
  detailsData?: any;
  deviceConfig: { cardSectionStart: number; cardPwd: string };
  getDetails: (id: string) => void;
};

const PassAuth: React.FC<IProps> = ({ form, formRef, getDetails, deviceConfig, detailsData }) => {
  const [faceModal, setFaceModal] = useState<boolean>(false);
  const [idModal, setIdModal] = useState<boolean>(false);
  const [icModal, setIcModal] = useState<boolean>(false);
  const [objectId, setObjectId] = useState<string>('');
  const [idCardNum, setIdCardNum] = useState<string>('');
  const [icCardNum, setIcCardNum] = useState<string>('');

  const faceSumbit = (faceUri: string) => {
    setObjectId(faceUri);
    formRef.current?.setFieldsValue({
      faceUri: faceUri,
    });
  };

  const idSumbit = (obj: any) => {
    console.log(obj);
    setIdCardNum(obj.idCardNum);
    formRef.current?.setFieldsValue({
      ...obj,
    });
  };

  const icSumbit = (obj: any) => {
    console.log(obj);
    setIcCardNum(obj.icCardNum);
    formRef.current?.setFieldsValue({
      ...obj,
    });
  };

  // IC卡批量挂失
  const setLose = async () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: `是否挂失已录入的IC卡`,
      content: `挂失IC卡后该人员无法使用IC卡进行通行`,
      cancelText: '取消',
      okText: '挂失',
      centered: true,
      onOk: async () => {
        const res = await icLose([{ id: detailsData?.icCard?.id }]);
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          getDetails(detailsData?.id);
        }
      },
    });
  };

  // IC卡批量解挂
  const cancelLose = async () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: `是否解挂已挂失的IC卡`,
      content: `解挂IC卡后该人员可以使用IC卡进行通行`,
      cancelText: '取消',
      okText: '解挂',
      centered: true,
      onOk: async () => {
        const res = await icCancelLose([{ id: detailsData?.icCard?.id }]);
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          getDetails(detailsData?.id);
        }
      },
    });
  };

  // 人脸删除
  const delFace = async () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: `是否删除已录入的人脸信息`,
      content: `删除后该人员无法使用人脸进行通行`,
      cancelText: '取消',
      okText: '删除',
      centered: true,
      onOk: async () => {
        const res = await facePassDel({ id: detailsData?.face?.id });
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          getDetails(detailsData?.id);
        }
      },
    });
  };

  // id卡删除
  const delIdCard = async () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: `是否删除已录入的ID卡信息`,
      content: `删除后该人员无法使用ID卡进行通行`,
      cancelText: '取消',
      okText: '删除',
      centered: true,
      onOk: async () => {
        const res = await idCardDel({ id: detailsData?.idCard?.id });
        if (res.code === 'SUCCESS') {
          message.success('操作成功');
          getDetails(detailsData?.id);
        }
      },
    });
  };

  useEffect(() => {
    setObjectId('');
    if (detailsData?.faceUri) {
      setObjectId(detailsData?.faceUri);
    }
    setIdCardNum('');
    if (detailsData?.idCardNum) {
      setIdCardNum(detailsData?.idCardNum);
    }
    setIcCardNum('');
    if (detailsData?.icCard?.status !== 0) {
      setIcCardNum(detailsData?.icCardNum);
    }
  }, [detailsData]);

  const faceResult = () => {
    const faceObj = detailsData?.face;
    if (!faceObj || faceObj?.status === 1) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ marginBottom: '20px' }}>
            <Button
              onClick={() => {
                setFaceModal(true);
              }}
            >
              更换
            </Button>
          </div>
          <div>
            <Button
              danger
              ghost
              onClick={() => {
                if (detailsData?.face?.id) {
                  delFace();
                } else {
                  setObjectId('');
                  formRef.current?.setFieldsValue({
                    faceUri: '',
                  });
                }
              }}
            >
              删除
            </Button>
          </div>
        </Col>
      );
    }
    if (faceObj && faceObj?.status === 0) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ lineHeight: '80px', width: '60px', textAlign: 'center' }}>下发中</div>
        </Col>
      );
    }
    if (faceObj && faceObj?.status === 2) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>下发失败</div>
          <Space>
            <Button
              danger
              ghost
              onClick={() => {
                if (detailsData?.face?.id) {
                  delFace();
                } else {
                  setObjectId('');
                  formRef.current?.setFieldsValue({
                    faceUri: '',
                  });
                }
              }}
            >
              删除
            </Button>
            <Button
              onClick={() => {
                setFaceModal(true);
              }}
            >
              更换
            </Button>
          </Space>
        </Col>
      );
    }
  };

  const idResult = () => {
    const idObj = detailsData?.idCard;
    if (!idObj || idObj?.authStatus === 1) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ marginBottom: '20px' }}>
            <Button
              onClick={() => {
                setIdModal(true);
              }}
            >
              更换
            </Button>
          </div>
          <div>
            <Button
              danger
              ghost
              onClick={() => {
                if (detailsData?.idCard?.id) {
                  delIdCard();
                } else {
                  setIdCardNum('');
                  formRef.current?.setFieldsValue({
                    idCardNum: '',
                    idCardClass: '',
                  });
                }
              }}
            >
              删除
            </Button>
          </div>
        </Col>
      );
    }
    if (idObj && idObj?.authStatus === 0) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ lineHeight: '80px', width: '60px', textAlign: 'center' }}>下发中</div>
        </Col>
      );
    }
    if (idObj && idObj?.authStatus === 2) {
      return (
        <Col className={styles.resultBox}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>下发失败</div>
          <Space>
            <Button
              danger
              ghost
              onClick={() => {
                if (detailsData?.idCard?.id) {
                  delIdCard();
                } else {
                  setIdCardNum('');
                  formRef.current?.setFieldsValue({
                    idCardNum: '',
                    idCardClass: '',
                  });
                }
              }}
            >
              删除
            </Button>
            <Button
              onClick={() => {
                setIdModal(true);
              }}
            >
              更换
            </Button>
          </Space>
        </Col>
      );
    }
  };

  const icResult = () => {
    // ic 先根据status判断卡状态
    // status 是0 未绑定
    // status 是1 绑定 看authstatus   1.已绑定 2.下发失败，0，下发中
    // status是2 拉黑  看authstatus   1.已拉黑 2.下发失败，0，下发中
    const icStatus = detailsData?.icCard?.status;
    const icAuthStatus = detailsData?.icCard?.authStatus;
    if (icStatus === 1) {
      if (icAuthStatus === 0) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ lineHeight: '80px', width: '60px', textAlign: 'center' }}>下发中</div>
          </Col>
        );
      }
      if (icAuthStatus === 1) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>已绑定</div>
            <Space>
              <Button danger ghost onClick={() => setLose()}>
                挂失
              </Button>
              <Button
                onClick={() => {
                  setIcModal(true);
                }}
              >
                重写
              </Button>
            </Space>
          </Col>
        );
      }
      if (icAuthStatus === 2) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>下发失败</div>
            <Space>
              <Button danger ghost onClick={() => setLose()}>
                挂失
              </Button>
              <Button
                onClick={() => {
                  setIcModal(true);
                }}
              >
                重写
              </Button>
            </Space>
          </Col>
        );
      }
    }
    if (icStatus === 2) {
      if (icAuthStatus === 0) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ lineHeight: '80px', width: '60px', textAlign: 'center' }}>下发中</div>
          </Col>
        );
      }
      if (icAuthStatus === 1) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>已挂失</div>
            <Space>
              <Button danger ghost onClick={() => cancelLose()}>
                解挂
              </Button>
            </Space>
          </Col>
        );
      }
      if (icAuthStatus === 2) {
        return (
          <Col className={styles.resultBox}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>下发失败</div>
            <Space>
              <Button danger ghost onClick={() => cancelLose()}>
                解挂
              </Button>
            </Space>
          </Col>
        );
      }
    }
  };

  const faceHtml = () => {
    return (
      <ProFormItem shouldUpdate key="faceHtml">
        {(fm) => {
          return (
            <>
              <div className={styles.borderItem} hidden={!objectId}>
                <ProFormItem
                  label="人脸信息"
                  name="faceUri"
                  shouldUpdate
                  style={{ lineHeight: '80px' }}
                  labelCol={{
                    flex: '68px',
                  }}
                  className={styles.margintop}
                  // className={styles.formItem}
                >
                  <Row justify="space-between" style={{ lineHeight: '32px' }}>
                    <Col span={12}>
                      <OssImage
                        business={face.id}
                        objectId={objectId}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </Col>
                    {faceResult()}
                  </Row>
                </ProFormItem>
              </div>
              <Button
                hidden={!!objectId}
                onClick={() => {
                  setFaceModal(true);
                }}
                icon={<PlusOutlined />}
                type="dashed"
              >
                录入人脸信息
              </Button>
            </>
          );
        }}
      </ProFormItem>
    );
  };

  const idHtml = () => {
    return (
      <ProFormItem shouldUpdate key="idHtml">
        {(fm) => {
          return (
            <>
              <div className={styles.borderItem} hidden={!idCardNum}>
                <ProFormItem shouldUpdate className={styles.formFirItem}>
                  <Row justify="space-between">
                    <Col className={styles.margintop} span={12}>
                      <ProFormText
                        label="ID卡号"
                        width="sm"
                        name="idCardNum"
                        labelCol={{
                          flex: '68px',
                        }}
                        disabled
                        placeholder="请录入ID卡号"
                      />
                      <ProFormItem
                        shouldUpdate
                        label="类型"
                        name="idCardClass"
                        labelCol={{
                          flex: '68px',
                        }}
                      >
                        <Input
                          value={
                            formRef?.current?.getFieldValue('idCardClass') === 2
                              ? '业主卡'
                              : '管理卡'
                          }
                          placeholder="请录入ID类型"
                          disabled
                        />
                      </ProFormItem>
                    </Col>
                    {idResult()}
                  </Row>
                </ProFormItem>
              </div>
              <Button
                hidden={!!idCardNum}
                onClick={() => {
                  setIdModal(true);
                }}
                icon={<PlusOutlined />}
                type="dashed"
              >
                录入ID卡信息
              </Button>
            </>
          );
        }}
      </ProFormItem>
    );
  };

  const icHtml = () => {
    return (
      <ProFormItem shouldUpdate key="icHtml">
        {(fm) => {
          return (
            <>
              <div className={styles.borderItem} hidden={!icCardNum}>
                <ProFormItem shouldUpdate className={styles.formFirItem}>
                  <Row justify="space-between">
                    <Col className={styles.margintop} span={12}>
                      <ProFormText
                        label="IC卡号"
                        width="sm"
                        name="icCardNum"
                        labelCol={{
                          flex: '68px',
                        }}
                        disabled
                        placeholder="请录入IC卡号"
                      />
                      <ProFormItem
                        shouldUpdate
                        label="类型"
                        name="icCardClass"
                        labelCol={{
                          flex: '68px',
                        }}
                      >
                        <Input
                          value={
                            formRef?.current?.getFieldValue('icCardClass') === 2
                              ? '业主卡'
                              : '管理卡'
                          }
                          placeholder="请录入ID类型"
                          disabled
                        />
                      </ProFormItem>
                    </Col>
                    {icResult()}
                  </Row>
                </ProFormItem>
              </div>
              <Button
                hidden={!!icCardNum}
                onClick={() => {
                  setIcModal(true);
                }}
                icon={<PlusOutlined />}
                type="dashed"
              >
                录入IC卡信息
              </Button>
              <div className={styles.formItem}>
                <ProFormText
                  label=" "
                  name="aa"
                  initialValue={1}
                  rules={[{ required: true, message: '请选择' }]}
                  style={{ marginTop: '8px' }}
                  labelCol={{
                    flex: '10px',
                  }}
                >
                  <div>更改通行区域后请重新录入IC卡</div>
                </ProFormText>
              </div>
            </>
          );
        }}
      </ProFormItem>
    );
  };

  const isSort = () => {
    const sort = [];
    if (icCardNum) {
      sort.unshift(icHtml());
    }
    if (idCardNum) {
      sort.unshift(idHtml());
    }
    if (objectId) {
      sort.unshift(faceHtml());
    }
    if (!objectId) {
      sort.push(faceHtml());
    }
    if (!idCardNum) {
      sort.push(idHtml());
    }
    if (!icCardNum) {
      sort.push(icHtml());
    }
    console.log(sort);
    return sort;
  };

  return (
    <>
      <div className={styles.headTitle}>通行凭证</div>
      {isSort()}
      <FaceModal
        modalVisit={faceModal}
        onSubmit={faceSumbit}
        objectId={objectId}
        onOpenChange={setFaceModal}
      />
      <IdModal
        modalVisit={idModal}
        onSubmit={idSumbit}
        deviceConfig={deviceConfig}
        detailsData={detailsData}
        idCardNum={idCardNum}
        onOpenChange={setIdModal}
      />
      <IcModal
        modalVisit={icModal}
        onSubmit={icSumbit}
        deviceConfig={deviceConfig}
        icCardNum={icCardNum}
        form={form}
        formNext={formRef}
        detailsData={detailsData}
        getDetails={getDetails}
        onOpenChange={setIcModal}
      />
    </>
  );
};

export default PassAuth;
