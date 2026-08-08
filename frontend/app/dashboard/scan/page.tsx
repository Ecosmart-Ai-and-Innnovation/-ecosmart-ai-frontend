"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Scan, Recycle, Lightbulb, Check, Camera, Upload, ArrowLeft } from "lucide-react";
import { wasteApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { fileToCompressedDataUrl } from "@/lib/image";
import type { WasteScanResult } from "@/lib/api";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStartedRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<WasteScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [currentFacing, setCurrentFacing] = useState<string>("environment");
  const [hydrated, setHydrated] = useState(false);

  // ── 1. ALL HOOKS EXECUTED FIRST ──

  useEffect(() => {
    setHydrated(true);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const processStoredImage = useCallback(async () => {
    const storedImage = localStorage.getItem("scannedImage");
    const source = localStorage.getItem("scanSource");
    if (storedImage && source === "upload") {
      localStorage.removeItem("scannedImage");
      localStorage.removeItem("scanSource");
      setCapturedImage(storedImage);
      setScanning(true);
      try {
        const data = await wasteApi.scan({ imageBase64: storedImage });
        setResult(data);
      } catch (err: any) {
        setError(err.message || "Failed to analyze waste.");
      } finally {
        setScanning(false);
      }
      return true;
    }
    return false;
  }, []);

  const processManualText = useCallback(async () => {
    const manualText = localStorage.getItem("manualWasteType");
    const source = localStorage.getItem("scanSource");
    if (manualText && source === "manual") {
      localStorage.removeItem("manualWasteType");
      localStorage.removeItem("scanSource");
      setScanning(true);
      try {
        const data = await wasteApi.scan({ text: manualText });
        setResult(data);
      } catch (err: any) {
        setError(err.message || "Failed to analyze waste.");
      } finally {
        setScanning(false);
      }
      return true;
    }
    return false;
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError("");

      if (isTouchDevice) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          streamRef.current = stream;
        } catch {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
          streamRef.current = stream;
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
      }

      // Assign stream to video if element already exists
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Camera access denied.");
    }
  }, [isTouchDevice]);

  useEffect(() => {
    // Defer camera start so the page renders immediately
    Promise.all([processStoredImage(), processManualText()]).then(([hadImage, hadText]) => {
      if (!hadImage && !hadText) {
        setTimeout(() => startCamera(), 100);
      }
    });

    return () => stopCamera();
  }, [processStoredImage, processManualText, startCamera, stopCamera]);

  // Assign stream to video element whenever it becomes available
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  });


  // ── 2. EARLY RETURN AFTER HOOKS ──
  
  // Don't render anything until hydrated to match server
  if (!hydrated) return null;


  // ── 3. COMPONENT FUNCTIONS ──

  const toggleCamera = async () => {
    stopCamera();
    setCurrentFacing((prev) => (prev === "environment" ? "user" : "environment"));
    setTimeout(() => startCamera(), 200);
  };

  const handleVideoPlaying = () => {
    setCameraReady(true);
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || scanning) return;

    // If camera isn't ready, wait briefly
    if (!cameraReady) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

    setCapturedImage(imageBase64);
    stopCamera();
    setScanning(true);
    setError("");

    try {
      const data = await wasteApi.scan({ imageBase64 });
      setResult(data);
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err.message || "Failed to analyze waste.");
      setCapturedImage(null);
      startCamera();
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Downscale before sending — raw phone photos can exceed the API's body limit //Ese's fix
    const imgData = await fileToCompressedDataUrl(file);
    setCapturedImage(imgData);
    stopCamera();
    setScanning(true);
    setError("");
    wasteApi
      .scan({ imageBase64: imgData })
      .then((data) => setResult(data))
      .catch((err: any) => {
        setError(err.message || "Failed to analyze waste.");
        setCapturedImage(null);
        startCamera();
      })
      .finally(() => setScanning(false));
  };

  const resetScan = () => {
    setResult(null);
    setCapturedImage(null);
    setScanning(false);
    setError("");
    setCameraReady(false);
    startCamera();
  };


  // ── 4. RENDER VIEWS ──

  // Scanning overlay
  if (scanning) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="absolute inset-0 h-full w-full object-contain opacity-50" />
        )}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-5 text-white">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#5d9d35] border-t-transparent" />
            <p className="text-lg font-semibold">Analyzing your waste...</p>
            <p className="text-sm text-white/60">AI is identifying the item</p>
          </div>
        </div>
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        {capturedImage && (
          <img src={capturedImage} alt="Scanned waste" className="absolute inset-0 h-full w-full object-contain opacity-20" />
        )}
        <div className="relative z-10 flex flex-1 flex-col justify-end">
          <div className="w-full animate-slide-up rounded-t-[32px] bg-white pb-8 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="flex items-start justify-between px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{result.wasteType}</h2>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${result.recyclable ? "bg-[#5d9d35]" : "bg-slate-400"}`}>
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="mt-2 inline-block rounded-full bg-[#edf5ee] px-3.5 py-1 text-sm font-medium capitalize text-[#2f7d32]">{result.category}</span>
                <span className={`ml-2 inline-block rounded-full px-3.5 py-1 text-sm font-medium ${result.recyclable ? "bg-[#e5f4e8] text-[#22b455]" : "bg-[#fee7e7] text-red-500"}`}>
                  {result.recyclable ? "Recyclable" : "Not Recyclable"}
                </span>
              </div>
            </div>
            {capturedImage && (
              <div className="mx-auto mt-4 w-3/4 overflow-hidden rounded-2xl">
                <img src={capturedImage} alt="Scanned item" className="h-auto w-full object-contain bg-slate-100" />
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 px-6">
              <div className="rounded-2xl bg-[#d8ecd8] px-4 py-3.5">
                <p className="text-xs font-medium text-[#246c3b]/70">Estimated Value</p>
                <p className="mt-1 text-xl font-bold text-[#1e6a35]">₦{result.estimatedValue.min} – ₦{result.estimatedValue.max}</p>
              </div>
              <div className="rounded-2xl bg-[#eef1f3] px-4 py-3.5">
                <p className="text-xs font-medium text-slate-500">Confidence</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{Math.round(result.confidence)}%</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-[#5d9d35]" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>
            <div className="mx-6 mt-3 flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <Recycle className="mt-0.5 h-5 w-5 shrink-0 text-[#5c9d35]" />
              <p className="text-sm leading-relaxed text-slate-600">{result.disposalGuidance}</p>
            </div>
            <div className="mx-6 mt-2 flex gap-3 rounded-2xl bg-[#dff0e2] p-4">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#1da1f2]" />
              <p className="text-sm leading-relaxed text-slate-600">{result.ecoTip}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 px-6">
              <button onClick={() => router.push(`/dashboard/recyclers?waste=${encodeURIComponent(result.wasteType)}`)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#5d9d35] py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(93,157,53,0.3)]">
                <Recycle className="h-5 w-5" /> Find Recycler
              </button>
              <button onClick={resetScan} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2f7d32] py-3.5 font-semibold text-[#5d9d35]">
                <Camera className="h-5 w-5" /> Scan Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error view
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-8">
        <p className="text-lg text-red-400">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(""); startCamera(); }} className="rounded-full bg-white px-6 py-3 font-semibold text-black">
            Retry Camera
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white">
            Upload Image
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>
    );
  }

  // ── MAIN CAMERA VIEW ──
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* Top bar */}
      <div className="z-20 flex items-center justify-between px-3 py-2">
        <button onClick={() => router.push("/dashboard")} className="text-white/70 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {isTouchDevice && (
            <button onClick={toggleCamera} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              Flip
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            Upload
          </button>
        </div>
      </div>

      {/* Camera area - larger */}
      <div className="relative aspect-[3/4] w-full max-w-xl mx-auto flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onPlaying={handleVideoPlaying}
          className="h-full w-full object-cover"
        />

        {/* Corner brackets only when camera is ready */}
        {cameraReady && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-4/5 w-5/6">
              <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-[3px] border-t-[3px] border-[#5d9d35]" />
              <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-[3px] border-t-[3px] border-[#5d9d35]" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-[#5d9d35]" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-[#5d9d35]" />
            </div>
          </div>
        )}

        {cameraReady && (
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/50">
            Position waste in frame
          </p>
        )}

        {/* Loading indicator while camera starts */}
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5d9d35] border-t-transparent" />
              <p className="text-xs text-white/60">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Capture button */}
      <div className="flex justify-center py-4">
        <button
          onClick={captureAndScan}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5d9d35] shadow-[0_0_25px_rgba(93,157,53,0.4)] transition hover:scale-105 active:scale-95 disabled:opacity-50"
          disabled={!cameraReady}
        >
          <Scan className="h-7 w-7 text-white" />
        </button>
      </div>
    </div>
  );
}
