"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Home } from "lucide-react";
import { fileToCompressedDataUrl } from "@/lib/image";

export default function ScanUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Downscale before storing — raw phone photos can exceed the API's body limit //Ese's fix
    const imageData = await fileToCompressedDataUrl(file);
    localStorage.setItem("scannedImage", imageData);
    localStorage.setItem("scanSource", "upload");
    router.push("/dashboard/scan");
  };

  return (
    <main className="min-h-screen bg-[#edf3ea] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/scan"
          className="inline-flex items-center gap-2 text-base text-slate-600 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Scanner
        </Link>

        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
          <div className="border-b border-black/5 px-5 py-4 sm:px-6">
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Upload Waste Image
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Select a photo of your waste item to analyze
            </p>
          </div>

          <div className="p-6 text-center">
            <div
              className="flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 px-6 py-12 transition hover:border-[#5d9d35] hover:bg-[#f8fcf8]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef7ea] text-[#5d9d35]">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  Tap to upload an image
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  JPG, PNG or HEIC — Max 10MB
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mt-6">
              <Link
                href="/dashboard/scan"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#5d9d35] hover:underline"
              >
                <Home className="h-4 w-4" />
                Use camera instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
