import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ProCard } from '@ant-design/pro-components';
import type { TabsProps } from 'antd';
import { Modal } from 'antd';
import { message } from 'antd';
import { Tabs } from 'antd';
// import ConfigWx from './config-wx';
// import ConfigZfb from './config-zfb';
import ConfigPay from './config-pay';
// import ConfigPass from './config-pass';
import ConfigVisit from './config-visit';
// import ConfigCharge from './config-charge';
// import ConfigBus from './config-bus';
import { useLocation } from 'react-router';
import ProjectYardSelect from '../../components/projectYardTree';
import { getVisitorConfig, ruleConfigDetail } from '@/services/park';
import styles from './style.less';
import { Access, history, useAccess } from 'umi';
import { getProjectBid } from '@/utils/project';
import SplitPane from '@/components/SplitPane/SplitPane';
import Pane from '@/components/SplitPane/Pane';
import { ExclamationCircleFilled } from '@ant-design/icons';

// enum payWayEnum {
//   union = '通联支付',
//   wx = '微信',
//   zfb = '支付宝',
// }

export default () => {
  const access = useAccess();
  // access.functionAccess = () => true;
  // list左侧列表数据
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ParkRuleConfigType>();
  const [visitData, setVisitData] = useState<any>();
  const [parkId, setParkId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isbusConfig, setIsbusConfig] = useState(false);
  const payRef = useRef<any>();
  // const chargeRef = useRef<any>();
  // const busRef = useRef<any>();
  const visitRef = useRef<any>();

  // form类型
  enum formTypes {
    charge = '缴费业务规则',
    pass = '通行规则配置',
    payConfig = '支付配置',
    billConfig = '发票配置',
    busConfig = 'C端业务配置',
    visitConfig = '访客车辆配置',
  }

  const getRuleConfigInfo = async (yardId: any) => {
    console.log('加载： ', yardId);
    setParkId(yardId);

    if (!yardId.length) {
      return;
    }

    setLoading(true);
    const res = await ruleConfigDetail(yardId);

    if (res.code == 'SUCCESS') {
      setFormData(res.data);
    } else {
      message.error(res.message);
    }
    const visitConfig = await getVisitorConfig({ projectId: getProjectBid() });
    if (visitConfig.code === 'SUCCESS') {
      setVisitData(visitConfig.data);
    }

    setProjectId(getProjectBid());
    setLoading(false);
  };

  // const chargeAccess = access.functionAccess('alitaParking_businessRuleManage_charge');
  // const passAccess = access.functionAccess('alitaParking_businessRuleManage_pass');
  const payAccess = access.functionAccess('alitaParking_businessRuleManage_pay');

  const items: TabsProps['items'] = [];
  // if (chargeAccess) {
  //   items.push({
  //     key: '1',
  //     label: formTypes.charge,
  //     children: (
  //       <ConfigCharge
  //         projectId={projectId}
  //         parkId={parkId}
  //         data={formData}
  //         loading={loading}
  //         ref={chargeRef}
  //       />
  //     ),
  //   });
  // }

  // if (passAccess) {
  //   items.push({
  //     key: '2',
  //     label: formTypes.pass,
  //     children: (
  //       <ConfigPass projectId={projectId} parkId={parkId} data={formData} loading={loading} />
  //     ),
  //   });
  // }

  if (payAccess) {
    items.push({
      key: '1',
      label: formTypes.payConfig,
      children: (
        <ConfigPay
          projectId={projectId}
          parkId={parkId}
          data={formData}
          loading={loading}
          ref={payRef}
        />
      ),
    });
  }
  // items.push({
  //   key: '4',
  //   label: formTypes.busConfig,
  //   children: <ConfigBus loading={loading} ref={busRef} />,
  // });

  // items.push({
  //   key: '2',
  //   label: formTypes.visitConfig,
  //   children: (
  //     <ConfigVisit
  //       projectId={projectId}
  //       parkId={parkId}
  //       data={visitData}
  //       loading={loading}
  //       ref={visitRef}
  //     />
  //   ),
  // });

  // {
  //   key: '4',
  //   label: formTypes.billConfig,
  //   children: <ConfigWx data={formData} />,
  //   // payWay == payWayEnum.wx ? (
  //   //   <ConfigWx data={formData} />
  //   // ) : payWay == payWayEnum.zfb ? (
  //   //   <ConfigZfb data={formData} />
  //   // ) : null,
  // },

  const [activeKey, setActiveKey] = useState('1');
  const location = useLocation();
  const hashArray = ['pay'];

  useEffect(() => {
    const hash = window.location.hash.replace(/#/g, '');
    const index = hashArray.indexOf(hash);
    if (index > -1) {
      setActiveKey(`${index + 1}`);
    } else {
      if (items.length) {
        setActiveKey(items[0].key);
      }
    }
    // if (index === 3) {
    //   setIsbusConfig(true);
    // } else {
    //   setIsbusConfig(false);
    // }
  }, [location]);

  const changeSuccess = (key: string) => {
    window.location.hash = hashArray[Number(key) - 1];
    setActiveKey(key);
    if (key === '4') {
      setIsbusConfig(true);
    }
  };
  const afterClick = (key: string, currentRef: any) => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '数据还未保存，是否保存？',
      centered: true,
      onOk: async () => {
        currentRef.onEditBtn(() => {
          changeSuccess(key);
        });
      },
      onCancel() {
        changeSuccess(key);
      },
    });
  };
  const handleChange = (key: string) => {
    // if (activeKey === '1' && !chargeRef.current.disable) {
    //   afterClick(key, chargeRef.current);
    // } else
    if (activeKey === '3' && !payRef.current.disable) {
      afterClick(key, payRef.current);
    }
    //  else if (activeKey === '4' && !busRef.current.disable) {
    //   afterClick(key, busRef.current);
    // }
    else {
      changeSuccess(key);
    }
  };
  return (
    <PageContainer
      header={{
        // title: '规则配置',
        title: null,

        onBack: () => {
          history.goBack();
        },
      }}
    >
      <Access
        key="park-config"
        accessible={access.functionAccess('alitaParking_queryBusinessRule')}
      >
        {/* <ProCard gutter={8}> */}
        <SplitPane>
          <Pane initialSize={'320px'} maxSize="50%">
            <div style={{ padding: '4px 0 0 0' }}>
              <ProCard
                bordered
                className={`${styles.customTree} ${isbusConfig ? `${styles.none}` : ''} `}
              >
                <ProjectYardSelect onSelect={getRuleConfigInfo} />
              </ProCard>
            </div>
          </Pane>
          <Pane>
            <ProCard colSpan={17} className={styles.content}>
              <Tabs
                activeKey={activeKey}
                items={items}
                onChange={(key) => {
                  handleChange(key);
                }}
              />
            </ProCard>
          </Pane>
        </SplitPane>

        {/* </ProCard> */}
      </Access>
    </PageContainer>
  );
};
