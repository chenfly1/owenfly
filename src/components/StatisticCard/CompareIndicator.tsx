import Style from './index.less';

export interface CompareIndicatorProps {
  value: string | number;
  label?: string;
  direction?: 'top' | 'down';
  className?: string;
  style?: any;
  inline?: boolean;
}

export default ({ label, value, direction, className, style, inline }: CompareIndicatorProps) => {
  return (
    <div
      className={`${Style.statistic_compare} ${inline ? Style['statistic_compare--inline'] : ''} ${
        className || ''
      }`}
      style={style}
    >
      {label ? <span className={Style.statistic_compare__label}>{label}</span> : null}
      <span
        className={`${Style.statistic_compare__direction} ${
          Style[`statistic_compare__direction--${direction}`]
        }`}
      >
        {value}
      </span>
    </div>
  );
};
