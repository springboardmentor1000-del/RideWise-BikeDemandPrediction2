import { Moon, Sun, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden group hover:bg-primary/10"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        theme === 'dark' 
          ? 'opacity-100 bg-gradient-to-br from-accent/20 to-primary/20' 
          : 'opacity-0'
      }`} />
      
      {/* Stars decoration for dark mode */}
      <Stars className={`absolute h-3 w-3 top-1 right-1 text-accent transition-all duration-500 ${
        theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`} />
      
      <Sun className={`h-5 w-5 text-primary transition-all duration-500 ${
        theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
      }`} />
      <Moon className={`absolute h-5 w-5 text-accent transition-all duration-500 ${
        theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
