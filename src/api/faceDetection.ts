import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

// MediaPipe eye landmark indices (동일 인덱스 사용: drowsiness-detector와 동일)
const LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144];
const EYE_CROP_PAD = 20;
const EYE_STATUS_PROXY = '/api/eye-status';
const HEALTH_PROXY = '/api/eye-health';

export interface FaceDetectionResult {
  isClosed: boolean;
  avgClosedProb: number;
  leftClosedProb: number;
  rightClosedProb: number;
  confidence: number;
  hasLandmarks: boolean;
}

export type DetectionCallback = (result: FaceDetectionResult) => void;

let landmarker: FaceLandmarker | null = null;
let videoElement: HTMLVideoElement | null = null;
let animFrameId: number | null = null;
const callbacks = new Set<DetectionCallback>();
let frameCount = 0;
const INFER_EVERY_N = 3;

// ─── API Health Check ────────────────────────────────────────────────────────

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_PROXY, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── MediaPipe 초기화 ─────────────────────────────────────────────────────────

async function initLandmarker() {
  if (landmarker) return;
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    },
    numFaces: 1,
    runningMode: 'VIDEO',
  });
}

// ─── 카메라 초기화 ────────────────────────────────────────────────────────────

export async function initCamera(deviceId = 'default'): Promise<HTMLVideoElement> {
  const constraints: MediaStreamConstraints = {
    video:
      deviceId === 'default'
        ? { width: 640, height: 480, facingMode: 'user' }
        : { deviceId: { exact: deviceId }, width: 640, height: 480 },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  videoElement.muted = true;
  await new Promise<void>((resolve) => {
    videoElement!.onloadedmetadata = () => resolve();
  });
  await initLandmarker();
  return videoElement;
}

// ─── 눈 영역 크롭 ─────────────────────────────────────────────────────────────

async function cropEyeBlob(
  canvas: OffscreenCanvas,
  landmarks: { x: number; y: number }[],
  indices: number[]
): Promise<Blob | null> {
  const w = canvas.width;
  const h = canvas.height;
  const pts = indices.map((i) => ({
    x: Math.round(landmarks[i].x * w),
    y: Math.round(landmarks[i].y * h),
  }));
  const x0 = Math.max(0, Math.min(...pts.map((p) => p.x)) - EYE_CROP_PAD);
  const x1 = Math.min(w, Math.max(...pts.map((p) => p.x)) + EYE_CROP_PAD);
  const y0 = Math.max(0, Math.min(...pts.map((p) => p.y)) - EYE_CROP_PAD);
  const y1 = Math.min(h, Math.max(...pts.map((p) => p.y)) + EYE_CROP_PAD);
  if (x1 <= x0 || y1 <= y0) return null;

  const cropW = x1 - x0;
  const cropH = y1 - y0;
  const cropCanvas = new OffscreenCanvas(cropW, cropH);
  const ctx = cropCanvas.getContext('2d')!;
  ctx.drawImage(canvas, x0, y0, cropW, cropH, 0, 0, cropW, cropH);
  return cropCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
}

// ─── eye-status-api 호출 ──────────────────────────────────────────────────────

async function queryEyeStatus(
  leftBlob: Blob,
  rightBlob: Blob
): Promise<FaceDetectionResult> {
  const form = new FormData();
  form.append('left_eye', leftBlob, 'left.jpg');
  form.append('right_eye', rightBlob, 'right.jpg');

  const res = await fetch(EYE_STATUS_PROXY, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`eye-status-api error: ${res.status}`);
  const data = await res.json();
  return {
    isClosed: data.is_closed as boolean,
    avgClosedProb: data.avg_closed_prob as number,
    leftClosedProb: data.left_closed_prob as number,
    rightClosedProb: data.right_closed_prob as number,
    confidence: 1 - (data.avg_closed_prob as number),
    hasLandmarks: true,
  };
}

// ─── 감지 루프 ────────────────────────────────────────────────────────────────

let pendingInference = false;
let lastResult: FaceDetectionResult = {
  isClosed: false,
  avgClosedProb: 0,
  leftClosedProb: 0,
  rightClosedProb: 0,
  confidence: 1,
  hasLandmarks: false,
};

function runLoop() {
  if (!videoElement || !landmarker || callbacks.size === 0) return;

  frameCount++;

  if (frameCount % INFER_EVERY_N === 0 && !pendingInference) {
    const canvas = new OffscreenCanvas(videoElement.videoWidth || 640, videoElement.videoHeight || 480);
    const ctx = canvas.getContext('2d');
    if (ctx && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0);
      const result: FaceLandmarkerResult = landmarker.detectForVideo(
        videoElement,
        performance.now()
      );

      if (result.faceLandmarks.length > 0) {
        const lm = result.faceLandmarks[0];
        pendingInference = true;
        Promise.all([
          cropEyeBlob(canvas, lm, LEFT_EYE_IDX),
          cropEyeBlob(canvas, lm, RIGHT_EYE_IDX),
        ])
          .then(([leftBlob, rightBlob]) => {
            if (!leftBlob || !rightBlob) return;
            return queryEyeStatus(leftBlob, rightBlob);
          })
          .then((res) => {
            if (res) {
              lastResult = res;
              callbacks.forEach((cb) => cb(res));
            }
          })
          .catch(() => {
            // API 오류 시 이전 결과 유지
          })
          .finally(() => {
            pendingInference = false;
          });
      } else {
        // 얼굴 미감지
        const noFace: FaceDetectionResult = { ...lastResult, hasLandmarks: false };
        callbacks.forEach((cb) => cb(noFace));
      }
    }
  }

  animFrameId = requestAnimationFrame(runLoop);
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export function startDetection(cb: DetectionCallback) {
  callbacks.add(cb);
  if (animFrameId === null) {
    animFrameId = requestAnimationFrame(runLoop);
  }
}

export function stopDetection(cb?: DetectionCallback) {
  if (cb) callbacks.delete(cb);
  else callbacks.clear();
  if (callbacks.size === 0 && animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

export function releaseCamera() {
  stopDetection();
  if (videoElement?.srcObject) {
    (videoElement.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
  }
  videoElement = null;
  frameCount = 0;
}

export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
