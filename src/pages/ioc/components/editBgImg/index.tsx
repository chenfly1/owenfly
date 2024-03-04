import { useState, useEffect } from 'react';
import styles from './style.less';

function EditBgImg() {
  // const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setCurrentDateTime(new Date());
    // }, 1000); // 每秒更新一次

    return () => {
      // clearInterval(interval);
    };
  }, []);

  return <></>;
}

export default EditBgImg;
