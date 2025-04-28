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
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  useEffect(() => {
    // iOSデバイスの判定
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (window.DeviceOrientationEvent) {
      // 非iOSデバイスの場合、自動的に許可をリクエスト
      if (!isIOSDevice) {
        requestPermission();
      }
    } else {
      setError("デバイスの方位センサーが利用できません");
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    if (isRequestingPermission) return;
    setIsRequestingPermission(true);
    setError("");

    try {
      if (isIOS) {
        // iOSでは、まずdevicemotionの許可をリクエスト
        const motionEvent = window.DeviceMotionEvent;
        if (motionEvent && "requestPermission" in motionEvent) {
          try {
            const motionPermission = await motionEvent.requestPermission!();
            console.log("motionPermission", motionPermission);
            if (motionPermission !== "granted") {
              setError("モーションセンサーの使用が許可されていません");
              setPermissionDenied(true);
              setIsRequestingPermission(false);
              return;
            }
          } catch (err) {
            console.error("モーションセンサーの許可リクエストに失敗:", err);
            setError("モーションセンサーの許可リクエストに失敗しました");
            setPermissionDenied(true);
            setIsRequestingPermission(false);
            return;
          }
        }

        // 次にdeviceorientationの許可をリクエスト
        const orientationEvent = window.DeviceOrientationEvent;
        if (orientationEvent && "requestPermission" in orientationEvent) {
          try {
            const orientationPermission = await orientationEvent.requestPermission!();
            console.log("orientationPermission", orientationPermission);
            if (orientationPermission !== "granted") {
              setError("方位センサーの使用が許可されていません");
              setPermissionDenied(true);
              setIsRequestingPermission(false);
              return;
            }
          } catch (err) {
            console.error("方位センサーの許可リクエストに失敗:", err);
            setError("方位センサーの許可リクエストに失敗しました");
            setPermissionDenied(true);
            setIsRequestingPermission(false);
            return;
          }
        }
      }

      startCompass();
    } catch (err) {
      console.error("センサーの使用許可リクエストに失敗:", err);
      setError("センサーの使用許可リクエストに失敗しました");
      setPermissionDenied(true);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startCompass = () => {
    console.log("startCompass called");
    setIsPermissionGranted(true);
    setPermissionDenied(false);

    // イベントリスナーを設定
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      console.log("deviceorientation event listener added");
    } else {
      setError("デバイスの方位センサーが利用できません");
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    console.log("Orientation event received:", event);
    if (event.alpha !== null) {
      setHeading(event.alpha);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="compass-container">
      {error ? (
        <div className="error-message">
          {error}
          {isIOS && (
            <div className="ios-instructions">
              <p>iOSデバイスの場合：</p>
              <ol>
                <li>Safariブラウザを使用してください</li>
                <li>設定アプリを開き、Safariの設定を選択</li>
                <li>"モーションと方向のアクセス"をオンにしてください</li>
                <li>アプリを再読み込みしてください</li>
              </ol>
              {permissionDenied ? (
                <div className="permission-denied">
                  <p>許可が拒否されました。以下のいずれかの方法で再試行してください：</p>
                  <ol>
                    <li>ページを再読み込みする</li>
                    <li>Safariの設定で「モーションと方向のアクセス」をオンにする</li>
                    <li>Safariを再起動する</li>
                  </ol>
                  <div className="button-group">
                    <button onClick={handleReload} className="permission-button">
                      ページを再読み込み
                    </button>
                    <button
                      onClick={requestPermission}
                      className="permission-button"
                      disabled={isRequestingPermission}
                    >
                      {isRequestingPermission
                        ? "許可をリクエスト中..."
                        : "もう一度許可をリクエスト"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={requestPermission}
                  className="permission-button"
                  disabled={isRequestingPermission}
                >
                  {isRequestingPermission ? "許可をリクエスト中..." : "もう一度許可をリクエスト"}
                </button>
              )}
            </div>
          )}
        </div>
      ) : !isPermissionGranted ? (
        <div className="permission-request">
          <p>方位センサーを使用するには許可が必要です</p>
          <button
            onClick={requestPermission}
            className="permission-button"
            disabled={isRequestingPermission}
          >
            {isRequestingPermission ? "許可をリクエスト中..." : "方位センサーの使用を許可"}
          </button>
          {isIOS && (
            <p className="ios-note">※ iOSデバイスの場合、Safariブラウザでアクセスしてください</p>
          )}
        </div>
      ) : (
        <>
          <div className="compass" style={{ transform: `rotate(${-heading}deg)` }}>
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
