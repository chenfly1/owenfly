import type { ActionType, ProColumns } from '@ant-design/pro-components'; // 引入一些类型定义
import { PageContainer } from '@ant-design/pro-layout'; // 引入布局组件
import ProjectSelect from './ProjectSelect';

import { ProTable } from '@ant-design/pro-components'; // 引入表格组件
import { Button, Card, Tabs } from 'antd'; // 引入一些常用的组件
import { useEffect, useRef, useState } from 'react'; // 引入hook
import { Access, useAccess, history } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import AddModelForm from './add'; // 引入添加模型的组件
import { workOrderQuery, dictionaryList, ticketType } from '@/services/workorder';
import styles from './style.less';
import { storageSy } from '@/utils/Setting';
import { NoticeBoxType } from '@/components/NoticeBox/config';
import { useModel } from 'umi';

export default () => {
  const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));

  const actionRef = useRef<ActionType>(); // 创建一个ref，用于操作表格
  const [addModalVisit, setAddModalVisit] = useState<boolean>(false); // 创建一个状态，用于控制添加模型的弹框的显示隐藏
  const [editData, setEditData] = useState<any>(); // 创建一个状态，用于控制编辑模型的弹框的数据
  const [cascaderOptions, setCascaderOptions] = useState<Category>();
  const [categoryId, setCategoryId] = useState<number | string>();
  const [projectBid, setProjectBid] = useState<string>(project ? project.bid : '');
  const [parentId, setParentId] = useState<string>(project ? project.id : '');
  const [spaceType, setSpaceType] = useState<string>(project ? 'PROJECT' : '');
  const [activeKey, setActiveKey] = useState<string>('1');
  const [activeKeyA, setActiveKeyA] = useState<number>();
  const { noticeList, setNoticeList, todoList, updateSource } = useModel('useNotice');

  const access = useAccess();
  //获取树结构
  const fetchCascaderOptions = async () => {
    try {
      const msg = await ticketType({
        parentId: 0,
      });
      setCascaderOptions(msg.data);
    } catch (error) {}
  };

  const reload = () => {
    actionRef.current?.reload(); // 通过ref操作表格组件的reload方法
  };

  const handleChange = (bid: string) => {
    setProjectBid(bid);
    console.log(projectBid, 'projectId');
    setParentId(bid);
    setSpaceType('PROJECT');
    actionRef.current?.reload();
  };

  const columns: ProColumns<TopicContentPageType>[] = [
    // 创建表格的列配置
    {
      title: '项目名称',
      dataIndex: 'projectId',
      hideInTable: true,
      order: 7,
      renderFormItem: () => {
        return <ProjectSelect name="projectId" handleChange={handleChange} />;
      },
    },
    {
      title: '工单编号',
      dataIndex: 'workorderNo',
      width: 140,
      order: 6,
      ellipsis: true, // 文字超出省略
      render: (text, record) => {
        return (
          <a
            className={styles.AStyle}
            onClick={() => {
              console.log('参数', record.status);

              history.push(`/workorder-center/list/details-acceptance/${record.id}`);
            }}
          >
            {text}
          </a>
        );
      },
    },

    {
      title: '工单类型',
      dataIndex: 'categoryId',
      width: 150,
      order: 4,
      ellipsis: true,
      hideInTable: true,
      valueType: 'cascader',
      fieldProps: {
        expandTrigger: 'hover',
        changeOnSelect: true,
        onChange: (value: number[], selectedOptions: CascaderOption[] | undefined) => {
          if (selectedOptions && selectedOptions.length) {
            const selectedLabels = selectedOptions
              .map((option: CascaderOption) => option.label)
              .join('-');
            setCategoryId(selectedLabels);
            setCategoryId(value[value.length - 1]);
          }
        },
        options: cascaderOptions,
        fieldNames: {
          children: 'childList',
          label: 'name',
          value: 'id',
        },
      },
    },

    {
      title: '工单类型',
      dataIndex: 'categoryName',
      width: 160,
      order: 5,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '工单位置',
      dataIndex: 'location',
      width: 160,
      order: 5,

      ellipsis: true,
    },
    {
      title: '工单状态',
      dataIndex: 'status',
      width: 160,
      order: 3,
      fieldProps: {
        placeholder: '全部',
      },
      ellipsis: true,
      valueType: 'select',
      request: async () => {
        const res = await dictionaryList('workorder_status');
        return (res.data as any).map((i: any) => ({
          value: i.code,
          label: i.name,
        }));
      },
    },
    {
      title: '工单来源',
      dataIndex: 'source',
      width: 160,
      fieldProps: {
        placeholder: '全部',
      },
      order: 2,
      ellipsis: true,
      valueType: 'select',
      request: async () => {
        const res = await dictionaryList('workorder_source');
        return (res.data as any).map((i: any) => ({
          value: i.code,
          label: i.name,
        }));
      },
    },

    {
      title: '报单时间',
      key: 'gmtCreated',
      dataIndex: 'gmtCreated',
      order: 1,
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '报单时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            beginGmtCreated: value[0] + ' 00:00:00',
            endGmtCreated: value[1] + ' 23:59:59',
          };
        },
      },
    },
  ];

  const onChange = (key: string) => {
    setActiveKey(key);
    if (key === '1') {
      sessionStorage.setItem('keya', '3');
      setActiveKeyA(3);
      updateSource(NoticeBoxType.todo);
      reload();
    }
    if (key === '2') {
      sessionStorage.setItem('keya', '2');
      setActiveKeyA(2);
      updateSource(NoticeBoxType.todo);
      reload();
    }

    if (key === '3') {
      sessionStorage.setItem('keya', '1');
      setActiveKeyA(1);
      updateSource(NoticeBoxType.todo);
      reload();
    }
  };
  const getByPage = async (params: Record<string, any>) => {
    // console.log('params', params);
    const param = sessionStorage.getItem('keya');
    console.log('param', param);
    const msg = await workOrderQuery({
      ...params,
      categoryId: categoryId, //工单类型ID
      queryType: param || '3',
      pageNo: params.current,
      pageSize: params.pageSize,
      projectId: projectBid,
    });
    return {
      data: msg.data.items,
      success: true,
      total: msg.data.page.totalItems,
    };
  };

  //联级选择
  useEffect(() => {
    fetchCascaderOptions(); // 调用异步函数加载级联选择器的选项数据
    updateSource(NoticeBoxType.todo);

    const param = sessionStorage.getItem('keya');
    console.log('param', param);
    if (param === '1') {
      setActiveKey('3');
    } else if (param === '2') {
      setActiveKey('2');
    } else if (param === '3') {
      setActiveKey('1');
    }
  }, []);
  return (
    <PageContainer header={{ title: null }}>
      <Card bordered={false} className={styles.carStyle}>
        <Tabs
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: `我受理的工单`,
              key: '1',
            },
            {
              label: `组内未受理工单`,
              key: '2',
            },
            {
              label: `我提交的工单`,
              key: '3',
            },
          ]}
        />
      </Card>

      <ProTable<TopicContentPageType>
        columns={columns}
        cardBordered
        form={{
          colon: false,
        }}
        className={styles.tableStyleA}
        request={getByPage as any}
        actionRef={actionRef}
        rowKey="id"
        search={
          {
            labelWidth: 68,
            labelAlign: 'left',
          } as any
        }
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Access key="add" accessible={access.functionAccess('alitaMasdata_addWorkorder')}>
            <Button
              key="button"
              style={{ display: activeKey === '3' ? 'inline-block' : 'none' }}
              onClick={() => {
                setEditData({});
                setAddModalVisit(true);
                window.location.hash = `${projectBid}`;
              }}
              icon={<PlusOutlined />}
              type="primary"
            >
              新建工单
            </Button>
          </Access>,
        ]}
      />

      {/* 添加弹窗组件 */}
      <AddModelForm
        onSubmit={reload}
        data={editData}
        modalVisit={addModalVisit}
        onOpenChange={setAddModalVisit}
      />
    </PageContainer>
  );
};
