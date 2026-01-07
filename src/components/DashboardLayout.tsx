import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Chatbot } from "@/components/Chatbot";
import { 
  Bike, 
  Home, 
  Calendar, 
  Clock, 
  MessageCircle, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Bell,
  Search
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard", color: "primary" },
  { icon: Calendar, label: "Daily Prediction", path: "/dashboard/daily", color: "primary" },
  { icon: Clock, label: "Hourly Prediction", path: "/dashboard/hourly", color: "accent" },
  { icon: MessageCircle, label: "Chatbot", path: "/dashboard/chat", color: "success" },
  { icon: User, label: "Profile", path: "/dashboard/profile", color: "primary" },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="p-6 border-b border-border relative">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl gradient-primary shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Bike className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">RideWise</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>AI Predictions</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">Navigation</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent animate-shimmer" />
                )}
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary-foreground/20" 
                    : "bg-muted group-hover:bg-primary/10"
                }`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-3 relative">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">Demo User</p>
              <p className="text-xs text-muted-foreground truncate">demo@ridewise.com</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <Bike className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">RideWise</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hover:bg-destructive/10 hover:text-destructive">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search predictions..." 
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
};
