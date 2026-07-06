const API_BASE = '/api/ai';

export interface WakeupMessage {
  type: 'wakeup' | 'encourage' | 'report';
  context?: {
    drowsinessCount?: number;
    focusTime?: number;
    avgBlinkDuration?: number;
  };
}

export interface AIResponse {
  message: string;
  audioUrl?: string;
}

export async function getWakeupMessage(payload: WakeupMessage): Promise<AIResponse> {
  const res = await fetch(`${API_BASE}/wakeup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  return res.json();
}

export async function getDailyReport(stats: {
  totalDrowsy: number;
  totalFocus: number;
  avgBlink: number;
  peakHour: number;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  return data.report;
}
