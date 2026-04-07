import { Sidebar } from "@/components/layout/Sidebar";
import { ChatTerminal } from "@/components/chat/ChatTerminal";
import { connectToDB } from "@/lib/db/connect";

export default async function Home() {

  await connectToDB();

  return (
    // 1. h-screen aur overflow-hidden poore page ka scroll band kar dega
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden w-full">
      
      {/* Panel 1: Navigation - Sidebar apni fixed width le lega aur h-full rahega */}
      <div className="flex-shrink-0 h-full border-r border-slate-800">
        <Sidebar />
      </div>

      {/* Panel 2: AI Chat Area - flex-1 bachi hui saari width le lega */}
      <main className="flex-1 h-full overflow-hidden relative">
        <ChatTerminal />
      </main>

    </div>
  );
}