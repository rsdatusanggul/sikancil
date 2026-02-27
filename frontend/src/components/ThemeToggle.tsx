import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    // Cycle: light → dark → system → light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />;
      case 'system':
        return <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />;
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode (click for Dark)';
      case 'dark':
        return 'Dark mode (click for System)';
      case 'system':
        return 'System mode (click for Light)';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}
