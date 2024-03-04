/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-shadow */
import { ProCard } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Timeline, Image, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import styles from './style.less';
import { detailedList, dictionaryList } from '@/services/workorder';
import moment from 'moment';
import AddModelForm from './add'; // 引入添加模型的组件
import Addcomplaint from './add-complaint'; // 引入添加模型的组件
import { generateGetUrl } from '@/services/file';
import { workordeLib } from '@/components/FileUpload/business';
import { getUserInfo } from '@/services/app';

const Detail: React.FC<Record<string, any>> = () => {
  const params: { id: string } = useParams();
  const [item, setItem] = useState<WorkOrderType>();
  const [titleA, setTitleA] = useState<string>('');

  const [addModalVisit, setAddModalVisit] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false); //控制转让窗口
  const [userID, setUserID] = useState<any>();
  const [editData, setEditData] = useState<any>();
  const [imgUrlA, setImgurlA] = useState<string[]>([]);
  const [imgUrlB, setImgUrlB] = useState<string[][]>([]);
  const [bll, setbll] = useState<any>();
  const [codeTxt, setCodeTxt] = useState<string>();
  // 图片回显
  const setDetail = async (res: any) => {
    // 详情图片
    const arrayA = res.attachments.split(',');
    if (arrayA[0] !== '') {
      const urlA = [];
      for (let index = 0; index < arrayA.length; index++) {
        const urlRes = await generateGetUrl({
          bussinessId: workordeLib.id,
          urlList: [
            {
              objectId: arrayA[index],
            },
          ],
        });
        urlA.push(urlRes?.data?.urlList[0]?.presignedUrl?.url);
      }
      setImgurlA(urlA);
    }

    // 详情图片end

    // 进度图片
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const transformedData = res.list
      ? res.list.map((item: { attachments: string }) => item.attachments.split(','))
      : [];

    const urlC = [];

    for (let index = 0; index < transformedData.length; index++) {
      const urlB = [];
      for (let i = 0; i < transformedData[index].length; i++) {
        if (transformedData[index][0] !== '') {
          const urlRes = await generateGetUrl({
            bussinessId: workordeLib.id,
            urlList: [
              {
                objectId: transformedData[index][i],
              },
            ],
          });
          urlB.push(urlRes?.data?.urlList[0]?.presignedUrl?.url);
        }
      }
      urlC.push(urlB);
    }
    setImgUrlB(urlC);
    // console.log('urlC', urlC);
    //进度图片end
  };
  //图片回显end

  //获取数据
  const getList = async () => {
    const res = await detailedList(params.id);
    // 枚举
    const codeNub = await dictionaryList('workorder_source');
    // console.log("coleNub", codeNub.data)

    const findNameByCode = (code: string) => {
      const item = codeNub.data.find((item: { code: string }) => item.code === code);
      return item ? item.name : null;
    };
    const name = findNameByCode(res.data.source.toString());
    setCodeTxt(name);
    setItem(res.data);
    setDetail(res.data);
    setbll(res.data.canHandle);
    console.log('res.data', res.data.canHandle);
  };

  //工单取消
  const cancelBtn = () => {
    setTitleA('工单取消');
    setAddModalVisit(true);
    setEditData(item);
  };

  //工单转办
  const turnToDoBtn = () => {
    setShowAddModal(true);
    setEditData(item);
  };

  //工单受理
  const acceptedBtn = () => {
    setTitleA('工单受理');
    setAddModalVisit(true);
    setEditData(item);
  };

  // 工单完成
  const finishBtn = () => {
    setTitleA('工单完成');
    setAddModalVisit(true);
    setEditData(item);
  };

  // 获取当前用户
  const useID = async () => {
    const userInfoRes = await getUserInfo();
    setUserID(userInfoRes.data);
    console.log('获取当前用户', userID);
  };
  useEffect(() => {
    useID();
    getList();
  }, []);

  const reload = () => {
    getList();
  };
  const reloadA = () => {
    history.goBack();
  };
  return (
    <PageContainer
      header={{
        // title: `工单详情`,
        title: null,
        onBack: () => {
          history.goBack();
        },
      }}
    >
      <ProCard split="vertical">
        <ProCard colSpan="30%">
          <div className={styles.leftTopStyle}>
            <div>
              <b>工单编号：</b>
              <span>{item ? item.workorderNo : ''}</span>
            </div>
            <Tag
              color="blue"
              style={{
                width: ' 74px',
                height: '32px',

                lineHeight: '32px',
                textAlign: 'center',
                // backgroundColor: "#165dff",
                borderRadius: ' 16px',
              }}
            >
              {(() => {
                switch (item?.status) {
                  case 1:
                    return '待受理';

                  case 2:
                    return '处理中';
                  case 3:
                    return '已转办';
                  case 4:
                    return '已完成';
                  case 5:
                    return '已取消';
                  default:
                    return '';
                }
              })()}
            </Tag>
          </div>
          <div className={styles.leftMiddleStyle}>
            <p>
              <b>报单详情</b>
            </p>
            <p>
              <b>工单类型：</b>
              {item ? item.categoryName : ''}
            </p>
            <p>
              <b>工单位置：</b>
              {item ? item.location : ''}
            </p>
            <p>
              <b>工单来源渠道：</b>
              {codeTxt ? codeTxt : ''}
            </p>
            <p>
              <b>报单时间： </b>
              {item ? moment(item.gmtCreated).format('YYYY-MM-DD HH:mm:ss') : ''}
            </p>
            <p>
              <b>工单详情：</b>
              {item ? item.description : ''}
            </p>
            <div className={styles.imageStyle}>
              {imgUrlA &&
                imgUrlA.length > 0 &&
                imgUrlA.map((index, j) => {
                  return (
                    <>
                      <Image
                        src={index}
                        key={j}
                        fallback="data:image/png;base64,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"
                      />
                    </>
                  );
                })}
            </div>
          </div>
          <div>
            <p>
              <b>报单人信息</b>
            </p>
            <p>
              <b>报单人姓名：</b>
              {item ? item.presenterName : ''}
            </p>
            <p>
              <b>报单人联系方式：</b>
              {item ? item.presenterPhone : ''}
            </p>
          </div>
        </ProCard>
        <ProCard>
          <div className={styles.RightTopStyle}>
            <div>
              <b>处理过程</b>
            </div>
            <div>
              {(() => {
                // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
                switch (item?.status) {
                  case 1:
                    return (
                      <>
                        {bll ? (
                          <Button type="primary" onClick={acceptedBtn}>
                            受理
                          </Button>
                        ) : null}
                        {item.canHandle || userID?.userBid === item.presenterBid ? (
                          <Button onClick={cancelBtn}>取消</Button>
                        ) : null}
                      </>
                    );
                  // userID.userBid item.handlerBid
                  case 2:
                  case 3:
                    return (
                      <>
                        {userID?.userBid === item.handlerBid ? (
                          <>
                            <Button type="primary" onClick={finishBtn}>
                              完成
                            </Button>
                            <Button onClick={turnToDoBtn}>转办</Button>
                          </>
                        ) : null}

                        {userID?.userBid === item.handlerBid ||
                        userID?.userBid === item.presenterBid ? (
                          <Button onClick={cancelBtn}>取消</Button>
                        ) : null}
                      </>
                    );
                  case 4:
                    return '';
                  case 5:
                    return '';
                  // default:
                  //   return (
                  //     <>
                  //       <Button type="primary" onClick={acceptedBtn}>
                  //         受理
                  //       </Button>
                  //       <Button onClick={cancelBtn}>取消</Button>
                  //     </>
                  //   );
                }
              })()}
            </div>
          </div>
          <Timeline reverse={true}>
            {item?.list.map((index, J) => {
              return (
                <Timeline.Item key={index.id}>
                  <b>{index ? moment(index.gmtCreated).format('YYYY-MM-DD HH:mm:ss') : ''}</b>
                  <div className={styles.ItemCard}>
                    <div>
                      <p>
                        <b>{index ? index.title : ''}</b>
                      </p>
                      <p>{index ? index.detail : ''}</p>

                      {index && index.description !== '' && <p>详情：{index.description}</p>}
                    </div>

                    <Tag
                      color="blue"
                      style={{
                        position: 'absolute',
                        top: '21px',
                        right: '55px',
                        width: '74px',
                        height: '32px',
                        // color: "#fff",
                        lineHeight: '32px',
                        textAlign: 'center',
                        //  background-color: #165dff;
                        borderRadius: '16px',
                      }}
                    >
                      {index ? index.statusName : ''}
                    </Tag>

                    <div className={styles.imageStyle}>
                      {imgUrlB &&
                        imgUrlB.length > 0 &&
                        imgUrlB[J] &&
                        Array.isArray(imgUrlB[J]) &&
                        imgUrlB[J].map((item, i) => {
                          return (
                            <>
                              <Image
                                key={i}
                                src={item}
                                fallback="data:image/png;base64,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"
                              />
                            </>
                          );
                        })}
                    </div>
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </ProCard>
      </ProCard>
      {/* 添加弹窗组件 */}
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
        titleA={titleA}
      />

      {/* 添加转让窗口 */}
      <Addcomplaint
        onSubmit={reloadA}
        data={editData}
        modalVisit={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </PageContainer>
  );
};

export default Detail;
