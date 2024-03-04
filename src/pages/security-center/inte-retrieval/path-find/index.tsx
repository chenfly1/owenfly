import FileUpload from '@/components/FileUpload';
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';
import { Method } from '@/utils';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Button,
  Col,
  Image,
  InputNumber,
  Row,
  Select,
  Spin,
  Timeline,
  Upload,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import styles from './style.less';
import { ProFormItem, ProFormText } from '@ant-design/pro-components';
import type { UploadFile } from 'antd/es/upload';
import { monitorBusiness } from '@/components/FileUpload/business';
import { generateGetUrl } from '@/services/file';
import { intelligentRetrievalCapture } from '@/services/monitor';
import { Access, useAccess } from 'umi';

export default () => {
  const [objectId, setObjectId] = useState<string>();
  const [rate, setRate] = useState<any>(85);
  const [dataList, setDataList] = useState<Record<string, any>[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>();
  const [searchLatestDays, setSearchLatestDays] = useState<number>(1);
  const access = useAccess();
  const [loading, setLoading] = useState<boolean>(false);

  const beforeUpload = async (file: any) => {
    // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
    const isFormat = file.type === 'image/jpg' || file.type === 'image/jpeg';
    if (!isFormat) {
      message.error('仅支持jpg，jpeg格式的图片');
      return Upload.LIST_IGNORE;
    }
    const newImg = await Method.compressorImageBySize(file, 200);
    console.log(`压缩后`, `${newImg.size / 1024}kb`);
    return Promise.resolve(newImg);
  };

  const getUrl = async () => {
    const res = await generateGetUrl({
      bussinessId: monitorBusiness.id,
      urlList: [
        {
          objectId: objectId as string,
        },
      ],
    });
    if (res.code === 'SUCCESS') {
      const url = res.data.urlList[0].presignedUrl.url;
      return url;
    } else {
      return '';
    }
  };

  const handleSearch = async (url: string) => {
    setLoading(true);
    const res = await intelligentRetrievalCapture({
      faceUrl: url,
      faceSimilarity: rate,
      searchLatestDays: searchLatestDays,
      doFaceCheck: true,
    });
    setLoading(false);
    const faceListTem = (res?.data || []).map((item) => {
      return {
        deviceName: item.deviceName,
        devicePosition: item.devicePosition,
        times: `${item.beginCaptureTime} 至 ${item.endCaptureTime}`,
        picCaptureInfoList: item.picCaptureInfoList,
      };
    });
    if (faceListTem.length > 0) {
      setDataList(faceListTem);
    } else {
      message.warning('未找到相关人脸数据');
      setDataList([]);
    }
  };

  const onSearch = async () => {
    if (objectId?.length) {
      const url = await getUrl();
      handleSearch(url);
    } else {
      message.warning('请上传人脸图片');
    }
  };

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div
            className={styles.imageUpBtn}
            style={{
              padding: '20px',
              minHeight: 'calc(100vh - 103px)',
              display: 'flex',
              flexFlow: 'column',
            }}
          >
            <FileUpload
              buttonText="上传图片"
              fileType="avatar"
              listType="picture-card"
              beforeUpload={beforeUpload}
              fileList={fileList}
              customRequest={async (options: any) => {
                const { onSuccess, file } = options;
                Method.uploadFile(file, monitorBusiness).then((url: any) => {
                  const _response = { name: file.name, status: 'done', path: url };
                  setObjectId(url);
                  onSuccess(_response, file);
                });
              }}
              onChange={({ fileList: newFileList }) => {
                setFileList(newFileList);
              }}
              onRemove={() => {
                setObjectId('');
              }}
              business={monitorBusiness}
            />
            <div style={{ padding: '20px', color: '#ccc' }}>
              * 备注：请上传带有正面人脸的照片，以正面免冠照为佳； 图片文件支持jpg、jpeg格式；
              图片文件大小 10 KB- 200 KB
            </div>
            <ProFormItem
              label="人脸相似度大于"
              colon={false}
              labelCol={{ flex: '120px' }}
              style={{ marginTop: '20px', padding: '0 10px' }}
            >
              <InputNumber
                addonAfter="%"
                style={{ width: '120px' }}
                value={rate}
                max={100}
                min={60}
                // controls={false}
                onChange={setRate}
              />
            </ProFormItem>
            <ProFormItem
              label="选择查找时间"
              colon={false}
              labelCol={{ flex: '120px' }}
              style={{ padding: '0 10px' }}
            >
              <Select
                value={searchLatestDays}
                options={[
                  { value: 1, label: '最近1天' },
                  { value: 3, label: '最近3天' },
                  { value: 7, label: '最近7天' },
                  { value: 15, label: '最近15天' },
                ]}
                style={{ width: '120px' }}
                onChange={setSearchLatestDays}
              />
            </ProFormItem>
            <div style={{ textAlign: 'center' }}>
              <Access
                key="search"
                accessible={access.functionAccess('alitaMonitor_picSearchInCapture')}
              >
                <Button type="primary" onClick={onSearch}>
                  查询
                </Button>
              </Access>
            </div>
          </div>
        </Pane>
        <Pane>
          <Spin spinning={loading}>
            <div className={styles.rightContent}>
              <h3 className={styles.cardTitle}>轨迹详情</h3>
              <div className={styles.cardContent}>
                <Timeline>
                  {dataList.length &&
                    dataList.map((item, index) => {
                      return (
                        <Timeline.Item key={index}>
                          <Row>
                            <Col span={8}>
                              <ProFormText label="抓拍设备">
                                <div>{item.deviceName}</div>
                              </ProFormText>
                            </Col>
                            <Col span={8}>
                              <ProFormText label="出现位置">
                                <div>{item.devicePosition}</div>
                              </ProFormText>
                            </Col>
                            <Col span={24}>
                              <ProFormText label="停留时间">
                                <div>{item.times}</div>
                              </ProFormText>
                            </Col>
                          </Row>
                          <div className={styles.imageDiv}>
                            {item.picCaptureInfoList.map((innerItem: any, j: number) => {
                              return (
                                <div key={j} className={styles.imageDiv.image}>
                                  <Image src={innerItem.capturePicUrl} />
                                </div>
                              );
                            })}
                          </div>
                        </Timeline.Item>
                      );
                    })}
                </Timeline>
                {dataList.length === 0 && (
                  <div className={styles.noData}>还未上传需要查找的人脸</div>
                )}
              </div>
            </div>
          </Spin>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};
