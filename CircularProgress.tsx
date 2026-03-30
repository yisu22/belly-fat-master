type CircularProgressProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
};

export function CircularProgress({ percent, size = 80, strokeWidth = 7 }: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circ * (1 - clamped / 100);
  const done = clamped >= 100;
  const cx = size / 2;

  return (
    <svg width={size} height={size} aria-hidden="true">
      <circle
        cx={cx} cy={cx} r={r}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth}
      />
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={done ? '#34d399' : 'rgba(255,255,255,0.9)'}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={cx} y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fill={done ? '#34d399' : 'white'}
        fontSize={size < 60 ? 12 : 15}
        fontWeight="800"
        fontFamily="-apple-system, sans-serif"
      >
        {clamped}%
      </text>
    </svg>
  );
}
