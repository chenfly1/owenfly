import DrawerForm from '@/components/DrawerForm';
import { getCarbonHistory } from '@/services/energy';
import { ParamsType, ProColumns, ProTable } from '@ant-design/pro-components';

const compareFieldMap: Record<string, string> = {
  carbon: '碳排放',
  carbonDioxide: '二氧化碳排放',
};

const compareFields = Object.keys(compareFieldMap);

const content = () => {
  /** 获取修改内容 */
  const compareItem = ({ before, after }: CarbonConfigHistory) => {
    return compareFields.reduce((prev, field) => {
      if (before?.[field] !== after?.[field]) {
        prev.push({
          title: compareFieldMap[field],
          values: [before?.[field], after?.[field]],
        });
      }
      return prev;
    }, [] as { title: string; values: (string | number)[] }[]);
  };

  const columns: ProColumns<CarbonConfigHistory>[] = [
    {
      title: '系数名称',
      key: 'cnName',
      dataIndex: 'cnName',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
      render: (_, row: CarbonConfigHistory) => row?.after.cnName,
    },
    {
      title: '能源',
      key: 'energyTypeName',
      dataIndex: 'energyTypeName',
      width: 80,
      ellipsis: true,
      hideInSearch: true,
      render: (_, row: CarbonConfigHistory) => row?.after.energyTypeName,
    },
    {
      title: '修改内容',
      key: 'energyTypeName',
      dataIndex: 'energyTypeName',
      width: 230,
      ellipsis: true,
      hideInSearch: true,
      render: (_, row: CarbonConfigHistory) => {
        return compareItem(row).map((item) => {
          return (
            <div key={item.title}>
              {item.title}: <span>{item.values[0]}</span> &gt; <span>{item.values[1]}</span>
            </div>
          );
        });
      },
    },
    {
      title: '修改时间',
      key: 'gmtUpdated',
      dataIndex: 'gmtUpdated',
      width: 180,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '修改人',
      key: 'updater',
      dataIndex: 'updater',
      hideInSearch: true,
      width: 100,
      ellipsis: true,
    },
  ];

  /** 获取修改记录列表 */
  const getList = async ({ current, ...rest }: ParamsType) => {
    const options = { ...rest, pageNo: current };
    const res = await getCarbonHistory(options);
    return {
      data: res?.items || [],
      success: res?.items ? true : false,
      total: res?.page?.totalItems,
    };
  };

  return (
    <ProTable<CarbonConfigHistory>
      style={{ width: '100%' }}
      form={{ colon: false }}
      className="pro--no-padding"
      columns={columns}
      search={false}
      options={false}
      request={getList}
      pagination={{ showSizeChanger: true }}
    />
  );
};

export default DrawerForm<never>(content, { width: 800, title: '折碳配置历史记录', confirm: true });
