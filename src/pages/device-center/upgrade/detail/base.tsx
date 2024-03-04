import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Spin } from 'antd';
import { useEffect, useState } from 'react';
import Style from './index.less';
import { ArrowDownOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { getProductUpgradeTaskDetail } from '@/services/device';
import { useParams } from 'umi';
import { DependencyVersionUpgradeMap, RetryTaskMap, SourceEnum, SourceMap } from '../config';
import { generateGetUrl } from '@/services/file';

export default () => {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [source, setSource] = useState<Partial<ProductUpgradeTaskItemType>>({});
  const [visible, setVisible] = useState<boolean>(false);

  const downloadSource = async () => {
    if (source?.businessId && source?.fileObjectId) {
      setDownloading(true);
      const urlRes = await generateGetUrl({
        bussinessId: source?.businessId,
        urlList: [
          {
            objectId: source.fileObjectId,
          },
        ],
      }).finally(() => {
        setDownloading(false);
      });
      window.location.href = urlRes?.data?.urlList[0]?.presignedUrl?.url;
    }
  };

  useEffect(() => {
    setLoading(true);
    getProductUpgradeTaskDetail(params.id)
      .then((res) => {
        setSource(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <Spin spinning={loading} className={Style.upgrade_detail_base}>
      <ProDescriptions<Partial<ProductUpgradeTaskItemType>>
        column={3}
        dataSource={source}
        columns={[
          {
            title: '所属产品',
            key: 'productName',
            dataIndex: 'productName',
          },
          {
            title: '升级版本目标',
            key: 'targetVersion',
            dataIndex: 'targetVersion',
          },
          {
            title: '资源路径',
            key: 'fileObjectId',
            dataIndex: 'fileObjectId',
            render: (_, row: ProductUpgradeTaskItemType) => {
              return (
                <>
                  <span>{SourceMap[row.resourceSource] ?? ''}</span>
                  {row.resourceSource === SourceEnum.local ? (
                    <Button
                      size="small"
                      type="default"
                      icon={<ArrowDownOutlined />}
                      loading={downloading}
                      onClick={downloadSource}
                      className={Style.upgrade_detail_base_download}
                    >
                      下载文件
                    </Button>
                  ) : null}
                </>
              );
            },
          },
        ].concat(
          visible
            ? [
                {
                  title: '升级时间',
                  key: 'upgradeTime',
                  dataIndex: 'upgradeTime',
                },
                {
                  title: '依赖版本是否补充更新',
                  key: 'dependencyVersionUpgrade',
                  dataIndex: 'dependencyVersionUpgrade',
                  render: (_, row) => {
                    return DependencyVersionUpgradeMap[row.dependencyVersionUpgrade] ?? '';
                  },
                },
                {
                  title: '任务失败是否重试',
                  key: 'isRetry',
                  dataIndex: 'isRetry',
                  render: (_, row) => {
                    return RetryTaskMap[row.isRetry] ?? '';
                  },
                },
                {
                  title: '任务创建时间',
                  key: 'gmtCreated',
                  dataIndex: 'gmtCreated',
                },
                {
                  title: '升级描述',
                  key: 'description',
                  dataIndex: 'description',
                },
              ]
            : [],
        )}
      />
      <a className={Style.upgrade_detail_show} onClick={() => setVisible(!visible)}>
        {visible ? '收起' : '展开'}
        {visible ? <UpOutlined /> : <DownOutlined />}
      </a>
    </Spin>
  );
};
