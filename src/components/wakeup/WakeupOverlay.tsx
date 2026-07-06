import { Play, Radio, Moon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useRef } from 'react';

export function WakeupOverlay() {
  const dismissWakeup = useStore((s) => s.dismissWakeup);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volume = useStore((s) => s.settings.wakeup.volume);

  useEffect(() => {
    // Play alert sound if available
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center">
      {/* LIVE indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
        <Radio className="w-3 h-3 text-red-400 animate-pulse" />
        <span className="text-white/80 text-xs font-medium">LIVE</span>
      </div>

      {/* Alert badge */}
      <div className="mb-6 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
        <p className="text-red-400 text-sm font-medium animate-pulse">
          눈 감음이 {useStore.getState().settings.detection.eyeClosureThreshold}초 이상 감지 되었어요
        </p>
      </div>

      {/* Video player placeholder */}
      <div className="relative w-64 h-40 bg-gray-800 rounded-2xl overflow-hidden mb-8 shadow-2xl border border-white/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Ian message */}
      <div className="text-center mb-2">
        <p className="text-xs text-gray-400 mb-1">이안 · 지금 바로 일어나 · AI 도우미</p>
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">이안이 깨우고 있어요</h1>
      <p className="text-gray-400 text-sm text-center max-w-xs leading-relaxed mb-10">
        눈을 뜨고 화면을 확인하면 자동으로 감지 되고 되돌아갑니다
      </p>

      {/* Dismiss button */}
      <button
        onClick={dismissWakeup}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/20 transition-colors"
      >
        <Moon className="w-4 h-4" />
        잠시 · 깊은 취침
      </button>

      <audio ref={audioRef} src="/wakeup.mp3" loop />
    </div>
  );
}
