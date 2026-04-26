import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-[#E5E7EB]">
      {/* 🛠️ Sidebar fixed width le lega */}
      <Sidebar />
      
      {/* 🚀 Baki saara content (Dashboard, Workspace, Chat) yahan load hoga */}
      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}