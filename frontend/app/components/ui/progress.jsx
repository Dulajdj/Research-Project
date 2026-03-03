export const Progress = ({ value = 0, className = '' }) => {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className={`w-full bg-slate-800/30 rounded-full overflow-hidden ${className}`}>
      <div
        style={{ width: `${pct}%` }}
        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      />
    </div>
  );
};
