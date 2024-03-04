import { getUserInfo } from '@/services/app';
import { usersUpdate } from '@/services/security';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useModel } from 'umi';
type IProps = {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
};

const UpdateUserName: React.FC<IProps & Record<string, any>> = ({ open, onOpenChange }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const onFinish = async (values: Record<string, any>) => {
    const res = await usersUpdate({
      ...values,
      avatarUrl: currentUser?.userAvatarUrl,
      id: currentUser?.userId as any,
    });
    if (res.code === 'SUCCESS') {
      const userInfoRes = await getUserInfo();
      setInitialState((s: any) => ({
        ...s,
        currentUser: userInfoRes.data,
      }));
      message.success('更新成功');
      onOpenChange(false);
    }
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      layout="horizontal"
      onOpenChange={onOpenChange}
      width={520}
      title="修改用户姓名"
      open={open}
      modalProps={{
        centered: true,
      }}
      onFinish={onFinish}
    >
      <ProFormText
        name="name"
        validateTrigger="onBlur"
        rules={[
          { required: true, message: '请输入用户姓名' },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z\·]+$/, message: '请输入中文或者英文字符' },
        ]}
        initialValue={currentUser?.userName}
      />
    </ModalForm>
  );
};

export default UpdateUserName;
