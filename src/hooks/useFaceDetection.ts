import { useEffect, useRef, useState, useCallback } from 'react';
import { initCamera, startDetection, stopDetection, releaseCamera, checkApiHealth } from '@/api/faceDetection';
import type { FaceDetectionResult } from '@/api/faceDetection';
import { useStore } from '@/store/useStore';

interface UseFaceDetectionOptions {
  enabled: boolean;
  onDrowsiness?: () => void;
  onTabHidden?: () => void; // 탭이 백그라운드로 가면 호출 (선택)
}

export function useFaceDetection({ enabled, onDrowsiness, onTabHidden }: UseFaceDetectionOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closedStartRef = useRef<number | null>(null);
  const openStreakRef = useRef(0);
  const OPEN_FORGIVENESS = 6;

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FaceDetectionResult | null>(null);
  const [isTabHidden, setIsTabHidden] = useState(false);

  const settings = useStore((s) => s.settings);
  const recordDrowsiness = useStore((s) => s.recordDrowsiness);
  const triggerWakeup = useStore((s) => s.triggerWakeup);
  const setApiOnline = useStore((s) => s.setApiOnline);

  const threshold = settings.detection.eyeClosureThreshold * 1000;

  const handleResult = useCallback(
    (result: FaceDetectionResult) => {
      setLastResult(result);

      if (result.isClosed) {
        openStreakRef.current = 0;
        if (closedStartRef.current === null) {
          closedStartRef.current = Date.now();
        } else if (Date.now() - closedStartRef.current >= threshold) {
          const duration = (Date.now() - closedStartRef.current) / 1000;
          recordDrowsiness({
            timestamp: new Date(),
            duration,
            type: duration > 3 ? 'asleep' : 'drowsy',
          });
          triggerWakeup();
          onDrowsiness?.();
          closedStartRef.current = null;
        }
      } else {
        openStreakRef.current += 1;
        if (openStreakRef.current >= OPEN_FORGIVENESS) {
          closedStartRef.current = null;
        }
      }
    },
    [threshold, recordDrowsiness, triggerWakeup, onDrowsiness]
  );

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    setError(null);

    // API 헬스 체크
    checkApiHealth().then((ok) => {
      if (mounted) setApiOnline(ok);
      if (!ok) console.warn('[WakeLens] eye-status-api 미연결. 감지 기능이 제한됩니다.');
    });

    initCamera(settings.detection.cameraId)
      .then((video) => {
        if (!mounted) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          video.style.transform = 'scaleX(-1)';
          containerRef.current.appendChild(video);
        }
        setIsReady(true);
        startDetection(handleResult);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      });

    // 탭 전환 감지 - 감지 루프는 setInterval로 계속 돌지만,
    // 사용자에게 "탭 이탈 = 감지 신뢰도 저하" 상태임을 알려줌
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
        onTabHidden?.();
      } else {
        setIsTabHidden(false);
        // 탭 복귀 시 눈 감김 타이머 리셋 (이탈 중 누적된 시간 무효화)
        closedStartRef.current = null;
        openStreakRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopDetection(handleResult);
      releaseCamera();
      setIsReady(false);
      setIsTabHidden(false);
    };
  }, [enabled, settings.detection.cameraId, handleResult, setApiOnline, onTabHidden]);

  const closedDuration =
    lastResult?.isClosed && closedStartRef.current !== null
      ? (Date.now() - closedStartRef.current) / 1000
      : 0;

  return { containerRef, isReady, error, lastResult, closedDuration, isTabHidden };
}
