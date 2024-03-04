import 'antd/dist/antd.less';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  Designer,
  DesignerToolsWidget,
  ViewToolsWidget,
  Workspace,
  OutlineTreeWidget,
  ResourceWidget,
  HistoryWidget,
  StudioPanel,
  CompositePanel,
  WorkspacePanel,
  ToolbarPanel,
  ViewportPanel,
  ViewPanel,
  SettingsPanel,
  ComponentTreeWidget,
} from '@designable/react';
import { SettingsForm, setNpmCDNRegistry } from '@designable/react-settings-form';
import { createDesigner, GlobalRegistry, Shortcut, KeyCode } from '@designable/core';
import { ActionsWidget, PreviewWidget, SchemaEditorWidget, MarkupSchemaWidget } from './widgets';
import { loadInitialSchema, saveSchema } from './service';
import Style from './index.less';
import {
  Form,
  Field,
  Card,
  Space,
  FormTab,
  FormCollapse,
  FormLayout,
  FormGrid,
} from '@designable/formily-antd';
import {
  Input,
  Select,
  Checkbox,
  DatePicker,
  TimePicker,
  Radio,
  NumberPicker,
  Cascader,
  Upload,
  Text,
  ArrayCards,
} from './extension/components';
import { transformToSchema } from '@designable/formily-transformer';

setNpmCDNRegistry('//unpkg.com');

// Form.Behavior = createBehavior({
//   name: 'Form',
//   selector: (node) => node.componentName === 'Form',
//   designerProps(node) {
//     return {
//       draggable: !node.isRoot,
//       cloneable: !node.isRoot,
//       deletable: !node.isRoot,
//       droppable: true,
//       propsSchema: {
//         type: 'object',
//         properties: {
//           ...(AllSchemas.FormLayout.properties as any),
//           style: AllSchemas.CSSStyle,
//         },
//       },
//       defaultProps: {
//         labelWidth: '100px',
//         wrapperWidth: '300px',
//       },
//     };
//   },
//   designerLocales: AllLocales.Form,
// });

GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    sources: {
      Inputs: '输入控件',
      Layouts: '布局组件',
      Arrays: '自增组件',
      Displays: '展示组件',
    },
  },
  'en-US': {
    sources: {
      Inputs: 'Inputs',
      Layouts: 'Layouts',
      Arrays: 'Arrays',
      Displays: 'Displays',
    },
  },
  'ko-KR': {
    sources: {
      Inputs: '입력',
      Layouts: '레이아웃',
      Arrays: '배열',
      Displays: '디스플레이',
    },
  },
});

export interface FormDesignerRef {
  getSchema: () => any;
  setSchema: (schema: any) => void;
}
const App = forwardRef<FormDesignerRef, { actions?: React.ReactNode }>(({ actions }, ref) => {
  const engine = useMemo(
    () =>
      createDesigner({
        shortcuts: [
          new Shortcut({
            codes: [
              [KeyCode.Meta, KeyCode.S],
              [KeyCode.Control, KeyCode.S],
            ],
            handler(ctx) {
              saveSchema(ctx.engine);
            },
          }),
        ],
        rootComponentName: 'Form',
      }),
    [],
  );

  useImperativeHandle(ref, () => ({
    getSchema() {
      return transformToSchema(engine.getCurrentTree());
    },
    setSchema(schema: any) {
      localStorage.setItem('formily-schema', JSON.stringify(schema));
      loadInitialSchema(engine);
    },
  }));

  return (
    <Designer engine={engine}>
      <StudioPanel
        className={Style['design-form']}
        logo={<></>}
        actions={
          <>
            {actions}
            <ActionsWidget />
          </>
        }
      >
        <CompositePanel>
          <CompositePanel.Item title="panels.Component" icon="Component">
            <ResourceWidget
              title="sources.Inputs"
              sources={[
                Input,
                NumberPicker,
                Select,
                Cascader,
                Checkbox,
                Radio,
                DatePicker,
                TimePicker,
                Upload,
              ]}
            />
            <ResourceWidget
              title="sources.Layouts"
              sources={[Card, FormGrid, FormTab, FormLayout, FormCollapse, Space]}
            />
            <ResourceWidget title="sources.Arrays" sources={[ArrayCards]} />
            <ResourceWidget title="sources.Displays" sources={[Text]} />
          </CompositePanel.Item>
          <CompositePanel.Item title="panels.OutlinedTree" icon="Outline">
            <OutlineTreeWidget />
          </CompositePanel.Item>
          <CompositePanel.Item title="panels.History" icon="History">
            <HistoryWidget />
          </CompositePanel.Item>
        </CompositePanel>
        <Workspace id="form">
          <WorkspacePanel>
            <ToolbarPanel>
              <DesignerToolsWidget />
              <ViewToolsWidget use={['DESIGNABLE', 'JSONTREE', 'MARKUP', 'PREVIEW']} />
            </ToolbarPanel>
            <ViewportPanel style={{ height: '100%' }}>
              <ViewPanel type="DESIGNABLE">
                {() => (
                  <ComponentTreeWidget
                    components={{
                      Form,
                      Field,
                      Input,
                      Select,
                      Cascader,
                      Radio,
                      Checkbox,
                      NumberPicker,
                      DatePicker,
                      TimePicker,
                      Upload,
                      Text,
                      Card,
                      ArrayCards,
                      Space,
                      FormTab,
                      FormCollapse,
                      FormGrid,
                      FormLayout,
                    }}
                  />
                )}
              </ViewPanel>
              <ViewPanel type="JSONTREE" scrollable={false}>
                {(tree, onChange) => <SchemaEditorWidget tree={tree} onChange={onChange} />}
              </ViewPanel>
              <ViewPanel type="MARKUP" scrollable={false}>
                {(tree) => <MarkupSchemaWidget tree={tree} />}
              </ViewPanel>
              <ViewPanel type="PREVIEW">{(tree) => <PreviewWidget tree={tree} />}</ViewPanel>
            </ViewportPanel>
          </WorkspacePanel>
        </Workspace>
        <SettingsPanel title="panels.PropertySettings">
          <SettingsForm uploadAction="https://www.mocky.io/v2/5cc8019d300000980a055e76" />
        </SettingsPanel>
      </StudioPanel>
    </Designer>
  );
});

export default App;
