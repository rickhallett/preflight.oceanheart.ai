import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preflight AI - Landing",
  description: "AI-powered preflight checklist system",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}