import FileUpload from '@/components/FileUpload';
import { monitorBusiness } from '@/components/FileUpload/business';
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';
import { Method } from '@/utils';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Image, InputNumber, Spin, Upload, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './style.less';
import { ProFormItem } from '@ant-design/pro-components';
import Detail from './detail';
import type { UploadFile } from 'antd/es/upload/interface';
import { generateGetUrl } from '@/services/file';
import { intelligentfaceGroup } from '@/services/monitor';
import { Access, useAccess } from 'umi';

export default () => {
  const [objectId, setObjectId] = useState<string>();
  const [rate, setRate] = useState<any>(85);
  const [detailShow, setDetailShow] = useState(false);
  const [detailData, setDetailData] = useState<any>();
  const [faceList, setFaceList] = useState<Record<string, any>[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>();
  const project = JSON.parse((sessionStorage.getItem('VprojectInfo') as string) || '{}');
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

  const handleSearch = async (url: string) => {
    setLoading(true);
    const res = await intelligentfaceGroup({
      faceUrl: url,
      faceSimilarity: rate,
      projectId: project.bid,
    });
    setLoading(false);
    const faceListTem = (res?.data || []).map((item) => {
      return {
        ...item,
        image: item.faceUrl,
        rate: item.similarity,
        group: item.faceGroupName,
      };
    });
    if (faceListTem.length > 0) {
      setFaceList(faceListTem);
    } else {
      message.warning('未找到相关人脸数据');
      setFaceList([]);
    }
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
          <div id="imgagg" />
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
            <ProFormItem label="人脸相似度大于" style={{ margin: '30px auto', padding: '0 10px' }}>
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
            <div style={{ textAlign: 'center' }}>
              <Access
                key="search"
                accessible={access.functionAccess('alitaMonitor_picSearchInFaceGroup')}
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
            <div className={styles.rightContent} style={{}}>
              <h3 className={styles.cardTitle}>身份识别</h3>
              <div className={styles.cardContent}>
                {faceList.length > 0 &&
                  faceList.map((item, index) => {
                    return (
                      <div className={styles.item} key={index}>
                        <Image src={item.image} />
                        <div className={styles.itemText}>{`相似度：${item.rate}%`}</div>
                        <div className={styles.itemText}>{`所属分组：${item.group}`}</div>
                        <a
                          onClick={() => {
                            setDetailShow(true);
                            setDetailData(item);
                          }}
                        >
                          查看详情
                        </a>
                      </div>
                    );
                  })}
                {faceList.length === 0 && (
                  <div className={styles.noData}>还未上传需要查找的人脸</div>
                )}
              </div>
            </div>
          </Spin>
        </Pane>
      </SplitPane>
      <Detail open={detailShow} onOpenChange={setDetailShow} data={detailData} readonly />
    </PageContainer>
  );
};
