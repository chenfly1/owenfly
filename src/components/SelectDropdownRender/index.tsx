import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Select, SelectProps, Space, Checkbox, Input, Empty, Tooltip, Tag, message } from 'antd';
import { debounce, isArray, isEmpty, isFunction } from 'lodash-es';
import classnames from 'classnames';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import styles from './index.less';

type Key = string | number;

type OptionType = {
  label: string | React.ReactNode;
  value: Key;
  disabled: boolean;
};

type TypeOptMap = Record<string, OptionType>;

type CustomTagProps = {
  label: React.ReactNode;
  value: any;
  disabled?: boolean;
  onClose?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  closable?: boolean;
};

type PluralSelectProps = Omit<SelectProps, 'onChange' | 'options' | 'value' | 'mode'> & {
  onChange?: (value: Key[]) => void;
  options?: OptionType[];
  value?: Key[];
  showSearch?: boolean;
  showCheckAll?: boolean;
  maxSelectLength?: number;
};

const transformMap = (params: OptionType[]) => {
  const result: Record<string, OptionType> = {};
  if (isEmpty(params) || !isArray(params)) return result;
  params.forEach((item) => {
    result[item.value] = item;
  });
  return result;
};

const labelVisible = (searchValue: string, label: string) => {
  return !searchValue || (searchValue && label.indexOf(searchValue) > -1);
};

const PluralSelect: React.FC<PluralSelectProps> = ({
  options,
  maxTagCount = 'responsive',
  value = [],
  onChange,
  placeholder,
  className,
  showCheckAll = true,
  dropdownClassName,
  maxSelectLength,
  showSearch = true,
  ...props
}) => {
  const [currentValues, setCurrentValues] = useState<Key[]>(value);
  const [searchValue, setSearchValue] = useState<string>('');
  const searchInputRef: any = useRef();
  const valueCacheRef = useRef<string>();

  const optMap: TypeOptMap = useMemo(() => {
    return transformMap(options || []) || {};
  }, [options]);

  const allValues = useMemo<Key[]>(() => {
    return options?.map((opt) => opt?.value) || [];
  }, [options]);

  // 半选状态
  const indeterminate = useMemo((): boolean => {
    return (
      Boolean(currentValues?.length) && isArray(options) && currentValues?.length < options.length
    );
  }, [currentValues, options]);

  // 全选状态
  const checkedAll = useMemo((): boolean => {
    return Boolean(options?.length && currentValues?.length === options?.length);
  }, [currentValues, options]);

  // 选择checkbox
  const handleChange = useCallback(
    (event: CheckboxChangeEvent) => {
      const {
        target: { value: val, checked },
      } = event;
      let mergedValues: Key[] = [];
      if (checked) {
        if (maxSelectLength && currentValues.length >= maxSelectLength) {
          message.error('已超过最大数量');
          return;
        }
        mergedValues = [...currentValues, val];
        setCurrentValues(mergedValues);
      } else {
        mergedValues = currentValues.filter((each) => String(each) !== String(val));
        setCurrentValues(mergedValues);
      }
      if (isFunction(onChange)) onChange?.(mergedValues);
    },
    [currentValues, onChange],
  );

  // 输入搜索条件
  const handleInputKeyword = useCallback(() => {
    const val = searchInputRef.current?.input?.value || '';
    setSearchValue(val);
  }, []);

  // 搜索(防抖)
  const debounceSearch = useMemo(() => debounce(handleInputKeyword, 200), [handleInputKeyword]);

  // 全选或者全不选
  const handleCheckAllChange = useCallback(
    (event: CheckboxChangeEvent) => {
      const {
        target: { checked },
      } = event;
      if (isFunction(onChange)) onChange?.(checked ? allValues : []);
      setCurrentValues(checked ? allValues : []);
    },
    [onChange, allValues],
  );

  // select 变化
  const handleSelectChange = useCallback(
    (values: Key[]) => {
      setCurrentValues(values);
      if (isFunction(onChange)) onChange?.(values);
    },
    [onChange],
  );

  useEffect(() => {
    // 当 value 发生变化时，更新 currentValues
    const currentValueStr = value ? JSON.stringify(value) : '';
    if (currentValueStr === valueCacheRef.current) return;
    valueCacheRef.current = currentValueStr;
    console.log(value);
    setCurrentValues(value.map((i: any) => i.value || i));
  }, [value]);

  // 卸载时清空
  useEffect(() => {
    return () => {
      setSearchValue('');
    };
  }, []);

  const renderTitle = (title: string | React.ReactNode) => {
    if (!searchValue) {
      return <span>{title}</span>;
    }

    const strTitle = String(title);
    const index = strTitle.indexOf(searchValue);
    const beforeStr = strTitle.substring(0, index);
    const afterStr = strTitle.substring(index + searchValue.length);
    // 高亮搜索关键字
    const currentTitle =
      index > -1 ? (
        <>
          {beforeStr}
          <span className="highlight-value">{searchValue}</span>
          {afterStr}
        </>
      ) : (
        strTitle
      );

    return <span>{currentTitle}</span>;
  };

  const CheckboxOptions = () => {
    if (isEmpty(options) || !isArray(options))
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <Space
        direction="vertical"
        className={classnames(
          styles.contentCnnerWapper,
          showSearch && options?.length ? styles.contentCnnerWapperPadd : '',
        )}
      >
        {showCheckAll ? (
          <Checkbox
            indeterminate={indeterminate}
            onChange={handleCheckAllChange}
            checked={checkedAll}
          >
            全选
          </Checkbox>
        ) : null}
        <Checkbox.Group value={currentValues}>
          <Space direction="vertical" className={styles.contentCheckBox}>
            {isArray(options) &&
              options.map(
                ({ label, value: val, disabled }, idx) =>
                  labelVisible(searchValue, String(label)) && (
                    <Checkbox
                      onChange={handleChange}
                      disabled={disabled}
                      value={val}
                      key={`${idx}_${val}`}
                    >
                      {renderTitle(label)}
                    </Checkbox>
                  ),
              )}
          </Space>
        </Checkbox.Group>
      </Space>
    );
  };

  const tagRender = (prop: CustomTagProps) => {
    const { value: val, onClose, closable } = prop;
    const { label, disabled } = optMap[val] || {};
    return (
      <Tooltip placement="bottom" title={label}>
        <Tag closable={disabled ? false : closable} onClose={onClose} style={{ marginRight: 3 }}>
          {label}
        </Tag>
      </Tooltip>
    );
  };

  const dropdownRender = () => (
    <div className={styles.customerSelectWrapper}>
      {showSearch && options?.length ? (
        <Input
          ref={searchInputRef}
          className={styles.customerSelectInput}
          placeholder="请输入搜索关键字"
          onChange={debounceSearch}
          onPressEnter={debounceSearch}
        />
      ) : null}
      <CheckboxOptions />
    </div>
  );

  return (
    <Select
      placeholder={placeholder || '请选择'}
      tagRender={tagRender}
      maxTagCount={maxTagCount}
      dropdownRender={dropdownRender}
      showArrow
      allowClear
      dropdownMatchSelectWidth
      {...props}
      mode="multiple"
      showSearch={false}
      value={currentValues}
      onChange={handleSelectChange}
      className={classnames(['checkbox-selector', className])}
      popupClassName={classnames([styles.checkboxSelectorDropdown, dropdownClassName])}
    />
  );
};

export default PluralSelect;
