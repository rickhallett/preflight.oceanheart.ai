import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Preflight AI - Dashboard",
  description: "AI-powered preflight checklist system",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout>{children}</AppLayout>
      </ToastProvider>
    </AuthProvider>
  );
}