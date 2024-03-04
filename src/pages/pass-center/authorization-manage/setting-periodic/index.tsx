import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Add from './add';
import styles from './style.less';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { delPeriod, queryPeriodpage } from '@/services/door';
import Method from '@/utils/Method';

const getWeeks = (week: string) => {
  const groups = [];
  for (let i = 1; i < week.length; i++) {
    if (week[i] === '1') {
      groups.push(i.toString());
    }
  }
  return groups;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisit, setModalVisit] = useState<boolean>(false);
  const [viewData, setViewData] = useState<any>();
  const reload = () => {
    actionRef.current?.reload();
  };
  const deleteRow = (id: number) => {
    Method.countDownConfirm({
      icon: <ExclamationCircleFilled />,
      title: '删除后无法找回，确定是否删除',
      centered: true,
      onOk: async () => {
        const res = await delPeriod(id);
        if (actionRef.current) {
          actionRef.current.reload();
        }
        if (res.code === 'SUCCESS') {
          message.success('删除成功');
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const columns: ProColumns<PeriodType>[] = [
    {
      title: '周期名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '授权期限日期',
      dataIndex: 'validDateStart',
      ellipsis: true,
      search: false,
      // render: (_, record) => {
      //   return `${record.validDateStart} - ${record.validDateEnd}`;
      // },
    },
    {
      title: '时间区间',
      dataIndex: 'validTimeStart',
      ellipsis: true,
      search: false,
      // render: (_, record) => {
      //   return `${record.validTimeStart} - ${record.validTimeEnd}`;
      // },
    },
    {
      title: '开放星期',
      dataIndex: 'weekend',
      ellipsis: true,
      search: false,
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
      },
      valueEnum: {
        '1': {
          text: '周一',
        },
        '2': {
          text: '周二',
        },
        '3': {
          text: '周三',
        },
        '4': {
          text: '周四',
        },
        '5': {
          text: '周五',
        },
        '6': {
          text: '周六',
        },
        '7': {
          text: '周日',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      search: false,
      render: (_, record) => {
        return (
          <Space key="space">
            <a
              key="view"
              onClick={() => {
                setViewData(record);
                setModalVisit(true);
              }}
            >
              查看
            </a>
            <a
              key="del"
              onClick={() => {
                deleteRow(record.id);
              }}
            >
              删除
            </a>
          </Space>
        );
      },
    },
  ];

  const toolBarRender = () => {
    return [
      <Button
        key="add"
        onClick={() => {
          setViewData({});
          setModalVisit(true);
        }}
        icon={<PlusOutlined />}
        type="primary"
      >
        新建
      </Button>,
    ];
  };

  const getByPage = async (params: Record<string, any>) => {
    console.log(params);
    const msg = await queryPeriodpage({
      ...params,
      pageNo: params.current,
    });
    return {
      data: msg.data.items.map((i) => ({
        ...i,
        weekend: getWeeks(i.weekend),
      })),
      // success 请返回 true， 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.data.page.totalItems,
    };
  };

  return (
    <PageContainer className={styles.cardStyle} header={{ title: null }}>
      <ProTable<PeriodType>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        form={{
          colon: false,
        }}
        request={getByPage as any}
        rowKey="id"
        options={{}}
        search={{
          labelWidth: 100,
          defaultColsNumber: 7,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        toolBarRender={toolBarRender}
      />
      <Add modalVisit={modalVisit} data={viewData} onSubmit={reload} onOpenChange={setModalVisit} />
    </PageContainer>
  );
};
