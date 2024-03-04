import { DefaultFooter } from '@ant-design/pro-layout';
const Footer: React.FC = () => {
  const defaultMessage = '零洞科技有限公司';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'Alita',
          title: 'Alita智慧社区',
          href: 'https://lingdong.cn/',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
