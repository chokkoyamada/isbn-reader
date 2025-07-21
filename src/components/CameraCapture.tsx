import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { performOCR, extractISBNFromText } from "@/lib/ocr";

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

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
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
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
        
        // OCR処理
        const ocrResult = await performOCR(file);
        setOcrText(ocrResult.text);
        
        // ISBN抽出を試行
        const isbnResult = extractISBNFromText(ocrResult.text);
        if (isbnResult.isValid && isbnResult.isbn) {
          // ISBNが見つかった場合、自動的に親コンポーネントに通知
          if (onCapture) {
            onCapture(file);
            // ISBNが見つかったのでモーダルを閉じる
            if (onClose) onClose();
          }
        } else {
          // ISBNが見つからない場合はテキストを表示してユーザーに確認させる
          setOcrError("ISBNが見つかりませんでした。画像をもう一度撮影してください。");
        }
      } catch (err) {
        setOcrError("OCR処理に失敗しました。もう一度お試しください。");
      } finally {
        setOcrLoading(false);
      }
    }
  }, [webcamRef, onCapture, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📷 ISBN撮影</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {!isCaptureEnable && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">
                  📱
                </div>
                <h4 className="text-lg font-semibold mb-2">本のISBNを撮影</h4>
                <p className="text-sm text-gray-600 mb-4">
                  本の裏表紙にあるISBNバーコードを<br />
                  カメラで撮影してください
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    💡 ISBNがはっきり見えるように撮影してください
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCaptureEnable(true)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-colors"
              >
                📷 カメラを起動
              </button>
            </div>
          )}
          {isCaptureEnable && (
            <>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setCaptureEnable(false)}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  📴 停止
                </button>
                <button
                  onClick={() =>
                    setFacingMode(
                      facingMode === "user" ? "environment" : "user"
                    )
                  }
                  className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                >
                  {facingMode === "user" ? "📷 背面" : "🤳 前面"}
                </button>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full max-w-full aspect-[4/3] bg-black rounded-lg border overflow-hidden mb-3">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                  />
                  {/* フォーカスガイド */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white border-dashed rounded-lg w-3/4 h-1/2 opacity-50"></div>
                  </div>
                  {/* カメラ情報 */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {facingMode === "user" ? "前面カメラ" : "背面カメラ"}
                  </div>
                </div>
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600">
                    ISBNコードを枠内に合わせて撮影してください
                  </p>
                </div>
                <button
                  onClick={capture}
                  disabled={ocrLoading}
                  className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium shadow-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {ocrLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>処理中...</span>
                    </>
                  ) : (
                    <>
                      <span>📸</span>
                      <span>撮影する</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          {url && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">撮影結果</h4>
                <div className="relative inline-block">
                  <img
                    src={url}
                    alt="撮影された画像"
                    className="rounded-lg border max-w-full max-h-48 object-contain"
                  />
                </div>
              </div>
              
              {ocrLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-blue-700 text-sm">ISBN を読み取り中...</p>
                </div>
              )}
              
              {ocrError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-500 flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-red-700 text-sm font-medium">読み取りに失敗しました</p>
                      <p className="text-red-600 text-xs mt-1">{ocrError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {ocrText && !ocrLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">読み取ったテキスト:</h5>
                  <div className="text-xs text-gray-600 bg-white rounded border p-2 max-h-32 overflow-y-auto">
                    {ocrText}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setUrl(null);
                    setOcrText("");
                    setOcrError("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  🗑️ 削除
                </button>
                <button
                  onClick={capture}
                  disabled={ocrLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm transition-colors"
                >
                  📸 再撮影
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
