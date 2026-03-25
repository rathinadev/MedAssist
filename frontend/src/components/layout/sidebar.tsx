"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Pill,
  CalendarDays,
  History,
  X,
  Microscope,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: "caretaker" | "patient";
  open: boolean;
  onClose: () => void;
}

const caretakerNav = [
  { label: "Dashboard", href: "/caretaker", icon: LayoutDashboard },
  { label: "Patients", href: "/caretaker/patients", icon: Users },
  { label: "Scan Prescription", href: "/caretaker/scan", icon: ScanLine },
  { label: "AI Lab", href: "/caretaker/ml-playground", icon: Microscope },
];

const patientNav = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Medications", href: "/patient/medications", icon: Pill },
  { label: "Scan Prescription", href: "/patient/scan", icon: ScanLine },
  { label: "History", href: "/patient/history", icon: History },
];

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "caretaker" ? caretakerNav : patientNav;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link href={role === "caretaker" ? "/caretaker" : "/patient"} className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold">MedAssist</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-sidebar-primary/5 border-sidebar-primary/20 hover:bg-sidebar-primary/10 text-sidebar-primary"
            onClick={() => {
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("MedAssist Voice System is active and ready.");
                window.speechSynthesis.speak(utterance);
                toast.success("Voice Engine Active");
              } else {
                toast.error("Speech Synthesis not supported");
              }
            }}
          >
            <Volume2 className="h-4 w-4" />
            <span className="font-bold">Test Voice</span>
          </Button>

          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="h-4 w-4 text-sidebar-foreground/50" />
            <span className="text-xs text-sidebar-foreground/50">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
