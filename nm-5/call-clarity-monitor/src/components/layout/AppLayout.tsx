
import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile
  const isOpen = isMobile ? false : sidebarOpen;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isOpen} />
      <div className="flex flex-col w-full">
        <Navbar 
          isSidebarOpen={isOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
