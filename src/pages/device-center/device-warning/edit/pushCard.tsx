import React, { useRef, useState } from 'react';
import styles from './style.less';
import ProForm, { ProFormList, ProFormSelect } from '@ant-design/pro-form';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { FormListActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import PushModal from './push-modal';
import { getWorkorderCategoryList } from '@/services/workorder';
import { history } from 'umi';
import { Modal, Tooltip } from 'antd';

type IProps = {
  from: any;
  disabled: boolean;
};

const TriggerCard: React.FC<IProps> = ({ from, disabled }) => {
  const { query } = history.location;
  const actionRef = useRef<FormListActionType<Record<string, any>>>();
  const [pushModalShow, setPushModalShow] = useState<boolean>(false);

  const workColumns: ProColumns<any>[] = [
    {
      title: '系统名称',
      width: '20%',
      ellipsis: true,
      dataIndex: 'system',
    },
    {
      title: '工单类型',
      dataIndex: 'linkCode',
      width: '20%',
      valueType: 'select',
      ellipsis: true,
      request: async () => {
        const res = await getWorkorderCategoryList({ code: 'DEVICE' });
        const resdes = await getWorkorderCategoryList({ parentId: res.data && res.data[0].id });
        return resdes.data.map((i: any) => ({
          value: i.code,
          label: i.name,
        }));
      },
    },
    {
      title: '工单内容',
      width: '20%',
      dataIndex: 'linkText',
      ellipsis: true,
    },
    {
      title: '工单图片',
      width: '20%',
      dataIndex: 'image',
      ellipsis: true,
    },
    {
      title: '工单处理人',
      width: '20%',
      dataIndex: 'handler',
      ellipsis: true,
    },
    {
      title: '24h内免重复告警推送',
      width: '20%',
      dataIndex: 'avoidRepeat',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        true: '是',
        false: '否',
      },
    },
  ];

  const onSubmit = (data: any) => {
    actionRef.current?.add({
      ...data,
      works: [
        {
          linkCode: data.linkCode,
          avoidRepeat: data.avoidRepeat ? true : false,
          system: 'Alita工单中心',
          linkText: '@{设备名称}@{触发条件}',
          image: '-',
          handler: '按工单模版配置',
        },
      ],
    });
  };

  const actionGuard = {
    beforeAddRow: async () => {
      setPushModalShow(true);
    },
    beforeRemoveRow: async (index: any) => {
      const row = actionRef.current?.get(index);
      console.log(row);
      if (!row?.type) return true;
      return new Promise((resolve) => {
        Modal.confirm({
          icon: <ExclamationCircleFilled />,
          title: `确定删除执行动作-${row?.type === 'WORKORDER' ? '推送工单' : '推送消息'}`,
          centered: true,
          onOk: async () => {
            resolve(true);
          },
          onCancel() {
            resolve(false);
          },
        });
      });
    },
  };

  return (
    <>
      <ProFormList
        name="executions"
        creatorButtonProps={
          disabled
            ? false
            : {
                creatorButtonText: '新增',
                block: false,
                size: 'large',
              }
        }
        actionRef={actionRef}
        actionGuard={actionGuard as any}
        deleteIconProps={{
          Icon: (_) => {
            return disabled ? null : <DeleteOutlined {..._} style={{ color: 'red' }} />;
          },
        }}
        min={1}
        copyIconProps={false}
        itemRender={({ listDom, action }, { index }) => (
          <ProCard
            bordered
            style={{ marginBlockEnd: 8 }}
            extra={action}
            headStyle={{ width: '20px', position: 'absolute', right: 0, padding: 0 }}
            bodyStyle={{
              paddingBlockEnd: 0,
              marginRight: 20,
              border: '1px solid #f0f0f0',
              borderRadius: 4,
            }}
          >
            {listDom}
          </ProCard>
        )}
      >
        {(f, index, action) => {
          console.log(f, index, action, action.getCurrentRowData());
          const works = action.getCurrentRowData().works || [];
          const result = action.getCurrentRowData().result;
          const resultMsg = action.getCurrentRowData().resultMsg || '';
          return (
            <div key="index" className={styles.pushItem}>
              <ProFormSelect
                width={320}
                label="告警类型"
                labelCol={{ flex: '100px' }}
                name="type"
                disabled
                options={[
                  {
                    value: 'WORKORDER',
                    label: '推送工单',
                  },
                  {
                    value: 'NOTICE',
                    label: '推送消息',
                  },
                ]}
              />
              <ProForm.Item
                colon={false}
                name="result"
                label="执行结果"
                hidden={query?.pageType !== 'logView'}
                labelCol={{ flex: '100px' }}
              >
                <div className={styles.formTime}>
                  <ProFormSelect
                    name="result"
                    width={320}
                    options={[
                      {
                        value: 1,
                        label: '执行成功',
                      },
                      {
                        value: 0,
                        label: '执行失败',
                      },
                    ]}
                  />
                  （
                  <span className={styles.resultMsg} hidden={result === 1}>
                    <Tooltip placement="topLeft" title={`失败原因：${resultMsg}`}>
                      失败原因：{resultMsg}
                    </Tooltip>
                  </span>
                  ）
                </div>
              </ProForm.Item>
              <ProForm.Item
                colon={false}
                name="works"
                label="工单内容"
                labelCol={{ flex: '100px' }}
              >
                <ProTable<any>
                  columns={workColumns}
                  search={false}
                  dataSource={works}
                  options={false}
                  pagination={false}
                  bordered
                  tableStyle={{ padding: 0 }}
                  rowKey="id"
                  dateFormatter="string"
                />
              </ProForm.Item>
              {/* <ProForm.Item
                colon={false}
                name="devices"
                label="消息内容"
                labelCol={{ flex: '100px' }}
              >
                <ProTable<any>
                  columns={workColumns}
                  search={false}
                  dataSource={works}
                  options={false}
                  pagination={false}
                  bordered
                  rowKey="id"
                  dateFormatter="string"
                />
              </ProForm.Item> */}
            </div>
          );
        }}
      </ProFormList>
      <PushModal modalVisit={pushModalShow} onOpenChange={setPushModalShow} onSubmit={onSubmit} />
    </>
  );
};

export default TriggerCard;
