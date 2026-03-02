import ErrorBoundary from "@/components/providers/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <main className="flex-1 overflow-hidden relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
