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
      webkitCompassHeading?: number;
    };
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
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const requestPermission = async () => {
    if (!window.DeviceOrientationEvent?.requestPermission) {
      setError("このデバイスではセンサーの使用許可を要求できません");
      return;
    }

    setIsRequestingPermission(true);
    try {
      const permission = await window.DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        setPermissionDenied(false);
        setPermissionGranted(true);
        window.addEventListener("deviceorientation", handleOrientation);
      } else {
        setPermissionDenied(true);
        setError("センサーの使用が許可されませんでした");
      }
    } catch (err) {
      setPermissionDenied(true);
      setError("センサーの使用許可を要求できませんでした");
      console.error(err);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  useEffect(() => {
    // iOSデバイスの場合、ユーザーのジェスチャーが必要
    if (window.DeviceOrientationEvent?.requestPermission) {
      return;
    }

    // その他のデバイスの場合、直接イベントリスナーを設定
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
      setPermissionGranted(true);
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
      if ("webkitCompassHeading" in event && typeof event.webkitCompassHeading === "number") {
        const webkitHeading = event.webkitCompassHeading;
        setWebkitHeading(webkitHeading);
        // 時計回りに増加する値を反時計回りに変換
        setHeading(360 - webkitHeading);
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

  if (window.DeviceOrientationEvent?.requestPermission && !permissionGranted) {
    return (
      <div className="compass-container">
        {permissionDenied ? (
          <div className="permission-denied">
            <p>センサーの使用が許可されませんでした</p>
            <ol>
              <li>Safariの設定で「モーションと方向のアクセス」を有効にしてください</li>
              <li>ページを再読み込みしてください</li>
              <li>再度許可を要求してください</li>
            </ol>
            <div className="button-group">
              <button className="permission-button" onClick={handleReload}>
                ページを再読み込み
              </button>
              <button
                className="permission-button"
                onClick={requestPermission}
                disabled={isRequestingPermission}
              >
                再度許可を要求
              </button>
            </div>
          </div>
        ) : (
          <div className="permission-request">
            <p>コンパスを使用するにはセンサーの使用許可が必要です</p>
            <button
              className="permission-button"
              onClick={requestPermission}
              disabled={isRequestingPermission}
            >
              {isRequestingPermission ? "許可を要求中..." : "許可を要求"}
            </button>
            <div className="ios-instructions">
              <p>iOSデバイスの場合：</p>
              <ol>
                <li>「許可を要求」ボタンをタップしてください</li>
                <li>表示されるダイアログで「許可」を選択してください</li>
                <li>デバイスを水平に保ってください</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="compass-container">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="compass-info">
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
