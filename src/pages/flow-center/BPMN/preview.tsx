/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
// 引入bpmn建模器
import BpmnModeler from 'bpmn-js/lib/Modeler';

// 引入属性解析文件和对应的解析器
import flowableDescriptor from './core/descriptor/flowable.json';
import { flowableExtension } from './core/moddle/flowable';
import camundaDescriptor from './core/descriptor/camunda.json';
import { camundaExtension } from './core/moddle/camunda';
import activitiDescriptor from './core/descriptor/activiti.json';
import { activitiExtension } from './core/moddle/activiti';

// 引入bpmn工作流绘图工具(bpmn-js)样式
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

// 引入属性面板(properties-panel)样式
import 'bpmn-js-properties-panel/dist/assets/element-templates.css';
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css';

// 引入翻译模块
import translationsCN from './core/translate/zh.js';
import customTranslate from './core/translate/customTranslate.js';

// 模拟流转流程
import TokenSimulationModule from 'bpmn-js-token-simulation';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';

// 引入流程图文件
import DefaultEmptyXML from './core/constant/emptyXml';

// 引入当前组件样式
import { Button, message, Space, Tooltip } from 'antd';

// 组件引入
import { CompressOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

// 常量引入
import { ACTIVITI_PREFIX, CAMUNDA_PREFIX, FLOWABLE_PREFIX } from './core/constant/constants';
import ButtonGroup from 'antd/es/button/button-group';
import { defaultThemeData } from './theme';
import { useModel } from 'umi';
import Style from './index.less';

export interface BpmnPreviewRef {
  setSchema: (schema: any) => void;
  toggle: (visible?: boolean) => void;
}

export default forwardRef<BpmnPreviewRef, { schema?: string }>(({ schema }, ref) => {
  // state
  const [bpmnModeler, setBpmnModeler] = useState<any>();
  const [simulationStatus, setSimulationStatus] = useState<boolean>(false);
  const [zoomSize, setZoomSize] = useState<number>(1);
  // redux
  const { flowState, flowTheme, handleProcessId, handleProcessName } = useModel(
    'useFlow',
    (model) => ({
      flowState: model.flowState,
      flowTheme: model.flowTheme,
      handleProcessId: model.handleProcessId,
      handleProcessName: model.handleProcessName,
    }),
  );
  const bpmnPrefix = flowState.prefix;
  const processId = flowState.processId;
  const processName = flowState.processName;
  const darkMode = flowTheme.darkMode;

  const toggleStatus = (visible?: boolean, modeler?: any) => {
    if (visible === undefined || (visible && !simulationStatus) || (!visible && simulationStatus)) {
      const currModeler = modeler || bpmnModeler;
      currModeler?.get('toggleMode')?.toggleMode();
      setSimulationStatus(!visible);
    }
  };

  useImperativeHandle(ref, () => ({
    setSchema(schema: any) {
      createBpmnDiagram(schema);
    },
    toggle: toggleStatus,
  }));

  /**
   * 初始化建模器
   * 1、这一步在绘制流程图之前进行，且随流程前缀改变而改变；
   * 2、因为解析器和解析文件与流程引擎类型(也就是前缀)有关，因此这里依赖的变量是放在redux里的流程前缀名
   */
  useEffect(() => {
    // 重新加载前需要销毁之前的modeler，否则页面上会加载出多个建模器
    if (bpmnModeler) {
      bpmnModeler.destroy();
      setBpmnModeler(undefined);
    }
    (async () => {
      // 每次重新加载前需要先消除之前的流程信息
      handleProcessId(undefined);
      await handleProcessName(undefined);
      initBpmnModeler();
    })();
  }, [bpmnPrefix]);

  /**
   * 初始化建模器
   */
  function initBpmnModeler() {
    console.log('【初始化建模器】1、初始化建模器开始');
    const modeler = new BpmnModeler({
      container: '#canvas',
      height: '96.5vh',
      additionalModules: getAdditionalModules(),
      moddleExtensions: getModdleExtensions(),
    });
    setBpmnModeler(modeler);

    /**
     * 添加解析器
     */
    function getAdditionalModules() {
      console.log('【初始化建模器】2、添加解析器');
      const modules: any[] = [];
      if (bpmnPrefix === FLOWABLE_PREFIX) {
        modules.push(flowableExtension);
      }
      if (bpmnPrefix === CAMUNDA_PREFIX) {
        modules.push(camundaExtension);
      }
      if (bpmnPrefix === ACTIVITI_PREFIX) {
        modules.push(activitiExtension);
      }
      // 添加翻译模块
      const TranslateModule = {
        // translate: ["value", customTranslate(translations || translationsCN)] translations是自定义的翻译文件
        translate: ['value', customTranslate(translationsCN)],
      };
      modules.push(TranslateModule);
      // 添加模拟流转模块
      modules.push(TokenSimulationModule);
      return modules;
    }

    /**
     * 添加解析文件
     */
    function getModdleExtensions() {
      console.log('【初始化建模器】3、添加解析文件');
      const extensions: any = {};
      if (bpmnPrefix === FLOWABLE_PREFIX) {
        extensions.flowable = flowableDescriptor;
      }
      if (bpmnPrefix === CAMUNDA_PREFIX) {
        extensions.camunda = camundaDescriptor;
      }
      if (bpmnPrefix === ACTIVITI_PREFIX) {
        extensions.activiti = activitiDescriptor;
      }
      return extensions;
    }

    console.log('【初始化建模器】4、初始化建模器结束');
    createBpmnDiagram(schema, modeler);
  }

  /**
   * 绘制流程图
   * 1、调用 modeler 的 importXML 方法，将 xml 字符串转为图像；
   *
   * @param xml
   */
  function createBpmnDiagram(xml?: string, modeler?: any) {
    console.log('【绘制流程图】1、开始绘制流程图', xml);
    const newId = processId || 'Process_' + new Date().getTime();
    const newName = processName || '业务流程_' + new Date().getTime();
    const newXML = xml ? xml : DefaultEmptyXML(newId, newName, bpmnPrefix);
    const currModeler = modeler || bpmnModeler;
    // 执行importXML方法
    try {
      currModeler?.importXML(newXML);
    } catch (e) {
      console.error('【流程图绘制出错】错误日志如下: ↓↓↓');
      console.error(e);
    }
    // 更新流程信息，初始化建模器后，有了modeler，通过modeler获取到canvas，就能拿到rootElement，从而获取到流程的初始信息
    console.log('【绘制流程图】2、更新流程节点信息');
    setTimeout(() => {
      if (!currModeler) return;
      const canvas = currModeler.get('canvas');
      const rootElement = canvas.getRootElement();
      // 获取流程id和name
      const id: string = rootElement.id;
      const name: string = rootElement.businessObject.name;
      handleProcessId(id);
      handleProcessName(name);
      toggleStatus(true, modeler);
    }, 10);
    console.log('【绘制流程图】3、流程图绘制完成');
  }

  /**
   * 渲染 视图操作按钮组
   */
  function renderScaleControlButtons() {
    const zoomStep = 0.1;

    function handleZoomIn() {
      let newSize: number = Math.floor(zoomSize * 100 + zoomStep * 100) / 100;
      if (newSize > 4) {
        newSize = 4;
        message.warning('已达到最大倍数 400%, 不能继续放大').then(() => {});
      }
      setZoomSize(newSize);
      bpmnModeler.get('canvas').zoom(newSize);
    }

    function handleZoomOut() {
      let newSize: number = Math.floor(zoomSize * 100 - zoomStep * 100) / 100;
      if (newSize < 0.2) {
        newSize = 0.2;
        message.warning('已达到最小倍数 20%, 不能继续缩小').then(() => {});
      }
      setZoomSize(newSize);
      bpmnModeler.get('canvas').zoom(newSize);
    }

    function resetZoom() {
      setZoomSize(1);
      bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
    }

    return (
      <>
        <Tooltip title="缩小视图">
          <Button
            type={'default'}
            size={'small'}
            style={{ width: '45px' }}
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
          />
        </Tooltip>
        <Button
          className={Style.bpmn_preview_zoom}
          type={'default'}
          size={'small'}
          style={{ width: '65px' }}
        >
          {Math.floor(zoomSize * 10 * 10) + '%'}
        </Button>
        <Tooltip title="放大视图">
          <Button
            type={'default'}
            size={'small'}
            style={{ width: '45px' }}
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
          />
        </Tooltip>
        <Tooltip title="重置视图并居中">
          <Button
            type={'default'}
            size={'small'}
            style={{ width: '45px' }}
            icon={<CompressOutlined />}
            onClick={resetZoom}
          />
        </Tooltip>
      </>
    );
  }

  /**
   * 渲染顶部工具栏
   */
  function renderToolBar() {
    return (
      <>
        <Space direction={'horizontal'} size={8} style={{ marginTop: 3, marginBottom: 3 }}>
          {/* 基本操作按钮组 */}
          {/* <ButtonGroup> */}
          {/*引入 {renderImportButton()} */}
          {/*下载 {renderDownloadButton()} */}
          {/* {renderSimulationButton()} */}
          {/* </ButtonGroup> */}
          {/* 缩放按钮组 */}
          <ButtonGroup>{renderScaleControlButtons()}</ButtonGroup>
          {/*配置中心按钮*/}
          {/* <ConfigServer /> */}
        </Space>
      </>
    );
  }

  return (
    <div
      className={Style.bpmn_preview}
      style={{
        backgroundColor: darkMode ? defaultThemeData.darkBgColor : defaultThemeData.lightBgColor,
      }}
    >
      {renderToolBar()}
      <div
        id="canvas"
        style={{
          backgroundColor: darkMode
            ? defaultThemeData.darkCanvasBgColor
            : defaultThemeData.lightCanvasBgColor,
          // 网格线样式
          background:
            '-webkit-linear-gradient(top, transparent 15px, #f2f2f2 0),-webkit-linear-gradient(left, transparent 15px, #f2f2f2 0)',
          backgroundSize: '16px 16px',
          flex: 1,
        }}
      />
    </div>
  );
});
