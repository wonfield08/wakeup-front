import { Radio } from 'lucide-react';

interface CameraViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReady: boolean;
  eyesOpen: boolean | null;
}

export function CameraView({ containerRef, isReady, eyesOpen }: CameraViewProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
      {/* Camera feed container */}
      <div
        ref={containerRef}
        className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:scale-x-[-1]"
      />

      {/* Overlay when not ready */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">카메라 연결 중...</p>
        </div>
      )}

      {/* Face tracking overlay */}
      {isReady && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-20">
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400 rounded-tl" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400 rounded-tr" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400 rounded-bl" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400 rounded-br" />
            {/* Eye indicators */}
            <div className="absolute top-6 left-4 right-4 flex justify-between">
              <div className={`w-6 h-2 rounded-full border ${eyesOpen ? 'border-green-400' : 'border-amber-400 bg-amber-400/20'}`} />
              <div className={`w-6 h-2 rounded-full border ${eyesOpen ? 'border-green-400' : 'border-amber-400 bg-amber-400/20'}`} />
            </div>
          </div>
        </div>
      )}

      {/* LIVE badge */}
      {isReady && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
          <Radio className="w-3 h-3 text-red-400 animate-pulse" />
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
      )}

      {/* Eye status badge */}
      {isReady && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-center">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            eyesOpen
              ? 'bg-green-900/70 text-green-300'
              : 'bg-amber-900/70 text-amber-300 animate-pulse'
          }`}>
            {eyesOpen ? '눈 감지 · 집중 상태' : '눈 감음 감지 중...'}
          </div>
        </div>
      )}
    </div>
  );
}
