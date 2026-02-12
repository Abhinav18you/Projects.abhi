import { useAppStore } from '../store/useAppStore';

export const logToTerminal = (message: string) => {
  useAppStore.getState().addLog(message);
};
