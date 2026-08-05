type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
};

export function StatCard({ label, value, hint, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-sm text-brand-dark/60">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand-navy">{value}</p>
      {(hint || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          {hint ? <span className="text-brand-dark/50">{hint}</span> : <span />}
          {trend ? <span className="font-medium text-brand-medium">{trend}</span> : null}
        </div>
      )}
    </div>
  );
}
