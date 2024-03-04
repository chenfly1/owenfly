import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Space, List, Button } from 'antd';
import {
  ProFormDateRangePicker,
  ProFormItem,
  ProFormSwitch,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import type { RangePickerProps } from 'antd/es/date-picker';
import styles from './style.less';
import moment from 'moment';
import { getLiftDeviceList } from '@/services/door';
import { ProFormDependency } from '@ant-design/pro-form';
import { getAreaListByPage } from '@/services/DoorManager';
import SelectDropdownRender from '@/components/SelectDropdownRender';
import { useModel } from 'umi';
import { useInitState } from '@/hooks/useInitState';
import { PassCenterState } from '@/models/usePassCenter';

type IProps = {
  form?: any;
  ref?: any;
  detailsData?: any;
  isClient?: boolean;
  getDetails: (id: string) => void;
};

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < moment().startOf('day');
};

const BaseMessage: React.FC<IProps> = forwardRef(
  ({ form, getDetails, isClient, detailsData }, ref) => {
    const projectUid = JSON.parse(sessionStorage.getItem('VprojectInfo') || '{}')?.bid;
    // 通行区域
    const [passList, setPassList] = useState<any[]>([]);
    const [updateNum, setUpdateNum] = useState<number>(0);
    // 汉王认证
    const { periodList } = useInitState<PassCenterState>('usePassCenter', ['periodList']);
    const { initialState } = useModel('@@initialState');
    const [countShow] = useState<boolean>(
      initialState?.currentUser?.userName === '公安三所认证租户管理员',
    );
    // 梯控数据
    const [eleList, setEleList] = useState<any[]>();
    const [tags, setTags] = useState<any[]>([
      {
        name: '1个月',
        value: [moment(), moment().add(1, 'months')],
        ghost: false,
      },
      {
        name: '1年',
        value: [moment(), moment().add(1, 'years')],
        ghost: false,
      },
      {
        name: '5年',
        value: [moment(), moment().add(5, 'years')],
        ghost: false,
      },
      {
        name: '10年',
        value: [moment(), moment().add(10, 'years')],
        ghost: true,
      },
    ]);

    // 获取电梯和楼层
    const getLiftList = async (passingAreaIds: string[]) => {
      if (passingAreaIds && passingAreaIds.length === 0) return;
      const res = await getLiftDeviceList({
        passingAreaIds: passingAreaIds,
      });
      setEleList(res.data);
    };

    const tagClick = (item: { name: string; ghost: boolean }, index: number) => {
      tags.map((i, j) => {
        if (index !== j) i.ghost = false;
        return i;
      });
      tags.splice(index, 1, {
        ...item,
        ghost: !item.ghost,
      });
      setTags([...tags]);
    };

    useEffect(() => {
      tags.map((i) => {
        if (i.ghost) {
          form?.current?.setFieldsValue({
            dateRange: i.value,
          });
        }
      });
    }, [tags]);

    const update = () => {
      console.log(updateNum);
      // 让父子组件表单关联上必须set多一下，不知道原因
      const times = setTimeout(() => {
        clearTimeout(times);
        const updateNums = updateNum + 1;
        setUpdateNum(updateNums);
      }, 0);
    };

    useImperativeHandle(ref, () => {
      return {
        update,
      };
    });

    useEffect(() => {
      update();
    }, []);

    useEffect(() => {
      if (detailsData?.userPassingAreaLinks) {
        getLiftList((detailsData?.userPassingAreaLinks || []).map((i: any) => i.passingAreaId));
      }
      // 员工、客户禁止编辑通行区域
      let disabledIds: any[] = [];
      if (detailsData?.userPassingAreaLinks) {
        disabledIds = detailsData?.userPassingAreaLinks
          .filter((i: any) => i.isAutoSync === 1)
          .map((i: any) => i.passingAreaId);
      }
      const getPassList = async () => {
        const params = {
          pageNo: 1,
          pageSize: 1000,
          type: 1,
          projectUid: projectUid,
        };
        const res = await getAreaListByPage(params);
        if (res.code === 'SUCCESS') {
          const resData = (res.data?.items || []).map((i) => ({
            value: i.id,
            label: i.name,
            disabled: disabledIds?.includes(i.id as any),
          }));
          setPassList(resData);
          console.log(resData);
        }
      };
      getPassList();
    }, [detailsData]);

    return (
      <>
        <div className={styles.headTitle}>授权信息</div>
        <ProFormText
          label="姓名"
          name="name"
          initialValue={''}
          fieldProps={{
            maxLength: 30,
          }}
          disabled={isClient}
          validateTrigger="onBlur"
          rules={[
            { required: true, message: '请输入姓名' },
            // { pattern: /^[\u4e00-\u9fa5a-zA-Z\·]+$/, message: '请输入中文或者英文字符' },
          ]}
          placeholder="请输入姓名"
        />
        <ProFormText
          label="手机号"
          name="phone"
          disabled={isClient}
          fieldProps={{
            maxLength: 11,
          }}
          rules={[
            {
              required: true,
              message: '请输入手机号',
            },
            {
              pattern: /^1\d{10}$/,
              message: '手机号格式错误',
            },
          ]}
          placeholder="请输入手机号"
        />
        <ProFormText
          label="人员类型"
          name="typeStr"
          disabled={isClient}
          hidden={!isClient}
          // rules={[{ required: true, message: '请选择' }]}
          placeholder="请选择"
        />
        <ProFormSelect
          label="人员类型"
          placeholder="请选择"
          hidden={isClient}
          rules={[{ required: true, message: '请选择' }]}
          name="type"
          options={[
            {
              value: '03',
              label: '保洁人员',
            },
            {
              value: '04',
              label: '安防人员',
            },
            {
              value: '05',
              label: '快递人员',
            },
            {
              value: '06',
              label: '施工人员',
            },
            {
              value: '99',
              label: '其他',
            },
          ]}
        />
        {countShow ? (
          <ProFormItem shouldUpdate>
            {(fm) => {
              console.log(fm);
              const periodId = form?.current?.getFieldValue('periodId');
              return (
                <ProFormItem
                  className={styles.formItem}
                  labelCol={{
                    flex: '80px',
                  }}
                  name="periodId"
                  label="授权周期"
                  rules={[{ required: true, message: '请选择授权周期' }]}
                >
                  <SelectDropdownRender
                    options={periodList.value}
                    value={periodId}
                    allowClear={false}
                    showSearch={false}
                    showCheckAll={false}
                    // maxTagCount={1}
                    onChange={(value) => {
                      form?.current?.setFieldsValue({
                        periodIds: value,
                      });
                    }}
                    placeholder="请选择授权周期"
                  />
                </ProFormItem>
              );
            }}
          </ProFormItem>
        ) : (
          <ProFormItem
            label="授权期限"
            name="dateRange"
            hidden={countShow}
            className={styles.timePicker}
            style={{ width: '100%' }}
            rules={[{ required: true, message: '请选择授权期限' }]}
          >
            <ProFormDateRangePicker
              name="dateRange"
              width="lg"
              style={{ width: '100%' }}
              fieldProps={{
                disabledDate,
                //   onChange: onChange,
              }}
              initialValue={[moment().startOf('day'), moment().add(10, 'year')]}
            />
            <Space wrap>
              {tags.map((item, index) => (
                <Button
                  key={item.name}
                  onClick={() => tagClick(item, index)}
                  type="primary"
                  ghost={!item.ghost}
                  size="small"
                >
                  {item.name}
                </Button>
              ))}
            </Space>
          </ProFormItem>
        )}
        <ProFormItem shouldUpdate>
          {(fm) => {
            console.log(fm);
            const passingAreaIds = form?.current?.getFieldValue('passingAreaIds');
            return (
              <ProFormItem
                className={styles.formItem}
                labelCol={{
                  flex: '80px',
                }}
                name="passingAreaIds"
                label="通行区域"
                rules={[{ required: true, message: '请选择通行区域' }]}
              >
                <SelectDropdownRender
                  options={passList}
                  value={passingAreaIds}
                  allowClear={false}
                  showCheckAll={false}
                  // maxTagCount={1}
                  onChange={(value) => {
                    const elevator = form?.current?.getFieldValue('elevator');
                    if (elevator && value.length) getLiftList(value as any);
                    form?.current?.setFieldsValue({
                      passingAreaIds: value,
                    });
                  }}
                  placeholder="请选择通行区域"
                />
              </ProFormItem>
            );
          }}
        </ProFormItem>
        <ProFormSwitch
          name="elevator"
          label="梯控权限"
          fieldProps={{
            onChange: (e) => {
              const passingAreaIds = form?.current?.getFieldValue('passingAreaIds');
              if (e && passingAreaIds && passingAreaIds.length) {
                getLiftList(passingAreaIds);
              }
            },
          }}
        />
        <ProFormDependency name={['elevator']}>
          {({ elevator }) => {
            return elevator ? (
              <ProFormItem label="通行楼层">
                <div style={{ lineHeight: '32px' }}>已选通行区域包含以下梯控设备</div>
                <List
                  grid={{
                    gutter: 16,
                    column: 1,
                  }}
                  className={styles.eleListItem}
                  dataSource={eleList}
                  renderItem={(item: any) => (
                    <List.Item>
                      <ProFormItem shouldUpdate>
                        {(fm) => {
                          console.log(fm);
                          const ids = form?.current?.getFieldValue(['buildingNumDataObj', item.id]);
                          return (
                            <ProFormItem
                              className={styles.formItem}
                              name={['buildingNumDataObj', item.id]}
                              key={item.id}
                              labelCol={{ span: 24 }}
                              label={item.name}
                            >
                              <SelectDropdownRender
                                options={
                                  item.floorNumberList
                                    ? item.floorNumberList.map((i: any) => ({
                                        label: `${i} 层`,
                                        value: i,
                                      }))
                                    : []
                                }
                                value={ids}
                                // maxTagCount={1}
                                maxSelectLength={6}
                                showSearch={false}
                                showCheckAll={false}
                                onChange={(value) => {
                                  form?.current?.setFieldsValue({
                                    buildingNumDataObj: {
                                      [item.id]: value,
                                    },
                                  });
                                }}
                                placeholder="请选择楼层"
                              />
                            </ProFormItem>
                          );
                        }}
                      </ProFormItem>
                    </List.Item>
                  )}
                />
              </ProFormItem>
            ) : null;
          }}
        </ProFormDependency>
      </>
    );
  },
);

export default BaseMessage;
