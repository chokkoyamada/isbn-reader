import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { performOCR } from "@/lib/ocr";

const defaultVideoConstraints = {
  width: 720,
  height: 360,
  facingMode: "user" as "user" | "environment",
};

interface CameraCaptureProps {
  onCapture?: (file: File) => void;
  onClose?: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoConstraints = {
    ...defaultVideoConstraints,
    facingMode,
  };

  // dataURLをFileに変換するユーティリティ
  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const [ocrText, setOcrText] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string>("");

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      setOcrText("");
      setOcrError("");
      setOcrLoading(true);
      try {
        const file = dataURLtoFile(imageSrc, "capture.jpg");
        const ocrResult = await performOCR(file);
        setOcrText(ocrResult.text);
        if (onCapture) onCapture(file); // 必要なら親にFileを返す
      } catch (err) {
        setOcrError("OCR処理に失敗しました");
      } finally {
        setOcrLoading(false);
      }
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">📷 カメラで撮影</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="✕"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {!isCaptureEnable && (
            <button
              onClick={() => setCaptureEnable(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              開始
            </button>
          )}
          {isCaptureEnable && (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setCaptureEnable(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  終了
                </button>
                <button
                  onClick={() =>
                    setFacingMode(
                      facingMode === "user" ? "environment" : "user"
                    )
                  }
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg"
                >
                  カメラ切替（{facingMode === "user" ? "背面" : "前面"}）
                </button>
              </div>
              <div>
                <Webcam
                  audio={false}
                  width={540}
                  height={360}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="rounded-lg border"
                  key={facingMode} // 切替時に再マウント
                />
              </div>
              <button
                onClick={capture}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg mt-2"
              >
                キャプチャ
              </button>
            </>
          )}
          {url && (
            <>
              <div>
                <button
                  onClick={() => {
                    setUrl(null);
                    setOcrText("");
                    setOcrError("");
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  削除
                </button>
              </div>
              <div>
                <img
                  src={url}
                  alt="Screenshot"
                  className="w-full rounded-lg border"
                />
              </div>
              <div className="mt-2">
                {ocrLoading && (
                  <div className="text-gray-500">OCR処理中...</div>
                )}
                {ocrError && <div className="text-red-600">{ocrError}</div>}
                {ocrText && (
                  <textarea
                    className="w-full border rounded p-2 text-sm mt-2"
                    rows={4}
                    value={ocrText}
                    readOnly
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
