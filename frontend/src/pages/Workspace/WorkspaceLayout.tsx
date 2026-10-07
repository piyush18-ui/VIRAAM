import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  GitFork,
  Smartphone,
  FileText,
  Cpu,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  Pause
} from 'lucide-react';
import { useViraamStore } from '../../store/useViraamStore';
import { useEventStream } from '../../lib/useEventStream';
import { Dialog } from '../../components/ui/Dialog';
import { cn } from '../../lib/utils';

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    commandPaletteOpen,
    setCommandPaletteOpen,
    activeScenario,
    simulationSpeed
  } = useViraamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useEventStream();

  // Global Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const navItems = [
    { to: '/workspace', label: 'Command Center', icon: LayoutDashboard, exact: true },
    { to: '/workspace/cases', label: 'Cases & Holds', icon: ShieldAlert },
    { to: '/workspace/graph', label: 'Money Trail (Graph)', icon: GitFork },
    { to: '/workspace/simulator', label: 'Scam Simulator', icon: Smartphone },
    { to: '/workspace/audit', label: 'Audit Ledger', icon: FileText },
    { to: '/workspace/model', label: 'Model Insights', icon: Cpu },
  ];

  const searchResults = [
    { title: 'Command Center', desc: 'Live operations and overview metrics', path: '/workspace' },
    { title: 'Cases List', desc: 'View all active and resolved fraud holds', path: '/workspace/cases' },
    { title: 'Money Trail Graph', desc: 'Trace multi-hop mule networks & execute freeze plan', path: '/workspace/graph' },
    { title: 'Citizen & Family Simulator', desc: 'Simulate digital arrest and safe-phrase co-sign', path: '/workspace/simulator' },
    { title: 'Audit Trail', desc: 'Searchable tamper-evident regulatory ledger', path: '/workspace/audit' },
    { title: 'Model Diagnostics', desc: 'Logistic regression weights & ROC-AUC curves', path: '/workspace/model' },
    { title: 'Public Landing Page', desc: 'Return to public home', path: '/' },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-surface/95 border-r border-border backdrop-blur-md transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-18' : 'w-64',
          'hidden md:flex'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-amber-pause flex items-center justify-center text-black font-bold shadow-sm transition-transform group-hover:scale-105">
              <Pause className="w-4 h-4 fill-black" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-base tracking-tight text-foreground">Viraam</span>
                <span className="block text-[10px] text-muted tracking-widest uppercase font-mono">SecOps</span>
              </div>
            )}
          </NavLink>
          <button
            onClick={toggleSidebar}
            className="text-muted hover:text-foreground p-1.5 rounded-md hover:bg-elevated transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-amber-pause/10 text-amber-pause border border-amber-pause/25 font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-elevated/70'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-amber-pause' : 'text-muted'
                  )}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Live SSE status indicator */}
        <div className="p-3 border-t border-border">
          <div
            className={cn(
              'rounded-lg p-2.5 bg-elevated/50 border border-border flex items-center gap-2.5 text-xs',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="relative flex h-2 w-2">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                )}
              />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-[11px] font-medium text-foreground">
                  {isConnected ? 'Stream Connected' : 'Connecting stream...'}
                </p>
                <p className="text-[9px] text-muted font-mono">SSE Auto-Sync</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarCollapsed ? 'md:ml-18' : 'md:ml-64'
        )}
      >
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Quick search button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-elevated/70 border border-border text-xs text-muted hover:text-foreground hover:bg-elevated transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-muted" />
              <span>Search commands & pages...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-surface rounded border border-border">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Active scenario badge */}
            {activeScenario && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-pause/15 border border-amber-pause/30 text-amber-pause text-[11px] font-medium animate-pulse">
                <Radio className="w-3 h-3 text-amber-pause" />
                <span>Sim: {activeScenario} ({simulationSpeed})</span>
              </div>
            )}

            {/* Synthetic environment notice badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated border border-border text-[11px] text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-safe" />
              <span className="hidden lg:inline">Simulation environment, synthetic data</span>
              <span className="lg:hidden">Synthetic</span>
            </div>

            {/* Theme switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-elevated/70 border border-border text-muted hover:text-foreground transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Link back to landing */}
            <NavLink
              to="/"
              className="hidden sm:flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors ml-1"
            >
              <span>Landing</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Command Palette Modal */}
      <Dialog
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        title="Quick Command Palette"
        description="Navigate to any screen or inspect system modules"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Type to filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-elevated/80 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-pause"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {searchResults.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setCommandPaletteOpen(false);
                  navigate(item.path);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-elevated transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-amber-pause">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted">{item.desc}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            {searchResults.length === 0 && (
              <p className="text-xs text-muted text-center py-4">No matching commands or pages.</p>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
