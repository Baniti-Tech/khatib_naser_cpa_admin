type Point = { label: string; value: number };

const CHART_HEIGHT_PX = 160;

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
      <div className="flex items-end gap-1.5">
        {slice.map((point) => {
          const barPx =
            point.value <= 0
              ? 4
              : Math.max(12, Math.round((point.value / max) * CHART_HEIGHT_PX));
          return (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span className="h-4 text-[10px] font-semibold text-brand-navy/70">
                {point.value > 0 ? point.value : ""}
              </span>
              <div
                className="relative w-full"
                style={{ height: CHART_HEIGHT_PX }}
              >
                <div
                  className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-brand-navy to-brand-medium"
                  style={{ height: barPx }}
                  title={`${point.label}: ${point.value}`}
                />
              </div>
              <span className="text-[10px] text-brand-dark/45">
                {point.label.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
