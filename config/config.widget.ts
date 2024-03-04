// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
// const { REACT_APP_ENV } = process.env;
const webpack = require('webpack');
export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: false,
    siderWidth: 208,

    ...defaultSettings,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },

  // umi routes: https://umijs.org/docs/routing
  routes: [],
  access: {},
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    // https://ant.design/docs/react/customize-theme-variable-cn
    // 'root-entry-name': 'variable',
    'border-radius': '4px',
    'border-radius-base': '4px', // 组件/浮层圆角
    'border-color': 'red', //
    '@primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  chainWebpack: (memo: any) => {
    memo.entryPoints.clear();
    memo.entry('app').clear().add('./src/pages/flow-center/sdk_v2/index.ts');
    memo.plugin('limitChunk').use(webpack.optimize.LimitChunkCountPlugin, [{ maxChunks: 1 }]);
    memo.plugin('extract-css').tap(() => [
      {
        filename: 'widget.css',
      },
    ]);
    memo.output.filename('widget.js').end();
  },
  outputPath: 'widget_sdk',
  webpack5: {},
  exportStatic: {},
});
