import { useState, useEffect } from 'react';
import { Check, Play, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTimer } from '@/hooks/useTimer';
import { parseYouTubeUrl, fetchVideoInfo } from '@/api/youtube';
import type { YouTubeVideoInfo } from '@/api/youtube';

export function SessionPanel() {
  const session = useStore((s) => s.session);
  const wakeupVideoUrl = useStore((s) => s.wakeupVideoUrl);
  const setWakeupVideoUrl = useStore((s) => s.setWakeupVideoUrl);

  const { elapsed } = useTimer(session.isActive);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  const { blinkCount, avgBlinkDuration } = session.currentStats;

  const [urlInput, setUrlInput] = useState(wakeupVideoUrl);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [urlError, setUrlError] = useState(false);
  const [loading, setLoading] = useState(false);

  // 저장된 URL이 있으면 초기 로드
  useEffect(() => {
    if (wakeupVideoUrl) {
      const id = parseYouTubeUrl(wakeupVideoUrl);
      if (id) {
        setLoading(true);
        fetchVideoInfo(id)
          .then((info) => setVideoInfo(info))
          .finally(() => setLoading(false));
      }
    }
  }, [wakeupVideoUrl]);

  const handleConfirmUrl = async () => {
    const id = parseYouTubeUrl(urlInput);
    if (!id) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    setLoading(true);
    const info = await fetchVideoInfo(id);
    setVideoInfo(info);
    setWakeupVideoUrl(urlInput.trim());
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirmUrl();
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Session card */}
      <div className="bg-white rounded-[22px] p-5 border border-gray-100 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-gray-800">현재 세션</p>
          {session.isActive && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 font-semibold">진행 중</span>
            </div>
          )}
        </div>

        {/* Timer */}
        <p className="text-xs text-gray-400 mb-1">연속 집중 시간</p>
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-[42px] leading-none font-bold text-gray-900 tabular-nums">{minutes}:{secs}</span>
          <span className="text-xl font-semibold text-gray-400">:{String(elapsed % 60 % 10)}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400">오늘 졸음</p>
            <p className="text-2xl font-bold text-gray-800">{blinkCount}<span className="text-sm font-normal text-gray-400 ml-0.5">회</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400">평균 반응</p>
            <p className="text-2xl font-bold text-gray-800">{avgBlinkDuration.toFixed(1)}<span className="text-sm font-normal text-gray-400 ml-0.5">초</span></p>
          </div>
        </div>
      </div>

      {/* Wakeup video card */}
      <div className="bg-white rounded-[22px] p-5 border border-gray-100 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-800">깨우기 영상</p>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-600 font-semibold">졸음 감지 시</span>
          </div>
        </div>

        {/* URL input */}
        <div className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 mb-5 ${
          urlError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        } focus-within:border-blue-400 transition-colors`}>
          <div className="w-5 h-5 rounded flex items-center justify-center bg-red-600 shrink-0">
            <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setUrlError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="youtube.com/shorts/..."
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-300 min-w-0"
          />
          <button
            onClick={handleConfirmUrl}
            disabled={loading}
            className="w-7 h-7 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors shrink-0"
          >
            <Check className="w-4 h-4 text-green-600" />
          </button>
        </div>

        {/* Video preview */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {videoInfo && !loading && (
          <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-14 h-20 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
              <img
                src={videoInfo.thumbnailUrl}
                alt={videoInfo.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                이안 · 응원 한마디
              </p>
              <p className="text-xs text-gray-400 truncate mt-1">{videoInfo.title}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Shorts</span>
              </div>
            </div>
          </div>
        )}

        {!videoInfo && !loading && (
          <p className="text-xs text-gray-400 text-center py-3">
            YouTube Shorts 링크를 입력하세요
          </p>
        )}

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          졸음이 감지되면 이 영상이 전체 화면으로 바로 재생됩니다.
        </p>
      </div>
    </div>
  );
}
