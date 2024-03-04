import type { TreeProps } from 'antd/es/tree';
import ProCard from '@ant-design/pro-card';
import SpaceTree from '@/components/SpaceTree';
import { PageContainer } from '@ant-design/pro-layout';
import { Key, useMemo, useRef, useState } from 'react';
import { Avatar, Collapse, Statistic, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
const { Divider } = ProCard;
const { Panel } = Collapse;
import styles from './index.less';
import DetailModal from './detailModal';
import ConfigModal from './configModal';
import { useRequest } from 'umi';
import { getSpaceDevice } from '@/services/monitor';
import classNames from 'classnames';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
// import { storageSy } from '@/utils/Setting';
// import onlLineImage from '/images/jkon.png';
const TableList: React.FC = () => {
  const project = JSON.parse((sessionStorage.getItem('VprojectInfo') as string) || '{}');
  // const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}' as string);
  const [parentId, setParentId] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [configOpen, setConfigOpen] = useState(false);
  const [configData, setConfigData] = useState<Record<string, any>>();
  const treeRef = useRef<any>();
  const onLineJKSrc = '/images/monitoron.svg';
  const offLineJKSrc = '/images/monitoroff.svg';
  const qysbzsSrc = '/images/qysbzs.png';
  const lxsbSrc = '/images/lxsb.png';
  const xcxkcksbsSrc = '/images/xcxkcks.png';
  const dnlsbSrc = '/images/dnlsb.png';
  const intelligenceTypeOptions = [
    { label: '云控', value: 2 },
    { label: '智能', value: 1 },
    { label: '', value: 0 },
  ];
  const treeLoadComplate: any = (treeData: any) => {
    treeRef.current.setselectedKeys(treeData[0]?.id);
    setParentId(treeData[0]?.id);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setParentId((info.node as any).id);
  };

  const onConfigClick = () => {
    setConfigData({ spaceId: parentId });
    setConfigOpen(true);
  };

  const { data, run } = useRequest(
    async () => {
      if (parentId) {
        return getSpaceDevice({ spaceId: parentId });
      } else {
        return {} as any;
      }
    },
    {
      refreshDeps: [parentId],
    },
  );
  const onDetailSubmit = () => {
    run();
  };
  const onConfigSubmit = () => {
    run();
  };
  const deviceList = useMemo(() => {
    if (data) {
      return [data?.spaceVO, ...(data?.subSpaceVOList || [])].map((item) => {
        const { deviceVOList } = item;
        const deviceVOListTem = (deviceVOList || []).map((innerItem: any) => {
          const { intelligenceType, status } = innerItem;
          const intelligenceTypeName = (
            intelligenceTypeOptions.find((j) => j.value === intelligenceType) || {}
          ).label;
          return {
            ...innerItem,
            intelligenceTypeName,
            src: status === 1 ? onLineJKSrc : offLineJKSrc,
          };
        });
        return {
          ...item,
          deviceVOList: deviceVOListTem,
        };
      });
    }
    return [];
  }, [data]);
  const getStatusClassNames = (typeName: string) => {
    return classNames(
      styles.typeTip,
      typeName === '云控' ? styles.yun : '',
      typeName === '智能' ? styles.zhi : '',
    );
  };

  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div>
            <ProCard
              bodyStyle={{
                height: 'calc(100vh - 103px)',
                overflowY: 'scroll',
                padding: '20px 0 0 20px',
              }}
              colSpan={5}
            >
              <SpaceTree
                ref={treeRef}
                projectBid={project.bid || ''}
                cardProps={{ bodyStyle: { padding: '0' } }}
                onSelectChange={onSelect}
                mode="monitoring"
                treeLoadComplate={treeLoadComplate}
              />
            </ProCard>
          </div>
        </Pane>
        <Pane>
          <ProCard split="horizontal">
            <ProCard>
              <ProCard.Group title="设备概况" direction={'row'} className={styles.cusCard}>
                <ProCard className={styles.cusCardItem}>
                  <div className={styles.bg1}>
                    <Statistic title="区域设备总数" suffix=" 台" value={data?.devicesTotal} />
                    <Avatar shape="square" size={32} src={qysbzsSrc} />
                  </div>
                </ProCard>
                <ProCard className={styles.cusCardItem}>
                  <div className={styles.bg2}>
                    <Statistic title="离线设备数" suffix=" 台" value={data?.offlineDevicesCount} />
                    <Avatar src={lxsbSrc} shape="square" size={32} />
                  </div>
                </ProCard>
                {/* <ProCard className={styles.cusCardItem}>
                  <div className={styles.bg3}>
                    <div>
                      <Statistic
                        title={
                          <span>
                            <span style={{ marginRight: '4px' }}>{'小程序可查看设备数'}</span>
                            <Tooltip
                              title="配置监控点位后，业主小程序上将可查阅实时监控管理员小程序点位不受此配置限制"
                              style={{ marginLeft: '2px' }}
                            >
                              <InfoCircleOutlined />
                            </Tooltip>
                          </span>
                        }
                        value={data?.appDevicesCount}
                        suffix=" 台"
                      />
                      <a onClick={onConfigClick}>立即配置</a>
                    </div>
                    <Avatar src={xcxkcksbsSrc} shape="square" size={32} />
                  </div>
                  <div />
                </ProCard> */}
                <ProCard className={styles.cusCardItem}>
                  <div className={styles.bg4}>
                    <Statistic
                      title={
                        <>
                          <span style={{ marginRight: '4px' }}>{'带能力设备数'}</span>
                          <Tooltip title="带能力设备包括云控摄像头、人脸抓拍摄像头等具有除监控的其它能力摄像头">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </>
                      }
                      // valueStyle={{ color: '#00b42b' }}
                      suffix=" 台"
                      value={data?.capableDevicesCount}
                    />
                    <Avatar src={dnlsbSrc} shape="square" size={32} />
                  </div>
                </ProCard>
              </ProCard.Group>
            </ProCard>
            <ProCard style={{ minHeight: 'calc(100vh - 320px)' }}>
              <Collapse
                defaultActiveKey={['0']}
                ghost
                className={styles.collapsePanel}
                expandIconPosition={'end'}
              >
                {deviceList.map((item, index) => (
                  <Panel
                    key={index}
                    header={
                      <>
                        {item.name}（共 {item.devicesTotal} 台，在线
                        <span style={{ color: '#00b42b' }}> {item.onlineDevicesCount} </span>
                        台，离线
                        <span style={{ color: '#a9aeb8' }}> {item.offlineDevicesCount} </span>台）
                      </>
                    }
                  >
                    <div className={styles.imageItem}>
                      {item.deviceVOList.map((innerItem: any, j: any) => (
                        <div
                          key={j}
                          onClick={() => {
                            setDetailOpen(true);
                            setDetailData(innerItem);
                          }}
                        >
                          <Avatar
                            size="small"
                            className={styles.avatar}
                            src={innerItem.src}
                            alt="avatar"
                          />
                          {innerItem.intelligenceTypeName && (
                            <div className={getStatusClassNames(innerItem.intelligenceTypeName)}>
                              {innerItem.intelligenceTypeName}
                            </div>
                          )}
                          <div>{innerItem.name}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </ProCard>
          </ProCard>
        </Pane>
      </SplitPane>
      {/* <ProCard
        headerBordered
        style={{ padding: '10px 0' }}
        bordered
        split={'vertical'}
        bodyStyle={{
          borderTop: '1px solid #f0f0f0',
        }}
      > */}

      {/* </ProCard> */}
      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSubmit={onDetailSubmit}
        data={detailData}
      />
      <ConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        data={configData}
        onSubmit={onConfigSubmit}
      />
    </PageContainer>
  );
};

export default TableList;
