"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "#08090C" }}
    >
      <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
      <button
        onClick={reset}
        className="rounded-lg px-4 py-2 text-sm font-medium text-black"
        style={{ backgroundColor: "#00D97E" }}
      >
        Try again
      </button>
    </div>
  );
}
