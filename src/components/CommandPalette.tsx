import { useState, useEffect, useRef, useCallback, ElementType } from 'react';
import {
  Search,
  Home,
  User,
  FileText,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import HealthGuideIcon from './brand/HealthGuideIcon';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: ElementType;
  action: () => void;
  keywords?: string[];
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'home',
      label: 'Go to Home',
      icon: Home,
      action: () => onNavigate('home'),
      keywords: ['dashboard', 'main'],
      category: 'Navigation',
    },
    {
      id: 'profile',
      label: 'View Profile',
      icon: User,
      action: () => onNavigate('member-zone'),
      keywords: ['account', 'settings'],
      category: 'Navigation',
    },
    {
      id: 'reports',
      label: 'My Reports',
      icon: FileText,
      action: () => {
        try {
          sessionStorage.setItem('bmcore.pendingSection', 'reports');
        } catch {
          /* ignore */
        }
        onNavigate('member-zone');
      },
      keywords: ['documents', 'analysis', 'my reports'],
      category: 'Health',
    },
    {
      id: 'second-opinion',
      label: 'Get Second Opinion',
      icon: Activity,
      action: () => onNavigate('member-zone'),
      keywords: ['medical', 'doctor', 'review'],
      category: 'Health',
    },
    {
      id: 'ai-assistant',
      label: 'Open Health Guide',
      icon: HealthGuideIcon,
      action: () => {
        const event = new CustomEvent('open-ai-assistant');
        window.dispatchEvent(event);
      },
      keywords: ['chat', 'help', 'ai', 'assistant', 'health guide'],
      category: 'Tools',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => onNavigate('member-zone'),
      keywords: ['preferences', 'config'],
      category: 'Account',
    },
    {
      id: 'faq',
      label: 'FAQ & Help',
      icon: HelpCircle,
      action: () => onNavigate('faq'),
      keywords: ['support', 'questions'],
      category: 'Support',
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      action: async () => {
        await supabase.auth.signOut();
        onNavigate('home');
      },
      keywords: ['exit', 'leave'],
      category: 'Account',
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower)) ||
      cmd.category.toLowerCase().includes(searchLower)
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const addToRecentCommands = useCallback((cmdId: string) => {
    setRecentCommands((prev) => {
      const filtered = prev.filter((id) => id !== cmdId);
      return [cmdId, ...filtered].slice(0, 5);
    });
  }, []);

  const executeCommand = useCallback((cmd: Command) => {
    cmd.action();
    addToRecentCommands(cmd.id);
    onClose();
  }, [onClose, addToRecentCommands]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        } else {
          onClose();
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose, executeCommand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[var(--bm-surface)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {search === '' && recentCommands.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              {recentCommands.map((cmdId) => {
                const cmd = commands.find((c) => c.id === cmdId);
                if (!cmd) return null;
                return (
                  <CommandItem
                    key={cmd.id}
                    command={cmd}
                    isSelected={false}
                    onClick={() => executeCommand(cmd)}
                  />
                );
              })}
            </div>
          )}

          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {category}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isSelected={globalIndex === selectedIndex}
                        onClick={() => executeCommand(cmd)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                &#crarr;
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandItem({
  command,
  isSelected,
  onClick,
}: {
  command: Command;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = command.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{command.label}</div>
        {command.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {command.description}
          </div>
        )}
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-50" />
    </button>
  );
}
