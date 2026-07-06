import { Moon, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';
import { parseYouTubeUrl, getEmbedUrl } from '@/api/youtube';

export function WakeupOverlay() {
  const dismissWakeup = useStore((s) => s.dismissWakeup);
  const wakeupVideoUrl = useStore((s) => s.wakeupVideoUrl);
  const volume = useStore((s) => s.settings.wakeup.volume);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    const id = parseYouTubeUrl(wakeupVideoUrl);
    setVideoId(id);
  }, [wakeupVideoUrl]);

  const embedUrl = videoId ? getEmbedUrl(videoId, true, volume < 10) : null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center">
      {/* YouTube video fullscreen */}
      {embedUrl ? (
        <>
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
          {/* Overlay gradient for UI elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </>
      ) : (
        /* Fallback: no video set */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-40 bg-gray-800 rounded-2xl flex items-center justify-center">
            <p className="text-gray-400 text-sm">설정에서 영상 링크를 추가하세요</p>
          </div>
        </div>
      )}

      {/* Top alert */}
      <div className="relative z-10 mb-auto mt-8 px-5 py-2.5 bg-red-500/30 border border-red-400/40 rounded-full backdrop-blur-sm">
        <p className="text-red-300 text-sm font-medium animate-pulse">
          졸음이 감지되었어요 — 눈을 떠주세요!
        </p>
      </div>

      {/* Center message */}
      <div className="relative z-10 text-center mb-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-white/70" />
          <p className="text-white/70 text-sm">이안 · 지금 바로 일어나</p>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">이안이 깨우고 있어요</h1>
        <p className="text-white/60 text-sm max-w-xs leading-relaxed">
          눈을 뜨고 화면을 확인하면<br />자동으로 감지 되고 되돌아갑니다
        </p>
      </div>

      {/* Dismiss button */}
      <div className="relative z-10 mb-10">
        <button
          onClick={dismissWakeup}
          className="flex items-center gap-2 px-7 py-3 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-full border border-white/25 backdrop-blur-sm transition-colors"
        >
          <Moon className="w-4 h-4" />
          잠시 · 깊은 취침
        </button>
      </div>
    </div>
  );
}
