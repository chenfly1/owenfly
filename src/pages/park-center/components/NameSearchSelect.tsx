import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import { ProFormItem } from '@ant-design/pro-form';
import type { ProFormItemProps } from '@ant-design/pro-form';
import type { DefaultOptionType, SelectProps } from 'antd/lib/select';
import { debounce } from 'lodash';

type IProps = {
  label?: string;
  name?: string | string[];
  placeholder?: string;
  fetchOptions: (search: string) => Promise<DefaultOptionType[]>;
  handleChange: (value: string) => void;
  debounceTimeout?: number;
  orignList?: DefaultOptionType[];
};

/** 支持名字模糊查询，options接口调用返回 */
const NameSearchSelect: React.FC<IProps & SelectProps & ProFormItemProps> = ({
  label,
  name,
  placeholder,
  rules,
  fetchOptions,
  handleChange,
  orignList,
  debounceTimeout = 800,
  ...rest
}) => {
  const [dataList, setDataList] = useState<DefaultOptionType[]>([]);

  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(0);

  useEffect(() => {
    setDataList(orignList || []);
  }, [orignList]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      const ruleName = value.replace(/[^\u4e00-\u9fa50-9]/g, '');

      if (!ruleName.length) {
        setDataList(orignList || []);
        return;
      }

      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setDataList(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <ProFormItem name={name} label={label} rules={rules}>
      <Select
        showSearch
        allowClear
        onClear={() => {
          handleChange('');
        }}
        options={dataList}
        onSearch={debounceFetcher}
        placeholder={placeholder || '请选择'}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        onSelect={handleChange}
        {...rest}
      />
    </ProFormItem>
  );
};

export default NameSearchSelect;
