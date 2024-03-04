import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, message, Modal, Space, Switch } from 'antd';
import { useRef, useState } from 'react';
import Detail from './adetail';
import style from '../style.less';
import { Access, history, useAccess, useRequest } from 'umi';
import { parkTitles, serviceTypeEnum } from '@/pages/park-center/utils/constant';
import {
  deleteService,
  parkYardDropDownList,
  serviceListByPage,
  updateServiceStatus,
} from '@/services/park';
import { deleteEmptyKey, getProjectBid } from '@/utils/project';
import NameSearchSelect from '../../components/NameSearchSelect';
import type { DefaultOptionType } from 'antd/lib/select';
import ActionGroup from '@/components/ActionGroup';
import { PlusOutlined } from '@ant-design/icons';

export default () => {
  const [areaData, setAreaData] = useState<ParkServiceType>();
  const [areaShow, setAreaShow] = useState(false);
  const access = useAccess();

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const statusAccess = access.functionAccess('alitaParking_packageSwitch');
  const [yardNameData, setYardNameData] = useState<DefaultOptionType[]>([]);

  const fetchNameList = async (parkName: string): Promise<DefaultOptionType[]> => {
    return parkYardDropDownList(getProjectBid(), { parkName }).then((res) => {
      if (res.data instanceof Array) {
        return res.data.map((yard: any) => ({
          label: yard.name,
          value: yard.name,
        }));
      }
      return [];
    });
  };

  const onChangeYardName = (val: string) => {
    const para = formRef.current?.getFieldFormatValueObject!();
    formRef.current?.setFieldValue('parkName', val);
    console.log(para);
    actionRef.current?.reload();
  };

  useRequest(async () => {
    const res = await fetchNameList('');
    setYardNameData(res);
  });

  const onDelete = (id: string) => {
    deleteService(id)
      .then((res) => {
        if (res.code == 'SUCCESS') {
          message.success(res.message);
        } else {
          message.error(res.message);
        }
        actionRef.current?.reload();
      })
      .catch(() => message.error('操作失败，请重试'));
  };

  const columns: ProColumns<ParkServiceType>[] = [
    {
      title: parkTitles.alitaYardName,
      dataIndex: 'parkName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <NameSearchSelect
            name="parkName"
            key="parkCode-a"
            fetchOptions={fetchNameList}
            handleChange={onChangeYardName}
            orignList={yardNameData}
          />
        );
      },
    },
    {
      title: parkTitles.ruleName,
      dataIndex: 'name',
      ellipsis: true,
      search: false,
    },
    {
      title: parkTitles.belongYard,
      dataIndex: 'parkName',
      search: false,
    },
    {
      title: parkTitles.ruleUsage,
      dataIndex: 'type',
      search: false,
      ellipsis: true,
      valueEnum: serviceTypeEnum,
    },
    {
      title: parkTitles.rulePrice + '(元)',
      dataIndex: 'price',
      search: false,
      render: (_, row) => {
        return Number(row.price / 100).toFixed(2);
      },
    },
    // {
    //   title: parkTitles.ruleCycleTime,
    //   dataIndex: 'cycle',
    //   search: false,
    // },
    {
      title: parkTitles.ruleAceessAreas,
      dataIndex: 'accessAreas',
      search: false,
      render: (text, record) => {
        return (
          <a
            onClick={() => {
              setAreaData(record);
              setAreaShow(true);
            }}
          >
            查看
          </a>
        );
      },
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      valueType: 'switch',
      search: false,
      render: (text, record) => {
        return statusAccess ? (
          <Switch
            key={record.id}
            checked={record.state ? true : false}
            onChange={async () => {
              const res = await updateServiceStatus(record.id);
              if (res.code == 'SUCCESS') {
                // 保存成功
                message.success(res.message);
                actionRef.current?.reload();
              } else {
                message.error(res.message);
              }
            }}
          />
        ) : (
          <span> {record.state ? '启用' : '禁用'}</span>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 160,
      render: (text, record) => {
        return (
          <ActionGroup
            limit={3}
            actions={[
              {
                key: 'detail',
                text: '查看',
                onClick() {
                  history.push(
                    `/park-center/parkBusiness/service-list/detail?id=${record.id}&isEdit=${false}`,
                  );
                },
              },
              {
                key: 'edit',
                text: '编辑',
                onClick() {
                  history.push(
                    `/park-center/parkBusiness/service-list/detail?id=${record.id}&isEdit=${false}`,
                  );
                },
              },
              {
                key: 'delete',
                text: '删除',
                danger: true,
                onClick() {
                  Modal.confirm({
                    title: '确定删除吗？',
                    centered: true,
                    onOk: () => {
                      return onDelete(record.id);
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const tableColumns: ProColumns[] = columns.map((column) => ({ ...column }));

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <Access key="service-list" accessible={access.functionAccess('alitaParking_queryPackage')}>
        <ProTable
          cardBordered
          form={{
            colon: false,
          }}
          className={style.cardStyle}
          columns={tableColumns}
          formRef={formRef}
          actionRef={actionRef}
          columnsState={{
            persistenceKey: 'pro-table-singe-demos',
            persistenceType: 'localStorage',
          }}
          request={async (params): Promise<any> => {
            // params.projectId = getProjectBid();
            const other = formRef.current?.getFieldFormatValueObject!();
            const p = { ...params, ...other };
            deleteEmptyKey(p);

            const res = await serviceListByPage(p);
            return {
              data: res.data.items,
              success: res.code == 'SUCCESS' ? true : false,
              total: res.data.page.totalItems,
            };
          }}
          rowKey="id"
          search={{
            labelWidth: 68,
            // defaultColsNumber: 7,
          }}
          options={{
            setting: {
              listsHeight: 400,
            },
          }}
          toolBarRender={() => [
            <Access
              key="service-list-add"
              accessible={access.functionAccess('alitaParking_createPackage')}
            >
              <Button
                key="1"
                onClick={() => {
                  history.push('/park-center/parkBusiness/service-list/add');
                }}
                type="primary"
              >
                <PlusOutlined />
                创建车辆套餐
              </Button>
            </Access>,
          ]}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          dateFormatter="string"
          headerTitle={<Space>{/* <Button type="primary">同步套餐</Button> */}</Space>}
        />
        <Detail data={areaData} open={areaShow} onOpenChange={setAreaShow} />
      </Access>
    </PageContainer>
  );
};
