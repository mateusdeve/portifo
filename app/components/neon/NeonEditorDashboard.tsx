import { ChatInputBar } from "./ChatInputBar";
import { NeonSidebar } from "./Sidebar";
import { NeonReactFlowCanvas } from "./NeonReactFlowCanvas";
import { TopRightProjectControls } from "./TopRightProjectControls";
import { MobileNavDrawer } from "./MobileNavDrawer";


export function NeonEditorDashboard() {
  return (
    <div className="dark relative min-h-screen overflow-hidden">
      <TopRightProjectControls />
      <NeonSidebar />
      <MobileNavDrawer />

      <main className="ml-0 md:ml-72 mr-0 h-[100svh] pt-14 relative overflow-hidden">
        <NeonReactFlowCanvas />
        <ChatInputBar />
      </main>
    </div>
  );
}

