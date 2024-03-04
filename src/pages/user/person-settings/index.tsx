import React, { useState } from 'react';
import { Avatar, List, Upload, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import { useModel } from 'umi';
import { Method } from '@/utils';
import UpdateUserName from './components/updateUserName';
import CheckOldMobile from './components/checkOldMobile';
import CheckOldPassWord from './components/checkOldPassWord';
import OssImage from '@/components/OssImage';
import { securityBusiness } from '@/components/FileUpload/business';
import { usersUpdate } from '@/services/security';
import { getUserInfo } from '@/services/app';
import ProCard from '@ant-design/pro-card';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const beforeUpload = (file: any) => {
  // 校验图片格式(也可直接用 accept 属性限制如：accept="image/png,image/jpg,image/jpeg")
  const isFormat =
    file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
  // 校验图片大小
  const is5M = file.size / 1024 / 1024 < 2;

  if (!isFormat) {
    message.error('仅支持jpg,jpeg,png格式的图片');
    // return Upload.LIST_IGNORE;
  } else if (!is5M) {
    message.error('图片不能超过2M,请重新选择图片');
    return Upload.LIST_IGNORE;
  }
  return isFormat && is5M;
};

const SecurityView: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [nameBool, setNameBool] = useState<boolean>(false);
  const [phoneBool, setPhoneBool] = useState<boolean>(false);
  const [passwordBool, setPasswordBool] = useState<boolean>(false);
  const uploadImage = (options: any) => {
    const { onSuccess, file } = options;
    Method.uploadFile(file, securityBusiness).then(async (url) => {
      const _response = { name: file.name, status: 'done', path: url };
      const userRes = await usersUpdate({
        avatarUrl: url,
        name: currentUser?.userName,
        id: currentUser?.userId as any,
      });
      if (userRes.code === 'SUCCESS') {
        const userInfoRes = await getUserInfo();
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfoRes.data,
        }));
        onSuccess(_response, file);
        message.success('上传成功');
      }
    });
  };
  const getData = () => [
    {
      title: '用户姓名',
      description: <>{currentUser?.userName}</>,
      actions: [
        <a onClick={() => setNameBool(true)} key="nameBtn">
          编辑
        </a>,
      ],
    },
    {
      title: '账号名',
      description: <>{currentUser?.account}</>,
    },
    {
      title: (
        <>
          {currentUser?.userAvatarUrl ? (
            <OssImage
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              objectId={currentUser?.userAvatarUrl}
              business={securityBusiness.id}
            />
          ) : (
            <Avatar
              size="small"
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              className={styles.avatar}
              src={'/images/avart.png'}
              alt="avatar"
            />
          )}
          &nbsp;&nbsp;头像
        </>
      ),
      description: '支持2M以内的JPG或PNG图片',
      actions: [
        <Upload
          key="userAvatarUrl"
          beforeUpload={beforeUpload}
          showUploadList={false}
          customRequest={uploadImage}
        >
          <a>修改</a>
        </Upload>,
      ],
    },
    {
      title: '所属组织',
      description: `${currentUser?.orgNameList && currentUser?.orgNameList.join('，')}`,
    },
    {
      title: '角色',
      description: `${currentUser?.roles && currentUser?.roles.map((i) => i.name).join('，')}`,
    },
    {
      title: '手机号',
      description: `${Method.onlySeeSome(
        currentUser?.mobile as string,
        'phone',
      )}可用于手机验证码快捷登录，可以用于身份验证、密码找回、通知接收`,
      actions: [
        <a onClick={() => setPhoneBool(true)} key="phoneBtn">
          换绑
        </a>,
      ],
    },
    {
      title: '密码',
      description: '为了你的账号安全，建议定期修改密码',
      actions: [
        <a onClick={() => setPasswordBool(true)} key="passwordBtn">
          修改
        </a>,
      ],
    },
  ];

  const data = getData();
  return (
    <ProCard title="用户中心">
      <List<Unpacked<typeof data>>
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      <UpdateUserName open={nameBool} onOpenChange={setNameBool} />
      <CheckOldMobile open={phoneBool} onOpenChange={setPhoneBool} />
      <CheckOldPassWord open={passwordBool} onOpenChange={setPasswordBool} />
    </ProCard>
  );
};

export default SecurityView;
