export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">Overview</h2>
      <p className="mt-1 text-sm text-white/50">Your analytics at a glance</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Total Followers", "Avg. Engagement", "Posts This Month"].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 p-6"
              style={{ backgroundColor: "#15161E" }}
            >
              <p className="text-xs text-white/50">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">—</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
