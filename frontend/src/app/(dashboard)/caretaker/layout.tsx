"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CaretakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role !== "caretaker") {
          router.replace("/patient");
        }
      } catch {
        router.replace("/login");
      }
    }
  }, [router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
