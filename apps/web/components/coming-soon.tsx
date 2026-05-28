interface ComingSoonProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Icon size={22} className="text-white/50" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
      <p className="mb-4 max-w-xs text-sm text-white/50">{description}</p>
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
        style={{ backgroundColor: "#7C3AED" }}
      >
        Coming soon
      </span>
    </div>
  );
}
