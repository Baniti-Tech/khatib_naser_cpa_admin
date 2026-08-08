type Point = { label: string; value: number };

const WIDTH = 640;
const HEIGHT = 200;
const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const PAD_X = 8;

export function SimpleBarChart({
  data,
  maxBars = 14,
}: {
  data: Point[];
  maxBars?: number;
}) {
  const slice = data.slice(-maxBars);
  const max = Math.max(...slice.map((d) => d.value), 1);
  const n = Math.max(slice.length, 1);
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = (WIDTH - PAD_X * 2) / n;
  const barW = Math.max(6, slot * 0.55);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="font-bold text-brand-navy">ביקורים יומיים</h3>
        <span className="text-xs text-brand-dark/50">14 ימים אחרונים</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-52 w-full"
        role="img"
        aria-label="ביקורים יומיים"
      >
        {slice.map((point, i) => {
          const barH =
            point.value <= 0
              ? 3
              : Math.max(10, (point.value / max) * plotH);
          const x = PAD_X + i * slot + (slot - barW) / 2;
          const y = PAD_TOP + plotH - barH;
          const label = point.label.length >= 10 ? point.label.slice(5) : point.label;
          return (
            <g key={point.label}>
              {point.value > 0 ? (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-brand-navy"
                  fontSize="11"
                  fontWeight="600"
                >
                  {point.value}
                </text>
              ) : null}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx="4"
                className="fill-brand-navy"
              >
                <title>
                  {point.label}: {point.value}
                </title>
              </rect>
              <text
                x={x + barW / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-brand-dark/50"
                fontSize="10"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
