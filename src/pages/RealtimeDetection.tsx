import { Play, Square } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { CameraView } from '@/components/detection/CameraView';
import { StatsPanel } from '@/components/detection/StatsPanel';
import { DetectionCards } from '@/components/detection/DetectionCards';

export function RealtimeDetection() {
  const session = useStore((s) => s.session);
  const startSession = useStore((s) => s.startSession);
  const stopSession = useStore((s) => s.stopSession);

  const { containerRef, isReady, error, lastResult } = useFaceDetection({
    enabled: session.isActive,
  });

  const eyesOpen = lastResult?.eyesOpen ?? null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">실시간 집중 감지</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            AI가 눈 감음을 감지해 이안이 깨워주는 집중 모니터링
          </p>
        </div>
        <button
          onClick={session.isActive ? stopSession : startSession}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
            session.isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {session.isActive ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              감지 종료
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              감지 시작
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          카메라 오류: {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_240px] gap-4">
        <div className="flex flex-col gap-4">
          <CameraView containerRef={containerRef} isReady={isReady} eyesOpen={eyesOpen} />
          <DetectionCards />
        </div>
        <StatsPanel />
      </div>
    </div>
  );
}
