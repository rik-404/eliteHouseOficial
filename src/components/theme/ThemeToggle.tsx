import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-amber-500" />
      <Switch 
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-blue-500 hover:data-[state=checked]:bg-blue-600"
      />
      <Moon className="h-4 w-4 text-blue-500" />
      <Label htmlFor="theme-toggle" className="sr-only">
        Alternar tema
      </Label>
    </div>
  );
}
