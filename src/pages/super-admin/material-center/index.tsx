import { publicMaterialLib } from '@/components/FileUpload/business';
import { getSucccessFileList } from '@/services/file';
import Method from '@/utils/Method';
import ProCard from '@ant-design/pro-card';
import { ProList } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useMount } from 'ahooks';
import { Upload, Image, Button, message } from 'antd';
import { useState } from 'react';
import styles from './style.less';
export default () => {
  const [fileList, setFileList] = useState<any[]>();
  const getUrlList = async () => {
    const res = await getSucccessFileList({ bussinessId: publicMaterialLib.id });
    if (res.code === 'SUCCESS') {
      setFileList(res.data);
    }
  };
  useMount(() => {
    getUrlList();
  });
  const copy = () => {
    message.success('复制成功');
  };
  const data = fileList?.map((item) => ({
    content: (
      <CopyToClipboard text={item.genGetUrl} onCopy={copy}>
        <Image key={item.bid} height={120} preview={false} src={item.genGetUrl} />
      </CopyToClipboard>
    ),
  }));
  const uploadButton = <Button type="primary">上传图片</Button>;
  return (
    <PageContainer className={styles.materialCenter} header={{ title: null }}>
      <ProCard colSpan={24}>
        <ProList<any>
          className={styles.materialCard}
          pagination={{
            defaultPageSize: 96,
            showSizeChanger: false,
          }}
          grid={{ gutter: 2, column: 12 }}
          metas={{
            content: {},
          }}
          dataSource={data}
          search={false}
          headerTitle={'素材库'}
          toolbar={{
            actions: [
              <Upload
                key="upload"
                accept="image/*"
                showUploadList={false}
                customRequest={async (options: any) => {
                  const { onSuccess, file } = options;
                  Method.uploadFile(file, publicMaterialLib).then((url) => {
                    const _response = { name: file.name, status: 'done', path: url };
                    onSuccess(_response, file);
                    message.success('上传成功');
                    getUrlList();
                  });
                }}
              >
                {uploadButton}
              </Upload>,
            ],
          }}
        />
      </ProCard>
    </PageContainer>
  );
};
