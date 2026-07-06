import { Radio } from 'lucide-react';
import type { FaceDetectionResult } from '@/api/faceDetection';

interface CameraViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReady: boolean;
  result: FaceDetectionResult | null;
  closedDuration: number;
}

export function CameraView({ containerRef, isReady, result, closedDuration }: CameraViewProps) {
  const eyesOpen = result ? !result.isClosed : null;
  const confidence = result ? result.confidence : null;
  const hasLandmarks = result?.hasLandmarks ?? false;
  const confidencePct = confidence !== null ? Math.round(confidence * 1000) / 10 : null;

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
      {/* Camera feed */}
      <div
        ref={containerRef}
        className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
      />

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">카메라 연결 중...</p>
        </div>
      )}

      {/* Face tracking brackets */}
      {isReady && hasLandmarks && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-44 h-28">
            <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-green-400" />
            <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400" />
            <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400" />
            <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-green-400" />
            {/* Eye indicators */}
            <div className="absolute top-1/3 left-4 right-4 flex justify-between">
              <div className={`w-8 h-1.5 rounded-full ${
                eyesOpen ? 'bg-green-400/60' : 'bg-amber-400/80'
              } transition-colors`} />
              <div className={`w-8 h-1.5 rounded-full ${
                eyesOpen ? 'bg-green-400/60' : 'bg-amber-400/80'
              } transition-colors`} />
            </div>
          </div>
        </div>
      )}

      {/* Top-left: LIVE badge */}
      {isReady && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Radio className="w-3 h-3 text-red-400 animate-pulse" />
          <span className="text-white text-xs font-medium">LIVE · 전면 카메라</span>
        </div>
      )}

      {/* Top-right: eye detection badge */}
      {isReady && (
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          eyesOpen === false
            ? 'bg-amber-500/90 text-white'
            : 'bg-green-500/90 text-white'
        }`}>
          <span>👁</span>
          <span>눈 감지: {eyesOpen === false ? '감힘' : '뜸'}</span>
          {eyesOpen === false && closedDuration > 0 && (
            <span className="font-bold">{closedDuration.toFixed(1)}s</span>
          )}
        </div>
      )}

      {/* Bottom status bar */}
      {isReady && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              eyesOpen === false ? 'bg-amber-500/80' : 'bg-blue-500/80'
            }`}>
              <span className="text-white text-[10px]">👁</span>
            </div>
            <div>
              <p className="text-white text-xs font-medium">
                {eyesOpen === false ? '눈 감음 감지' : '집중 상태 양호'}
              </p>
              <p className="text-white/60 text-[10px]">
                {hasLandmarks ? '눈 개폐 · 시선 추적 정상' : '얼굴 인식 대기 중'}
              </p>
            </div>
          </div>
          {confidencePct !== null && (
            <div className="text-right">
              <p className="text-white/60 text-[10px]">신뢰도</p>
              <p className="text-green-400 text-sm font-bold">{confidencePct.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
