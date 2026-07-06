import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, WakeupSession, DrowsinessEvent, HourlyStats } from '@/types';

interface AppState {
  session: WakeupSession;
  settings: Settings;
  history: DrowsinessEvent[];
  hourlyStats: HourlyStats[];

  startSession: () => void;
  stopSession: () => void;
  triggerWakeup: () => void;
  dismissWakeup: () => void;
  recordDrowsiness: (event: Omit<DrowsinessEvent, 'id'>) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  clearHistory: () => void;
}

const defaultSettings: Settings = {
  detection: {
    eyeClosureThreshold: 4.0,
    detectionMode: 'normal',
    cameraId: 'default',
  },
  wakeup: {
    volume: 80,
    enableDeepSleepExclusion: false,
    enableVolumeBoost: true,
  },
  notifications: {
    drowsinessAlert: true,
    dailyReport: false,
  },
  ai: {
    dataCollection: true,
    historyRetentionDays: 30,
  },
};

const defaultSession: WakeupSession = {
  isActive: false,
  startTime: null,
  isWakeupScreenVisible: false,
  currentStats: {
    blinkCount: 0,
    avgBlinkDuration: 0,
    focusTime: 0,
    drowsinessEvents: [],
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      session: defaultSession,
      settings: defaultSettings,
      history: [],
      hourlyStats: generateMockHourlyStats(),

      startSession: () =>
        set(() => ({
          session: {
            ...defaultSession,
            isActive: true,
            startTime: new Date(),
          },
        })),

      stopSession: () =>
        set(() => ({
          session: { ...defaultSession },
        })),

      triggerWakeup: () =>
        set((state) => ({
          session: { ...state.session, isWakeupScreenVisible: true },
        })),

      dismissWakeup: () =>
        set((state) => ({
          session: { ...state.session, isWakeupScreenVisible: false },
        })),

      recordDrowsiness: (event) =>
        set((state) => {
          const newEvent: DrowsinessEvent = {
            ...event,
            id: crypto.randomUUID(),
          };
          return {
            session: {
              ...state.session,
              currentStats: {
                ...state.session.currentStats,
                blinkCount: state.session.currentStats.blinkCount + 1,
                drowsinessEvents: [
                  ...state.session.currentStats.drowsinessEvents,
                  newEvent,
                ],
              },
            },
            history: [newEvent, ...state.history],
          };
        }),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'wakelens-storage',
      partialize: (state) => ({
        settings: state.settings,
        history: state.history,
      }),
    }
  )
);

function generateMockHourlyStats(): HourlyStats[] {
  return [9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => ({
    hour,
    focus: Math.floor(Math.random() * 40) + 10,
    drowsy: Math.floor(Math.random() * 15) + 1,
  }));
}
