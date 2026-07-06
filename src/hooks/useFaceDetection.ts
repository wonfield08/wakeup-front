import { useEffect, useRef, useState, useCallback } from 'react';
import { initCamera, startDetection, stopDetection, releaseCamera } from '@/api/faceDetection';
import type { FaceDetectionResult } from '@/api/faceDetection';
import { useStore } from '@/store/useStore';

interface UseFaceDetectionOptions {
  enabled: boolean;
  onDrowsiness?: () => void;
}

export function useFaceDetection({ enabled, onDrowsiness }: UseFaceDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closedStartRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FaceDetectionResult | null>(null);

  const settings = useStore((s) => s.settings);
  const recordDrowsiness = useStore((s) => s.recordDrowsiness);
  const triggerWakeup = useStore((s) => s.triggerWakeup);

  const threshold = settings.detection.eyeClosureThreshold * 1000;

  const handleResult = useCallback(
    (result: FaceDetectionResult) => {
      setLastResult(result);

      if (!result.eyesOpen) {
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
        closedStartRef.current = null;
      }
    },
    [threshold, recordDrowsiness, triggerWakeup, onDrowsiness]
  );

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    initCamera(settings.detection.cameraId)
      .then((video) => {
        if (!mounted) return;
        videoRef.current = video;
        if (containerRef.current) {
          containerRef.current.appendChild(video);
        }
        setIsReady(true);
        startDetection(handleResult);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
      stopDetection(handleResult);
      releaseCamera();
      setIsReady(false);
    };
  }, [enabled, settings.detection.cameraId]);

  return { containerRef, isReady, error, lastResult };
}
