"use client";

import { useParams } from "next/navigation";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The parent dashboard layout already renders <Sidebar />.
  // We just need to pass context so Sidebar can show the project nav.
  // This is handled via URL auto-detection in the Sidebar component.
  return <>{children}</>;
}
