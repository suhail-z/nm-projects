
import { useState } from "react";
import { Menu, Bell, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar = ({ isSidebarOpen, toggleSidebar }: NavbarProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    
    toast({
      title: `${newMode ? "Dark" : "Light"} mode activated`,
      duration: 2000,
    });
  };
  
  return (
    <header className="border-b bg-card border-border sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold hidden md:block">
            <span className="text-gradient">Call Clarity</span> Monitor
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2">
                <p className="text-sm font-medium">Notifications</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-sm">Call analysis complete</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm">Compliance alert detected</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 text-center">
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-xs text-muted-foreground">Compliance Manager</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
