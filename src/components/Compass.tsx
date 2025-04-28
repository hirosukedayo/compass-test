import { useState, useEffect } from "react";
import "./Compass.css";

// グローバルな型定義を拡張
declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading: number | null;
  }
}

const Compass = () => {
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [tilt, setTilt] = useState<string>("");
  const [gamma, setGamma] = useState<number>(0);
  const [beta, setBeta] = useState<number>(0);
  const [alpha, setAlpha] = useState<number>(0);
  const [webkitHeading, setWebkitHeading] = useState<number>(0);

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
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      // デバイスの傾きを計算（度）
      const beta = event.beta; // 前後の傾き
      const gamma = event.gamma; // 左右の傾き
      const alpha = event.alpha; // 方位角

      setBeta(beta);
      setGamma(gamma);
      setAlpha(alpha);

      // iOSデバイスの場合、webkitCompassHeadingを使用
      if ("webkitCompassHeading" in event && event.webkitCompassHeading !== null) {
        const webkitHeading = event.webkitCompassHeading;
        setWebkitHeading(webkitHeading);
        setHeading(webkitHeading);
      } else {
        // その他のデバイスの場合、gammaを考慮した方位角の計算
        const gammaRad = (gamma * Math.PI) / 180; // ラジアンに変換
        const alphaRad = (alpha * Math.PI) / 180; // ラジアンに変換

        const correctedHeading =
          Math.atan2(Math.sin(alphaRad) * Math.cos(gammaRad), Math.cos(alphaRad)) * (180 / Math.PI);

        const normalizedHeading = (correctedHeading + 360) % 360;
        setHeading(normalizedHeading);
      }

      // 傾きが大きすぎる場合は警告を表示
      if (Math.abs(beta) > 30 || Math.abs(gamma) > 30) {
        setTilt("デバイスを水平に保ってください");
      } else {
        setTilt("");
      }
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
            {tilt && <p className="tilt-warning">{tilt}</p>}
            <p>方位角（alpha）: {Math.round(alpha)}°</p>
            <p>前後の傾き（beta）: {Math.round(beta)}°</p>
            <p>左右の傾き（gamma）: {Math.round(gamma)}°</p>
            {"webkitCompassHeading" in window.DeviceOrientationEvent && (
              <p>iOS方位角（webkit）: {Math.round(webkitHeading)}°</p>
            )}
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
