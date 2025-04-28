interface DeviceOrientationEvent {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

interface DeviceMotionEvent {
  acceleration: DeviceMotionEventAcceleration | null;
  accelerationIncludingGravity: DeviceMotionEventAcceleration | null;
  rotationRate: DeviceMotionEventRotationRate | null;
  interval: number;
}

interface DeviceMotionEventAcceleration {
  x: number | null;
  y: number | null;
  z: number | null;
}

interface DeviceMotionEventRotationRate {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

interface DeviceOrientationEventStatic {
  requestPermission?: () => Promise<"granted" | "denied">;
}

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<"granted" | "denied">;
}

declare const DeviceOrientationEvent: DeviceOrientationEventStatic;
declare const DeviceMotionEvent: DeviceMotionEventStatic;
