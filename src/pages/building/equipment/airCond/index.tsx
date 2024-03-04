import SpaceTree from '@/components/SpaceTree';
import Pane from '@/components/SplitPane/Pane';
import SplitPane from '@/components/SplitPane/SplitPane';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import EquipmentMap from '../../components/equipmentMap';
import EquipmentList from '../../components/equipmentList';
import { useRef, useState } from 'react';

export default () => {
  const [spaceId, setSpaceId] = useState<string>('');
  const mapRef = useRef<any>();
  const spaceRef = useRef<any>();

  const onSelect = (_, info: any, path: any) => {
    setSpaceId((info.node as any).spaceType === 'PROJECT' ? null : (info.node as any).id);
    mapRef?.current?.spaceChange(_, info, path);
  };
  const onSpaceInit = (data: any) => {
    mapRef?.current?.onSpaceInit(data);
  };
  const setSelect = (id: any) => {
    spaceRef.current.setselectedKeys(id);
  };
  return (
    <PageContainer header={{ title: null }}>
      <SplitPane>
        <Pane initialSize={'320px'} maxSize="50%">
          <div style={{ padding: '20px', height: 'calc(100vh - 103px)', overflowY: 'scroll' }}>
            <SpaceTree ref={spaceRef} onSelectChange={onSelect} treeLoadComplate={onSpaceInit} />
          </div>
        </Pane>
        <Pane>
          <div style={{ padding: '0 20px' }}>
            <Tabs
              items={[
                {
                  label: `电子地图`,
                  key: '1',
                  children: <EquipmentMap ref={mapRef} setSelect={setSelect} />,
                },
                {
                  label: `设备列表`,
                  key: '2',
                  children: <EquipmentList spaceId={spaceId} />,
                },
              ]}
            />
          </div>
        </Pane>
      </SplitPane>
    </PageContainer>
  );
};
