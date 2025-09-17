import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Builder Sandbox",
  description: "Declarative form generation prototype",
};

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
