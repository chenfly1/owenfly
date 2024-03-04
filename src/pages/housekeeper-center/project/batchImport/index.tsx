import { PageContainer } from '@ant-design/pro-layout';

import styles from './style.less';
import { ProColumns } from '@ant-design/pro-components'; // 引入一些类型定义

import { ProTable } from '@ant-design/pro-components'; // 引入表格组件
import { Button, Dropdown, Space, message } from 'antd'; // 引入一些常用的组件
import { CaretDownOutlined } from '@ant-design/icons'; // 引入icon
import { useState } from 'react';

// 表单
export type TableListItem = {
  key: number;
  serialNumber: string; //序号
  fileName: string; //文件名
  creatorAccount: string; //创建人账号
  creatorName: string; //创建人名称
  creationTime: string; //创建日期
  associatedProject: string; //关联项目
};
const tableListDataSource: TableListItem[] = [];

const creators = ['付小小', '曲丽丽', '林东东', '陈帅帅', '兼某某'];
const gender = ['男', '女'];
for (let i = 0; i < 30; i += 1) {
  tableListDataSource.push({
    key: i,
    serialNumber: `序号${i}`,
    fileName: `文件名${i}`,
    creatorAccount: `000${(i + 2) * 122 * 12 - 12}`,
    creatorName: creators[Math.floor(Math.random() * creators.length)],
    creationTime: `${Date.now() - Math.floor(Math.random() * 2000)}`,
    associatedProject: i % 2 === 1 ? `已关联${i}` : `未关联${i}`,
  });
}

// 创建表格页面的模型
const columns: ProColumns<TableListItem>[] = [
  // 创建表格的列配置
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 140,
    order: 1,
    ellipsis: true, // 文字超出省略
    hideInSearch: true,
  },
  {
    title: '文件名',
    dataIndex: 'fileName',
    width: 140,
    order: 3,
    ellipsis: true,
    // hideInSearch: true,
  },
  {
    title: '创建人账号',
    dataIndex: 'creatorAccount',
    width: 160,
    order: 1,
    ellipsis: true,
  },
  {
    title: '创建人名称',
    dataIndex: 'creatorName',
    width: 160,
    order: 2,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'creationTime',
    width: 160,
    order: 4,
    ellipsis: true,
    valueType: 'dateRange',
    fieldProps: {
      placeholder: ['开始日期', '结束日期'], // 设置默认提示信息
      onChange: (res) => {
        // actionRef.current?.reload();
        console.log('时间:' + res);
      },
    },
    // sorter: (a, b) => (a.creationTime > b.creationTime ? 1 : -1),
  },

  {
    title: '关联项目',
    dataIndex: 'associatedProject',
    width: 160,
    order: 1,
    ellipsis: true,
    hideInTable: true,
  },

  {
    title: '操作',
    width: 180,
    key: 'option',
    valueType: 'option',
    render: (text, record, index) => {
      return <a>下载</a>;
    },
  },
];

// 表单end

export default () => {
  const [dataSource, setDataSource] = useState<TableListItem[]>(tableListDataSource); //表单数据

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <ProTable<TableListItem>
        columns={columns} // 表格的列配置
        className="tableStyle"
        dataSource={dataSource}
        // request={}// 获取表格数据的异步请求函数
        rowKey="key" // 表格行的唯一键
        search={
          // 表格的搜索表单配置
          {
            labelWidth: 100,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          // 表格的分页器配置
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <div key="div">
            <div className={styles.divStyle}>
              <Button key="button" onClick={() => {}} type="primary">
                批量上传
              </Button>
            </div>
            <div>
              <Button key="button1" onClick={() => {}}>
                下载模板
              </Button>
              <Button style={{ marginLeft: 20 }} key="button2" onClick={() => {}}>
                批量较验
              </Button>
            </div>
          </div>,
        ]}
      />
    </PageContainer>
  );
};
