export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#08090C" }}
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-[#00D97E]" />
    </div>
  );
}
