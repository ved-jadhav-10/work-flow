import Sidebar from "@/components/layout/Sidebar";
import ErrorBoundary from "@/components/providers/ErrorBoundary";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex-1 overflow-hidden relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
