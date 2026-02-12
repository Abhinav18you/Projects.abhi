import { create } from 'zustand';

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ProcessedResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  finalSize: number;
  fakeMetadata?: {
    gps?: string;
    model?: string;
  };
}

interface AppState {
  modules: {
    disinformation: boolean; // Ghost Mode
    digitalDust: boolean; // Hash Breaking
    deadDrop: boolean; // P2P
  };
  terminalLogs: string[];
  fileState: {
    originalFile: File | null;
    status: ProcessingStatus;
    result: ProcessedResult | null;
    error: string | null;
  };

  toggleModule: (module: keyof AppState['modules']) => void;
  addLog: (message: string) => void;
  setFileState: (updates: Partial<AppState['fileState']>) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  modules: {
    disinformation: false,
    digitalDust: false,
    deadDrop: false,
  },
  terminalLogs: [],
  fileState: {
    originalFile: null,
    status: 'idle',
    result: null,
    error: null,
  },

  toggleModule: (module) =>
    set((state) => ({
      modules: {
        ...state.modules,
        [module]: !state.modules[module],
      },
    })),

  addLog: (message) =>
    set((state) => ({
      terminalLogs: [...state.terminalLogs, `> ${message}`],
    })),

  setFileState: (updates) =>
    set((state) => ({
      fileState: { ...state.fileState, ...updates },
    })),

  reset: () =>
    set({
      terminalLogs: [],
      fileState: {
        originalFile: null,
        status: 'idle',
        result: null,
        error: null,
      },
    }),
}));
