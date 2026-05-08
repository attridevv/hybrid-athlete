import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <MobileNav />
      <main className="pl-64 max-md:pl-0 max-md:pb-20">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
