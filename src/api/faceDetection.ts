export interface FaceDetectionResult {
  eyesOpen: boolean;
  confidence: number;
  landmarks?: { x: number; y: number }[];
}

export type DetectionCallback = (result: FaceDetectionResult) => void;

let videoElement: HTMLVideoElement | null = null;
let animationFrameId: number | null = null;
let callbacks: DetectionCallback[] = [];

export async function initCamera(cameraId = 'default'): Promise<HTMLVideoElement> {
  const constraints: MediaStreamConstraints = {
    video: cameraId === 'default'
      ? { width: 640, height: 480, facingMode: 'user' }
      : { deviceId: { exact: cameraId }, width: 640, height: 480 },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  await new Promise<void>((resolve) => {
    videoElement!.onloadedmetadata = () => resolve();
  });
  return videoElement;
}

export function startDetection(onResult: DetectionCallback): void {
  callbacks.push(onResult);
  if (animationFrameId !== null) return;
  runDetectionLoop();
}

export function stopDetection(onResult?: DetectionCallback): void {
  if (onResult) {
    callbacks = callbacks.filter((cb) => cb !== onResult);
  } else {
    callbacks = [];
  }
  if (callbacks.length === 0 && animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function releaseCamera(): void {
  stopDetection();
  if (videoElement?.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
  }
  videoElement = null;
}

export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}

function runDetectionLoop(): void {
  // Stub: replace with TensorFlow.js / MediaPipe face mesh in production
  const mockDetect = () => {
    const result: FaceDetectionResult = {
      eyesOpen: Math.random() > 0.05,
      confidence: 0.9 + Math.random() * 0.1,
    };
    callbacks.forEach((cb) => cb(result));
    animationFrameId = requestAnimationFrame(mockDetect);
  };
  animationFrameId = requestAnimationFrame(mockDetect);
}
