
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Upload, 
  FileAudio, 
  History, 
  Settings,
  Mic
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();

  // Navigation links
  const links = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: Home 
    },
    { 
      name: "Upload", 
      href: "/upload", 
      icon: Upload 
    },
    { 
      name: "Record", 
      href: "/record", 
      icon: Mic 
    },
    { 
      name: "Transcript", 
      href: "/transcript", 
      icon: FileAudio 
    },
    { 
      name: "History", 
      href: "/history", 
      icon: History
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings 
    },
  ];
  
  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-border transition-all duration-300 ease-in-out h-screen fixed lg:relative z-20",
        isOpen ? "w-56" : "w-0 lg:w-16 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-center h-16 border-b border-border">
          {isOpen ? (
            <h1 className="text-xl font-bold">
              <span className="text-primary">CC</span> Monitor
            </h1>
          ) : (
            <span className="text-xl font-bold text-primary">CC</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <link.icon className={cn("h-5 w-5", isOpen ? "mr-2" : "mx-auto")} />
                    {isOpen && <span>{link.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-border">
          {isOpen ? (
            <div className="text-xs text-muted-foreground text-center">
              <p>Call Clarity v1.0</p>
            </div>
          ) : (
            <div className="text-xs text-center">
              <p>v1.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
