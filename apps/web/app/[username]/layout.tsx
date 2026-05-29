export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {children}
    </div>
  );
}
