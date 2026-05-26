import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "#08090C" }}
    >
      <p className="text-6xl font-bold text-white/10">404</p>
      <h1 className="text-lg font-semibold text-white">Page not found</h1>
      <Link
        href="/dashboard"
        className="text-sm text-[#00D97E] hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
