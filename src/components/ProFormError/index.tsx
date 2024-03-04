import { CloseCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import styles from './style.less';

type InternalNamePath = (string | number)[];

type IProps = {
  errors: ErrorField[];
  fieldLabels: Record<string, any>;
};

interface ErrorField {
  name: InternalNamePath;
  errors: string[];
}

const ProFormError: React.FC<IProps> = ({ errors, fieldLabels }) => {
  const errorCount = errors.filter((item) => item.errors.length > 0).length;
  if (!errors || errorCount === 0) {
    return null;
  }
  const scrollToField = (fieldKey: string) => {
    const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
    if (labelNode) {
      labelNode.scrollIntoView(true);
    }
  };
  const errorList = errors.map((err) => {
    if (!err || err.errors.length === 0) {
      return null;
    }
    const key = err.name[err.name.length - 1] as string;
    return (
      <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
        <CloseCircleOutlined className={styles.errorIcon} />
        <div className={styles.errorMessage}>{err.errors[0]}</div>
        <div className={styles.errorField}>{fieldLabels[key]}</div>
      </li>
    );
  });
  return (
    <span className={styles.errorIcon}>
      <Popover
        title="表单校验信息"
        content={errorList}
        overlayClassName={styles.errorPopover}
        trigger="click"
        getPopupContainer={(trigger: HTMLElement) => {
          if (trigger && trigger.parentNode) {
            return trigger.parentNode as HTMLElement;
          }
          return trigger;
        }}
      >
        <CloseCircleOutlined />
      </Popover>
      {errorCount}
    </span>
  );
};

export default ProFormError;
