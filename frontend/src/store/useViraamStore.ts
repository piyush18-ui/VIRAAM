import { create } from 'zustand';

interface ViraamState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeScenario: string | null;
  setActiveScenario: (scenario: string | null) => void;
  simulationSpeed: '1x' | '5x' | '20x';
  setSimulationSpeed: (speed: '1x' | '5x' | '20x') => void;
  activeSimCaseId: string | null;
  setActiveSimCaseId: (caseId: string | null) => void;
  latestHoldNotice: { caseId: string; holdId: string; phrase?: string } | null;
  setLatestHoldNotice: (notice: { caseId: string; holdId: string; phrase?: string } | null) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem('viraam_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark'; // default dark-first
};

export const useViraamStore = create<ViraamState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('viraam_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('viraam_theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return { theme: next };
    }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  activeScenario: null,
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  simulationSpeed: '1x',
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  activeSimCaseId: null,
  setActiveSimCaseId: (caseId) => set({ activeSimCaseId: caseId }),
  latestHoldNotice: null,
  setLatestHoldNotice: (notice) => set({ latestHoldNotice: notice }),
}));
