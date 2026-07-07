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
let intervalId: ReturnType<typeof setInterval> | null = null;
const callbacks = new Set<DetectionCallback>();
let frameCount = 0;
const INFER_EVERY_N = 3;
type DetectionCanvas = HTMLCanvasElement | OffscreenCanvas;
let landmarkerPromise: Promise<void> | null = null;

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
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = loadLandmarker().catch((error) => {
    landmarkerPromise = null;
    throw error;
  });

  return landmarkerPromise;
}

async function loadLandmarker() {
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
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저에서는 카메라 접근을 지원하지 않습니다.');
  }

  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    throw new Error('카메라는 HTTPS 환경에서만 사용할 수 있습니다.');
  }

  releaseCamera();

  const constraints: MediaStreamConstraints = {
    video:
      deviceId === 'default'
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        : { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;

    await new Promise<void>((resolve, reject) => {
      if (!videoElement) return reject(new Error('카메라 영상을 초기화하지 못했습니다.'));
      videoElement.onloadedmetadata = () => resolve();
      videoElement.onerror = () => reject(new Error('카메라 영상을 불러오지 못했습니다.'));
    });

    await videoElement.play();
    initLandmarker().catch((error) => {
      console.warn('[WakeLens] 얼굴 인식 모델을 불러오지 못했습니다.', error);
    });
    return videoElement;
  } catch (error) {
    releaseCamera();
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('카메라 권한이 거부되었습니다. 브라우저 권한 설정을 확인해 주세요.');
      }
      if (error.name === 'NotFoundError') {
        throw new Error('사용 가능한 카메라를 찾지 못했습니다.');
      }
      if (error.name === 'NotReadableError') {
        throw new Error('다른 앱이 카메라를 사용 중입니다.');
      }
    }
    throw error instanceof Error ? error : new Error('카메라를 시작하지 못했습니다.');
  }
}

// ─── 눈 영역 크롭 ─────────────────────────────────────────────────────────────

async function cropEyeBlob(
  canvas: DetectionCanvas,
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
  const cropCanvas = createCanvas(cropW, cropH);
  const ctx = cropCanvas.getContext('2d')!;
  ctx.drawImage(canvas, x0, y0, cropW, cropH, 0, 0, cropW, cropH);
  return canvasToBlob(cropCanvas, 'image/jpeg', 0.85);
}

function createCanvas(width: number, height: number): DetectionCanvas {
  if ('OffscreenCanvas' in window) {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasToBlob(canvas: DetectionCanvas, type: string, quality: number): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type, quality });
  }

  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob((blob: Blob | null) => {
      if (blob) resolve(blob);
      else reject(new Error('눈 영역 이미지를 생성하지 못했습니다.'));
    }, type, quality);
  });
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

// rAF 대신 setInterval을 사용해 백그라운드 탭에서도 루프가 유지되도록 함
// (rAF는 탭이 비활성화되면 브라우저가 실행을 완전히 멈춤)
const LOOP_INTERVAL_MS = 100; // 10fps 기준, INFER_EVERY_N=3이면 실질 추론은 ~3fps

function runLoop() {
  if (!videoElement || callbacks.size === 0) return;
  if (!landmarker) return;

  frameCount++;

  if (frameCount % INFER_EVERY_N === 0 && !pendingInference) {
    const canvas = createCanvas(videoElement.videoWidth || 640, videoElement.videoHeight || 480);
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
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export function startDetection(cb: DetectionCallback) {
  callbacks.add(cb);
  if (intervalId === null) {
    intervalId = setInterval(runLoop, LOOP_INTERVAL_MS);
  }
}

export function stopDetection(cb?: DetectionCallback) {
  if (cb) callbacks.delete(cb);
  else callbacks.clear();
  if (callbacks.size === 0 && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
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
