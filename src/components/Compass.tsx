import { useState, useEffect } from "react";
import "./Compass.css";

// グローバルな型定義を拡張
declare global {
  interface Window {
    MSStream?: unknown;
    DeviceMotionEvent: {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    DeviceOrientationEvent: {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
  }
}

const Compass = () => {
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    } else {
      setError("デバイスの方位センサーが利用できません");
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      // alpha値は0度が北を指し、時計回りに増加
      setHeading(event.alpha);
    }
  };

  return (
    <div className="compass-container">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="compass-info">
            <p>赤い矢印：現在の向き</p>
            <p>N, E, S, W：方角</p>
          </div>
          <div className="compass" style={{ transform: `rotate(${heading}deg)` }}>
            <div className="compass-arrow">↑</div>
            <div className="compass-directions">
              <span className="north">N</span>
              <span className="east">E</span>
              <span className="south">S</span>
              <span className="west">W</span>
            </div>
          </div>
          <div className="heading-text">方位: {Math.round(heading)}°</div>
        </>
      )}
    </div>
  );
};

export default Compass;
