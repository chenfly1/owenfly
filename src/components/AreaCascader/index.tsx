import React, { useState } from 'react';
import { getDistrictQuery } from '@/services/wps';
import { Cascader } from 'antd';
import type { CascaderProps } from 'antd/es/cascader';
import { useRequest } from 'umi';

const AreaCascader: React.FC<CascaderProps<any>> = ({ ...rest }) => {
  const [options, setOptions] = useState<DistrictType[]>([]);
  useRequest(async () => {
    const res = await getDistrictQuery({ regionLevel: 1 });
    setOptions(
      res.data.items.map((item: DistrictType) => {
        item.loading = false;
        item.children = [];
        return item;
      }),
    );
  });

  const loadData = async (selectedOptions: DistrictType[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    console.log(targetOption);

    // load options lazily
    const res = await getDistrictQuery({
      regionLevel: targetOption.regionLevel + 1,
      parentRegionCode: targetOption.regionCode,
    });
    targetOption.loading = false;
    targetOption.children = res.data.items;
    setOptions([...options]);
  };

  return (
    <Cascader
      key="Cascader"
      placeholder="请选择"
      {...rest}
      fieldNames={{
        label: 'regionName',
        value: 'regionName',
        children: 'children',
      }}
      options={options}
      loadData={(datas) => loadData(datas as any)}
    />
  );
};

export default AreaCascader;
