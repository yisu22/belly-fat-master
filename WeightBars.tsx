import { formatShortDate } from '../utils/date';
import type { WeightEntry } from '../types';

type WeightBarsProps = {
  entries: WeightEntry[];
  maxBars?: number;
};

export function WeightBars({ entries, maxBars = 10 }: WeightBarsProps) {
  if (entries.length === 0) {
    return (
      <div className="empty-chart">
        체중을 기록하면<br />여기에 변화 그래프가 나타납니다.
      </div>
    );
  }

  const show = entries.slice(-maxBars);
  const minWeight = Math.min(...show.map((e) => e.weight));
  const maxWeight = Math.max(...show.map((e) => e.weight));
  const range = Math.max(0.5, maxWeight - minWeight);
  const minCount = show.filter((e) => e.weight === minWeight).length;

  return (
    <div className="weight-bars">
      {show.map((entry, index) => {
        const heightPercent = ((entry.weight - minWeight) / range) * 62 + 24;
        const isLatest = index === show.length - 1;
        const isMin = entry.weight === minWeight && minCount === 1;

        return (
          <div key={entry.date} className="weight-bar-item">
            <div className={`weight-bar-value ${isLatest ? 'is-latest' : isMin ? 'is-min' : ''}`}>
              {entry.weight.toFixed(1)}
            </div>
            {isMin && !isLatest && (
              <div style={{ fontSize: 8, color: 'var(--success)', lineHeight: 1 }}>최저</div>
            )}
            <div
              className={`weight-bar-column ${isLatest ? 'is-latest' : isMin ? 'is-min' : ''}`}
              style={{ height: `${heightPercent}%` }}
            />
            <div className="weight-bar-date">{formatShortDate(entry.date)}</div>
          </div>
        );
      })}
    </div>
  );
}
