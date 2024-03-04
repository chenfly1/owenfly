/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import { Button, Form, message, Space, Table, Input, Select } from 'antd';
import styles from '../style.less';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { addUser, allUse } from '@/services/workorder';
import { storageSy } from '@/utils/Setting';
import { Access, useAccess, history } from 'umi';
const columns: ColumnsType<DataType> = [
  {
    title: '用户账号',
    dataIndex: 'account',
    ellipsis: true,
  },
  {
    title: '用户姓名',
    dataIndex: 'name', //name
    ellipsis: true,
  },
  {
    title: '手机号',
    dataIndex: 'mobile', //mobile
    ellipsis: true,
  },
  {
    title: '角色',
    dataIndex: 'rolesTexts', //rolesTexts
    ellipsis: true,
  },
];

type IProps = {
  onSubmit: () => void; // 表单提交函数
  data: any;
};

const AddModelForm: React.FC<IProps> = (props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [keysDatas, setkeysDatas] = useState<DataType[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [dataSource, setDataSource] = useState<any>();
  const [dataSourceA, setDataSourceA] = useState<any>();
  const access = useAccess();

  // 弹窗
  const { onSubmit, data } = props;
  const { Search } = Input;
  const [form] = Form.useForm<{ name: string; company: string }>();
  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        onSubmit();
        resolve(true);
      }, time);
    });
  };
  // 弹窗end

  //请求end
  const getAllUse = async (id: string) => {
    const msg = await allUse({
      projectBid: data,
    });
    if (msg.code === 'SUCCESS') {
      const res = msg.data;
      res.forEach(
        (item: { roles: any; rolesTexts: any; key: number | string; userBid: number | string }) => {
          item.key = item.userBid;
          item.roles = item.rolesTexts.join(' ');
        },
      );
      console.log('表格内所有角色', res);
      setDataSource(res); //表格数据
      setDataSourceA(res); //表格数据

      const rolesTextsArray = [
        ...new Set(
          msg.data
            .map((item: { rolesTexts: any }) => item.rolesTexts)
            .reduce((prev: string | any[], curr: any) => prev.concat(curr), []),
        ),
      ];
      const formattedArray = rolesTextsArray.map((item) => ({
        value: item,
        label: item,
      }));
      setAllRoles(formattedArray); //角色下拉列表
    }
  };
  //请求end

  //tab

  const onAllSelect = (selected: any, selectedRows: any, changeRows: any) => {
    console.log(selected, selectedRows, changeRows);
    const keysArray = changeRows.map((item: { key: any }) => item.key);

    if (selected) {
      setkeysDatas((prevKeysDatas) => [...prevKeysDatas, ...changeRows]);
      setSelectedRowKeys((prevSelectedRowKeys) => [...prevSelectedRowKeys, ...keysArray]);
    } else {
      const updatedSelectedRowKeys = selectedRowKeys.filter((key) => !keysArray.includes(key));
      setSelectedRowKeys(updatedSelectedRowKeys);
      const filteredKeysDatas = keysDatas.filter((item) => {
        return !changeRows.some((row: { key: any }) => row.key === item.key);
      });
      setkeysDatas(filteredKeysDatas);
    }
  };

  const ononSelect = (record: any, selected: boolean, selectedRows: DataType[]) => {
    // console.log(record.key);
    // console.log(selected);
    // console.log(selectedRows);

    setSelectedRowKeys((prevSelectedRowKeys) => {
      const updatedSelectedRowKeys = selected
        ? [...prevSelectedRowKeys, record.key]
        : prevSelectedRowKeys.filter((key) => key !== record.key);

      setkeysDatas((prevKeysDatas) => {
        const keyData = dataSourceA.filter((item: { key: React.Key }) =>
          updatedSelectedRowKeys.includes(item.key),
        );
        return keyData;
      });

      return updatedSelectedRowKeys;
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onSelectAll: onAllSelect,
    onSelect: ononSelect,
  };
  const log = (key: any) => {
    console.log('tab点击关闭的key:', key);
    const result = selectedRowKeys.filter((item) => item !== key); //点击关闭时候同步到表格取消
    const newData = keysDatas.filter((item) => item.key !== key); //从存储中的数据中过滤出取消的数据

    setSelectedRowKeys(result);
    setkeysDatas(newData);
    console.log('取消后的所有key:', result, '取消后的说有key的数据:', newData);
  };

  //tabEnd
  const searchAccounts = (data: any, keyword: string) => {
    const results = [];
    const normalizedKeyword = keyword.toLowerCase();

    for (const item of data) {
      const { account, name, mobile } = item;
      const normalizedAccount = account ? account.toLowerCase() : '';
      const normalizedName = name ? name.toLowerCase() : '';
      const normalizedMobile = mobile ? mobile.toLowerCase() : '';

      if (
        normalizedAccount.includes(normalizedKeyword) ||
        normalizedName.includes(normalizedKeyword) ||
        normalizedMobile.includes(normalizedKeyword)
      ) {
        results.push(item);
      }
    }

    return results;
  };

  // 搜索框
  const onSearch = (value: string) => {
    // console.log('搜索的内容是:', value);
    // setTimeout(() => {
    //   setDataSource(dataSourceA);
    //   const lowerCaseValue = value.toLowerCase(); // 将输入的搜索值转换为小写字母，方便匹配
    //   const filtered = dataSourceA.filter(
    //     (item: { account: string; name: string; mobile: string }) =>
    //       item.account.toLowerCase().includes(lowerCaseValue) || // 匹配 account 字段
    //       item.name.toLowerCase().includes(lowerCaseValue) || // 匹配 name 字段
    //       item.mobile.toLowerCase().includes(lowerCaseValue), // 匹配 phone 字段
    //   );
    //   console.log('匹配的数据:', filtered);
    //   setDataSource(filtered); //把过滤后的数据保存到表格中
    // }, 300);
    const searchResults = searchAccounts(dataSourceA, value);
    setDataSource(searchResults);
  };
  // 搜索框end

  // 角色下拉框
  const onChange = (value: string) => {
    // setNewKeysDatas(keysDatas)//之前的数据保存
    // setNewSelectedRowKeys(selectedRowKeys)//之前的key保存
    if (!value) {
      setDataSource(dataSourceA);
    } else {
      setTimeout(() => {
        setDataSource(dataSourceA);
        const filtered = dataSourceA.filter(
          (dataSourceA: { roles: string }) => dataSourceA.roles.toLowerCase().includes(value), // 匹配 account 字段
        );
        setDataSource(filtered);
      }, 300);
    }
  };

  const onSearchA = (value: string) => {
    console.log('输入:', value);
  };
  // 角色下拉框 end

  useEffect(() => {
    console.log('data--------', data);
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    setProjectId(project.bid);
  }, []);

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="人员选择"
      width={994}
      trigger={
        <Button type="primary" onClick={() => getAllUse(projectId)}>
          <PlusOutlined />
          添加工单处理人
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setSelectedRowKeys([]);
          setkeysDatas([]);
        },
      }}
      onFinish={async (values) => {
        if (selectedRowKeys.length !== 0) {
          await waitTime(300);
          // 获取key
          const hash = window.location.hash;
          const param = hash.substring(1);
          // 获取key end

          const res = await addUser({
            categoryId: Number(param),
            userBids: selectedRowKeys,
            projectId: data,
          });
          if (res.code === 'SUCCESS') {
            message.success('添加成功！');
            setSelectedRowKeys([]);
            setkeysDatas([]);
          }
        }
        return true;
      }}
    >
      <div className={styles.ModBox}>
        <div className={styles.BoxLeft}>
          <p>可选用户</p>
          <div className={styles.BoxLeftTop}>
            <Space direction="horizontal">
              <Search
                placeholder="请输入姓名/账号/手机号"
                allowClear
                onSearch={onSearch}
                style={{ width: 230 }}
              />
              <div>
                <span>角色</span>
                <Select
                  style={{ width: 190, marginLeft: 8 }}
                  showSearch
                  allowClear
                  placeholder="请输入"
                  optionFilterProp="children"
                  onChange={onChange}
                  onSearch={onSearchA}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={allRoles}
                />
              </div>
            </Space>
          </div>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            className={styles.AddTableStyle}
            dataSource={dataSource}
            pagination={{
              pageSize: 5,
              showTotal: (total, range) => `共 ${total} 条`,
            }}
          />
        </div>
        <div className={styles.BoxMiddle}>
          <RightOutlined className={styles.BoxMiddleRightOutlined} />
        </div>
        <div className={styles.BoxRight}>
          <p>已选用户（{selectedRowKeys.length}人）</p>
          {keysDatas.map((item) => (
            <Tag closable onClose={() => log(item.key)} key={item.key} className={styles.TagStyle}>
              {item.name}
            </Tag>
          ))}
        </div>
      </div>
    </ModalForm>
  );
};

export default AddModelForm;
