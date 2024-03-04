import Style from './index.less';
import CountUp from 'react-countup';

export interface IndicatorProps {
  value: number | string;
  label?: string;
  size?: 'large' | 'middle' | 'small';
  unit?: string | React.ReactNode;
  inline?: boolean;
  className?: string;
  labelStyle?: any;
  valueStyle?: any;
  unitStyle?: any;
  style?: any;
  countProps?: any;
  notCountUp?: boolean;
}

export default ({
  label,
  value,
  size = 'small',
  unit,
  inline,
  className,
  labelStyle,
  valueStyle,
  unitStyle,
  style,
  countProps,
  notCountUp = false,
}: IndicatorProps) => {
  return (
    <div
      className={`${inline ? Style['statistic_indicator--inline'] : ''} ${
        Style[`statistic_indicator--${size}`]
      } ${className || ''}`}
      style={style}
    >
      {label ? (
        <span className={Style.statistic_indicator__label} style={labelStyle}>
          {label}
        </span>
      ) : null}
      <div>
        {
          <span className={Style.statistic_indicator__value} style={valueStyle}>
            {notCountUp ? <div>{value}</div> : <CountUp end={value} {...countProps} /> ?? 0}
          </span>
        }
        {unit ? (
          <span className={Style.statistic_indicator__unit} style={unitStyle}>
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
};
