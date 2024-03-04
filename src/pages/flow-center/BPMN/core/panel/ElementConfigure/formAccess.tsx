type formAccessValue = { field: string; access?: 'editable' | 'readonly' | 'hidden' };
interface formAccessItemProps {
  schema?: { form: Record<string, any>; schema: Record<string, any> };
  value?: formAccessValue[];
  onChange?: (value: formAccessValue[]) => void;
}

import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';

export const getFields = (schema: any, level = 0) => {
  let res: any[] = [];
  if (schema?.properties) {
    const properties = Object.values(schema.properties);
    properties.forEach((property: any) => {
      const index = Number(`${level}${property['x-index']}`);
      if (!['void', 'array'].includes(property.type)) {
        res.push({
          title: property.title,
          field: property.name || property['x-designable-id'],
          index,
        });
      }
      if (property?.items?.properties) {
        res = res.concat(getFields(property?.items, index));
      } else if (property.properties) {
        res = res.concat(getFields(property, index));
      }
    });
  }
  return res.sort((prev, curr) => prev.index - curr.index);
};

export default (props: formAccessItemProps) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly formAccessValue[]>([]);
  const columns: ProColumns<formAccessValue>[] = [
    {
      title: '字段信息',
      dataIndex: 'field',
      hideInTable: true,
    },
    {
      title: '表单字段',
      dataIndex: 'title',
      width: 100,
      editable: false,
    },
    {
      title: '操作权限',
      key: 'access',
      dataIndex: 'access',
      valueType: 'radio',
      valueEnum: {
        editable: '可编辑',
        readonly: '仅可见',
        hidden: '隐藏',
      },
    },
  ];

  useEffect(() => {
    const fields = getFields(props.schema?.schema);
    setDataSource(
      fields.map(({ field, title }) => {
        const match = (props.value || []).find((item) => item.field === field);
        return {
          field,
          title,
          access: match?.access,
        };
      }),
    );
    setEditableRowKeys(fields.map((item) => item.field));
  }, [props.schema, props.value]);
  return (
    <EditableProTable<formAccessValue>
      headerTitle={null}
      columns={columns}
      rowKey="field"
      value={dataSource}
      cardProps={{
        bodyStyle: {
          padding: 0,
        },
      }}
      recordCreatorProps={false}
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (_, recordList) => {
          setDataSource(recordList);
          props.onChange?.(recordList);
        },
        onChange: setEditableRowKeys,
      }}
    />
  );
};
