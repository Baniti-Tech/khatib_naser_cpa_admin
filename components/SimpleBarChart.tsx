type Point = { label: string; value: number };

const TRACK_H = 180;
const BAR_COLOR = "#1e3a54";

export function SimpleBarChart({
  data,
  maxBars = 14,
}: {
  data: Point[];
  maxBars?: number;
}) {
  const slice = data.slice(-maxBars);
  const max = Math.max(...slice.map((d) => d.value), 1);
  const nonZero = slice.filter((p) => p.value > 0);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-end justify-between">
        <h3 className="font-bold text-brand-navy">ביקורים יומיים</h3>
        <span className="text-xs text-brand-dark/50">14 ימים אחרונים</span>
      </div>
      {nonZero.length > 0 ? (
        <p className="mb-3 text-xs font-medium text-brand-medium">
          {nonZero.map((p) => `${p.label}: ${p.value}`).join(" · ")}
        </p>
      ) : (
        <p className="mb-3 text-xs text-amber-700">אין נקודות יומיות מה־API</p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          width: "100%",
          height: TRACK_H,
        }}
      >
        {slice.map((point) => {
          const barH =
            point.value <= 0
              ? 4
              : Math.max(16, Math.round((point.value / max) * (TRACK_H - 24)));
          const label =
            point.label.length >= 10 ? point.label.slice(5) : point.label;
          return (
            <div
              key={point.label}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
              }}
              title={`${point.label}: ${point.value}`}
            >
              <div
                style={{
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  color: BAR_COLOR,
                  lineHeight: "16px",
                }}
              >
                {point.value > 0 ? point.value : ""}
              </div>
              <div
                style={{
                  width: "70%",
                  height: barH,
                  backgroundColor: BAR_COLOR,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: "#30537a99",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
