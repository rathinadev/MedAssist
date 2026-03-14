"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === "caretaker") {
          router.replace("/caretaker");
        } else {
          router.replace("/patient");
        }
      } catch {
        // Invalid stored user, stay on auth page
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
