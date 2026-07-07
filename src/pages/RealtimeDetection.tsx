import { Play, Square } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { CameraView } from '@/components/detection/CameraView';
import { SessionPanel } from '@/components/detection/SessionPanel';
import { DetectionCards } from '@/components/detection/DetectionCards';
import { getPostposition } from '@/utils/korean';

export function RealtimeDetection() {
  const session = useStore((s) => s.session);
  const startSession = useStore((s) => s.startSession);
  const stopSession = useStore((s) => s.stopSession);
  const wakeupCharacterName = useStore((s) => s.wakeupCharacterName);

  const { containerRef, isReady, error, lastResult, closedDuration } = useFaceDetection({
    enabled: session.isActive,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between h-[59px] px-8 border-b border-gray-200 bg-white/70">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">실시간 집중 감지</h1>
          <p className="text-xs text-gray-400">
            {wakeupCharacterName}{getPostposition(wakeupCharacterName, '이/가')} 졸음을 감지하면 바로 깨워드려요
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.isActive && (
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-medium">감지 작동 중</span>
            </div>
          )}
          <button
            onClick={session.isActive ? stopSession : startSession}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              session.isActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {session.isActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                종료
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                감지 시작
              </>
            )}
          </button>
        </div>
      </div>

      {/* API / camera error */}
      {error && (
        <div className="mx-8 mt-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          카메라 오류: {error}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-[minmax(560px,1fr)_400px] gap-5 px-8 py-7">
        <div className="flex flex-col gap-4 min-w-0">
          <CameraView
            containerRef={containerRef}
            isReady={isReady}
            result={lastResult}
            closedDuration={closedDuration}
          />
          <DetectionCards />
        </div>
        <SessionPanel />
      </div>
    </div>
  );
}
