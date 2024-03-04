import ModalForm from '@/components/ModalForm';
import Preview, { BpmnPreviewRef } from '../BPMN/preview';
import { useEffect, useRef } from 'react';
import Style from './index.less';

export interface FlowPreviewProps {
  name: string;
  modelXml: string;
}
export default ModalForm<FlowPreviewProps>(
  ({ source, visible }) => {
    const previewRef = useRef<BpmnPreviewRef>(null);

    useEffect(() => {
      if (!visible) {
        previewRef.current?.toggle(false);
      }
    }, [visible]);

    return (
      <div className={Style.flow_preview}>
        <h4 className="w-100">流程名称：{source?.name || ''}</h4>
        <div style={{ flex: 1 }}>
          <Preview ref={previewRef} schema={source?.modelXml} />
        </div>
      </div>
    );
  },
  {
    title: '预览流程',
    width: '100vw',
    footer: false,
    style: {
      maxWidth: '100vw',
      top: 0,
      paddingBottom: 0,
    },
    bodyStyle: {
      height: 'calc(100vh - 65px)',
      overflow: 'hidden',
    },
    destroyOnClose: true,
  },
);
