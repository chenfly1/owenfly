import { useState, useEffect } from 'react';
import styles from './style.less';

function CurrentDateTime() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // 每秒更新一次

    return () => {
      clearInterval(interval);
    };
  }, []);

  const year = currentDateTime.getFullYear();
  const month = currentDateTime.getMonth() + 1; // 月份从 0 开始，因此需要加 1
  const date = currentDateTime.getDate();
  const hours = currentDateTime.getHours();
  const minutes = currentDateTime.getMinutes();
  const seconds = currentDateTime.getSeconds();

  return (
    <span className={styles.currentDateTime}>
      {year}-{month < 10 ? `0${month}` : month}-{date} {hours}:
      {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
}

export default CurrentDateTime;
