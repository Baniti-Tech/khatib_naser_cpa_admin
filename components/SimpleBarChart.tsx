type Point = { label: string; value: number };

export function SimpleBarChart({
  data,
  maxBars = 14,
}: {
  data: Point[];
  maxBars?: number;
}) {
  const slice = data.slice(-maxBars);
  const max = Math.max(...slice.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="font-bold text-brand-navy">ביקורים יומיים</h3>
        <span className="text-xs text-brand-dark/50">14 ימים אחרונים</span>
      </div>
      <div className="flex h-48 items-end gap-1.5">
        {slice.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-brand-navy to-brand-medium"
              style={{ height: `${(point.value / max) * 100}%`, minHeight: 4 }}
              title={`${point.label}: ${point.value}`}
            />
            <span className="text-[10px] text-brand-dark/45">
              {point.label.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
