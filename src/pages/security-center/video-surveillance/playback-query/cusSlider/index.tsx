import styles from './style.less';
import { Slider } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
type Iprops = {
  date: any;
  onAfterChange: (val: any) => void;
};
const CusSlider: React.FC<Iprops> = ({ date, onAfterChange }) => {
  const [value, setValue] = useState<number>();
  const minTime = useMemo(() => {
    const times = dayjs(date.format('YYYY-MM-DD') + ' 00:00:00').unix() * 1000;
    setValue(times);
    return times;
  }, [date]);
  const maxTime = useMemo(() => {
    return dayjs(date.format('YYYY-MM-DD') + ' 23:59:59').unix() * 1000;
  }, [date]);
  const onChange = (val: number) => {
    setValue(val);
  };
  return (
    <>
      <Slider
        className={styles.cusSlider}
        value={value}
        onChange={onChange}
        min={minTime}
        max={maxTime}
        tooltip={{
          formatter: (val) => {
            return dayjs(val).format('HH:mm:ss');
          },
          placement: 'bottom',
        }}
        onAfterChange={onAfterChange}
      />
      <div className={styles.sliderBottom}>
        <div>00:00</div>
        <div>01:00</div>
        <div>02:00</div>
        <div>03:00</div>
        <div>04:00</div>
        <div>05:00</div>
        <div>06:00</div>
        <div>07:00</div>
        <div>08:00</div>
        <div>09:00</div>
        <div>10:00</div>
        <div>11:00</div>
        <div>12:00</div>
        <div>13:00</div>
        <div>14:00</div>
        <div>15:00</div>
        <div>16:00</div>
        <div>17:00</div>
        <div>18:00</div>
        <div>19:00</div>
        <div>20:00</div>
        <div>21:00</div>
        <div>22:00</div>
        <div>23:00</div>
      </div>
    </>
  );
};

export default CusSlider;
