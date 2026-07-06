export interface DetectionStats {
  blinkCount: number;
  avgBlinkDuration: number;
  focusTime: number;
  drowsinessEvents: DrowsinessEvent[];
}

export interface DrowsinessEvent {
  id: string;
  timestamp: Date;
  duration: number;
  type: 'blink' | 'drowsy' | 'asleep';
}

export interface HourlyStats {
  hour: number;
  focus: number;
  drowsy: number;
}

export interface Settings {
  detection: {
    eyeClosureThreshold: number;
    detectionMode: 'fast' | 'normal' | 'slow';
    cameraId: string;
  };
  wakeup: {
    volume: number;
    enableDeepSleepExclusion: boolean;
    enableVolumeBoost: boolean;
  };
  notifications: {
    drowsinessAlert: boolean;
    dailyReport: boolean;
  };
  ai: {
    dataCollection: boolean;
    historyRetentionDays: number;
  };
}

export type PageId = 'detection' | 'wakeup' | 'stats' | 'settings';

export interface WakeupSession {
  isActive: boolean;
  startTime: Date | null;
  currentStats: DetectionStats;
  isWakeupScreenVisible: boolean;
}
