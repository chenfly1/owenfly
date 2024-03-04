import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { history } from 'umi';
import { getCertificateHistory } from '@/services/door';
import styles from './style.less';
import { Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import classnames from 'classnames';

export default () => {
  const { query } = history.location;
  const [authObjType, setAuthObjType] = useState<any>('');
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const columns: ProColumns<Record<string, any>>[] = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      search: false,
      ellipsis: true,
    },
    {
      title: '凭证类型',
      dataIndex: 'authObjType',
      ellipsis: true,
      search: false,
      valueType: 'select',
      valueEnum: {
        2: {
          text: '人脸',
        },
        4: {
          text: 'ID卡',
        },
        1: {
          text: 'IC卡',
        },
      },
    },
    {
      title: '下发结果',
      dataIndex: 'authStatus',
      ellipsis: true,
      search: false,
      renderText(text, record, index, action) {
        if (record.authObjType === 2) {
          return [
            {
              value: 0,
              label: '新增人脸中',
            },
            {
              value: 1,
              label: '新增人脸成功',
            },
            {
              value: 2,
              label: '新增人脸失败',
            },
            {
              value: 3,
              label: '删除人脸中',
            },
            {
              value: 4,
              label: '删除人脸成功',
            },
            {
              value: 5,
              label: '删除人脸失败',
            },
          ].filter((i) => i.value === record.authStatus)[0].label;
        }
        if (record.authObjType === 4) {
          return [
            {
              value: 0,
              label: '新增ID中',
            },
            {
              value: 1,
              label: '新增ID成功',
            },
            {
              value: 2,
              label: '新增ID失败',
            },
            {
              value: 3,
              label: '删除ID中',
            },
            {
              value: 4,
              label: '删除ID成功',
            },
            {
              value: 5,
              label: '删除ID失败',
            },
          ].filter((i) => i.value === record.authStatus)[0].label;
        }
        if (record.authObjType === 1) {
          return [
            {
              value: 6,
              label: '拉入黑名单中',
            },
            {
              value: 7,
              label: '拉入黑名单成功',
            },
            {
              value: 8,
              label: '拉入黑名单失败',
            },
            {
              value: 9,
              label: '拉出黑名单中',
            },
            {
              value: 10,
              label: '拉出黑名单成功',
            },
            {
              value: 11,
              label: '拉出黑名单失败',
            },
          ].filter((i) => i.value === record.authStatus)[0].label;
        }
      },
    },
    {
      title: '失败原因',
      dataIndex: 'msg',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作时间',
      dataIndex: 'gmtCreated',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作时间',
      dataIndex: 'gmtCreated',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            gmtCreatedBegin: value[0] + ' 00:00:00',
            gmtCreatedEnd: value[1] + ' 23:59:59',
          };
        },
      },
    },
    {
      title: '操作人',
      dataIndex: 'creator',
      order: 4,
      ellipsis: true,
    },
  ];

  const reload = async () => {
    actionRef.current?.reload();
  };

  const routes = [
    {
      path: '/pass-center/voucher-manage',
      breadcrumbName: '凭证管理',
    },
    {
      path: '/pass-center/voucher-manage/voucher-list',
      breadcrumbName: '凭证下发中心',
    },
    {
      path: '/pass-center/voucher-manage/voucher-list/history-opteration?userId=' + query?.userId,
      breadcrumbName: '历史操作记录',
    },
  ];

  return (
    <PageContainer
      header={{
        title: null,
        breadcrumb: {
          itemRender: (route) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a
                onClick={() => {
                  history.goBack();
                }}
              >
                {route.breadcrumbName}
              </a>
            );
          },
          routes,
        },
      }}
    >
      <ProTable<Record<string, any>>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        form={{
          colon: false,
        }}
        formRef={formRef}
        request={async (params, sort: any, filter: any) => {
          params.pageNo = params.current;
          params.userId = query?.userId;
          params.authObjType = authObjType;
          const res = await getCertificateHistory(params);
          return {
            data: res.data?.items || [],
            success: res.code === 'SUCCESS' ? true : false,
            total: res.data?.page?.totalItems,
          };
        }}
        rowKey="id"
        search={
          {
            labelWidth: 78,
            labelAlign: 'left',
          } as any
        }
        headerTitle={
          <Space>
            {[
              {
                value: '',
                label: '全部',
              },
              {
                value: 2,
                label: '人脸',
              },
              {
                value: 4,
                label: 'ID卡',
              },
              {
                value: 1,
                label: 'IC卡',
              },
            ].map((i) => (
              <div
                key={i.label}
                onClick={() => {
                  setAuthObjType(i.value);
                  reload();
                }}
                className={classnames(
                  styles.btnClass,
                  authObjType === i.value ? styles.btnAct : '',
                )}
              >
                <Space size={4}>
                  <CheckOutlined
                    className={classnames(
                      styles.checkClass,
                      authObjType === i.value ? styles.checkAct : '',
                    )}
                  />
                  <span>{i.label}</span>
                </Space>
              </div>
            ))}
          </Space>
        }
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
        }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
