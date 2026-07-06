import { Brain, Eye, Radio } from 'lucide-react';
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
    <div className="relative w-full aspect-[16/10] bg-[#080d1d] rounded-[22px] overflow-hidden shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
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
          <div className="relative w-[220px] h-[224px]">
            <span className="absolute top-0 left-0 w-9 h-6 border-t-[3px] border-l-[3px] border-green-400" />
            <span className="absolute top-0 right-0 w-9 h-6 border-t-[3px] border-r-[3px] border-green-400" />
            <span className="absolute bottom-0 left-0 w-9 h-6 border-b-[3px] border-l-[3px] border-green-400" />
            <span className="absolute bottom-0 right-0 w-9 h-6 border-b-[3px] border-r-[3px] border-green-400" />
            {/* Eye indicators */}
            <div className="absolute top-[38%] left-10 right-10 flex justify-between">
              <div className={`w-12 h-1.5 rounded-full ${
                eyesOpen ? 'bg-green-400/60' : 'bg-amber-400/80'
              } transition-colors`} />
              <div className={`w-12 h-1.5 rounded-full ${
                eyesOpen ? 'bg-green-400/60' : 'bg-amber-400/80'
              } transition-colors`} />
            </div>
          </div>
        </div>
      )}

      {/* Top-left: LIVE badge */}
      {isReady && (
        <div className="absolute top-6 left-7 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse" />
          <span className="text-white text-xs font-bold">LIVE · 전면 카메라</span>
        </div>
      )}

      {/* Top-right: eye detection badge */}
      {isReady && (
        <div className={`absolute top-5 right-5 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
          eyesOpen === false
            ? 'bg-amber-500/90 text-white'
            : 'bg-green-500/90 text-white'
        }`}>
          <Eye className="w-3.5 h-3.5" />
          <span>눈 감지: {eyesOpen === false ? '감힘' : '뜸'}</span>
          {eyesOpen === false && closedDuration > 0 && (
            <span className="font-bold">{closedDuration.toFixed(1)}s</span>
          )}
        </div>
      )}

      {/* Bottom status bar */}
      {isReady && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080d1d] via-[#080d1d]/80 to-transparent px-8 py-7 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              eyesOpen === false ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">
                {eyesOpen === false ? '눈 감음 감지' : '집중 상태 양호'}
              </p>
              <p className="text-white/55 text-xs">
                {hasLandmarks ? '눈 개폐 · 시선 추적 정상' : '얼굴 인식 대기 중'}
              </p>
            </div>
          </div>
          {confidencePct !== null && (
            <div className="text-right">
              <p className="text-white/55 text-xs">신뢰도</p>
              <p className="text-green-400 text-lg font-bold">{confidencePct.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
