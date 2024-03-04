import { Button, Select } from 'antd';
import { createRef, useEffect, useState } from 'react';
import Member from './member';
import Style from './index.less';
import Org from './org';
import Role from './role';
import { getFields } from './formAccess';

export enum PersonTypeEnum {
  member = 'member',
  org = 'org',
  role = 'role',
  input = 'input',
  initiator = 'initiator',
}

type PersonValueItem = { code: string; name: string };

interface PersonValue {
  type: PersonTypeEnum; // 选择类型
  field?: string; // 表单填写字段
  values?: PersonValueItem[]; // 人员集合
}

interface PersonItemProps {
  schema?: { form: Record<string, any>; schema: Record<string, any> };
  value?: PersonValue;
  onChange?: (value: PersonValue) => void;
}

const PersonTypeOptions = [
  {
    label: '按人员选择',
    value: PersonTypeEnum.member,
  },
  {
    label: '按组织选择',
    value: PersonTypeEnum.org,
  },
  {
    label: '按角色选择',
    value: PersonTypeEnum.role,
  },
  {
    label: '表单填写',
    value: PersonTypeEnum.input,
  },
  {
    label: '发起人',
    value: PersonTypeEnum.initiator,
  },
];

export default (props: PersonItemProps) => {
  const [fields, setFields] = useState<{ label: string; value: string }[]>([]);
  const [field, setField] = useState<string | undefined>(props.value?.field);
  const [type, setType] = useState<PersonTypeEnum>(props.value?.type || PersonTypeEnum.member);
  const [list, setList] = useState<PersonValueItem[]>([]);
  const memberRef = createRef<any>();
  const orgRef = createRef<any>();
  const roleRef = createRef<any>();
  const typeChange = (value: PersonTypeEnum) => {
    setType(value);
    props.onChange?.({
      type: value,
      values: [],
    });
  };

  useEffect(() => {
    setFields(getFields(props.schema?.schema));
  }, [props.schema]);

  return (
    <>
      <Select
        className="mb-10"
        options={PersonTypeOptions}
        onChange={typeChange}
        value={props.value?.type || type}
      />
      {type === PersonTypeEnum.input ? (
        <Select
          placeholder="请选择表单字段"
          options={fields}
          fieldNames={{
            label: 'title',
            value: 'field',
          }}
          value={props.value?.field || field}
          onChange={(value) => {
            props.onChange?.({
              type,
              field: value,
              values: [],
            });
          }}
        />
      ) : null}
      {[PersonTypeEnum.member, PersonTypeEnum.org, PersonTypeEnum.role].includes(type) ? (
        <>
          <Button
            style={{ width: '100%' }}
            onClick={() => {
              if (type === PersonTypeEnum.member) {
                memberRef.current?.open({
                  list: props.value?.values || list,
                });
              }
              if (type === PersonTypeEnum.org) {
                orgRef.current?.open({
                  list: props.value?.values || list,
                });
              }
              if (type === PersonTypeEnum.role) {
                roleRef.current?.open({
                  list: props.value?.values || list,
                });
              }
            }}
          >
            点击添加
          </Button>
          {(props.value?.values || list).length ? (
            <Select
              className={Style.person_panel}
              value={(props.value?.values || list).map((item: any) => item.code)}
              options={props.value?.values || list}
              fieldNames={{
                label: 'name',
                value: 'code',
              }}
              mode="tags"
              maxTagCount={10}
              open={false}
              onChange={(value: string[], options) => {
                const values = value
                  .map((code) =>
                    ([] as PersonValueItem[]).concat(options).find((item) => item.code === code),
                  )
                  .filter((item) => item) as PersonValueItem[];
                setList(values);
                props.onChange?.({
                  type,
                  values,
                });
              }}
            />
          ) : null}
        </>
      ) : null}
      <Member
        ref={memberRef}
        submit={async (values) => {
          setList(values.list);
          props.onChange?.({
            type,
            values: values.list,
          });
          return true;
        }}
      />
      <Org
        ref={orgRef}
        submit={async (values) => {
          setList(values.list);
          props.onChange?.({
            type,
            values: values.list,
          });
          return true;
        }}
      />
      <Role
        ref={roleRef}
        submit={async (values) => {
          setList(values.list);
          props.onChange?.({
            type,
            values: values.list,
          });
          return true;
        }}
      />
    </>
  );
};
