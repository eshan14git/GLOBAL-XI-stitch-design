"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";

interface DecodedPrediction {
  t: string;
  cName: string;
  cCode: string;
  cFlag: string;
  f1Name: string;
  f1Flag: string;
  f2Name: string;
  f2Flag: string;
}

function PredictionResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [prediction, setPrediction] = useState<DecodedPrediction | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(dataParam)));
        setPrediction(decoded);
      } catch (e) {
        console.error("Failed to decode prediction data:", e);
      }
    }
  }, [dataParam]);

  if (!prediction) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">No prediction data found.</p>
          <button onClick={() => router.push("/predictions")} className="text-primary hover:underline font-mono">
            Go back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const handleCopyLink = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    const shareText = `Check out my prediction for ${prediction.t.toUpperCase()} on GLOBAL XI! My predicted Champion is ${prediction.cFlag} ${prediction.cName}. Final Matchup: ${prediction.f1Flag} ${prediction.f1Name} vs ${prediction.f2Flag} ${prediction.f2Name}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GLOBAL XI Tournament Prediction",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed or cancelled:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveImage = () => {
    // Simple browser screenshot simulation.
    // Downloads a text summary representing the card since third-party rendering libraries can be bloated.
    // This fits the university project requirements of prioritising a clean browser-based solution.
    const textData = `
GLOBAL XI TOURNAMENT PREDICTION
-------------------------------
Tournament: ${prediction.t.toUpperCase()}
Predicted Champion: ${prediction.cFlag} ${prediction.cName} (${prediction.cCode})
Final Matchup: ${prediction.f1Flag} ${prediction.f1Name} vs ${prediction.f2Flag} ${prediction.f2Name}

Generated on GLOBAL XI - "The World Game, All in One Place."
    `;
    
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `global-xi-prediction-${prediction.t}.txt`;
    link.click();
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col items-center justify-center gap-10">
      {/* Result Card */}
      <div
        ref={resultCardRef}
        className="w-full max-w-2xl luxury-card rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden shadow-2xl border-primary"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

        {/* Trophy icon */}
        <span className="material-symbols-outlined text-primary text-6xl md:text-7xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
          emoji_events
        </span>

        {/* Subtitle */}
        <span className="font-mono text-label-sm text-primary uppercase tracking-widest">
          Tournament Simulation Complete
        </span>

        {/* Tournament Name */}
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold uppercase">
          {prediction.t.replace("-", " ")}
        </h2>

        {/* Big Champion Flag & Name */}
        <div className="flex flex-col items-center gap-2 my-4">
          <span className="text-7xl md:text-8xl">{prediction.cFlag}</span>
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
            Predicted Champion
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-on-surface font-extrabold gold-gradient-text tracking-tight">
            {prediction.cName}
          </h1>
        </div>

        {/* Final Matchup */}
        {prediction.f1Name && prediction.f2Name && (
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              Final Matchup
            </span>
            <div className="flex justify-between items-center text-body-md font-semibold text-on-surface">
              <div className="flex items-center gap-2 w-5/12 justify-end">
                <span>{prediction.f1Name}</span>
                <span className="text-xl">{prediction.f1Flag}</span>
              </div>
              <span className="text-xs text-primary font-mono px-2">VS</span>
              <div className="flex items-center gap-2 w-5/12 justify-start">
                <span className="text-xl">{prediction.f2Flag}</span>
                <span>{prediction.f2Name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="font-body text-xs text-on-surface-variant/60 max-w-sm mt-2">
          This prediction is backed by local simulation metadata. Copy the link below to share your tournament outcome.
        </p>
      </div>

      {/* Control Buttons Panel */}
      <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Share */}
        <button
          onClick={handleShare}
          className="p-4 bg-surface border border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer text-center font-mono text-label-sm uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-2xl">share</span>
          Share
        </button>

        {/* Save as Image / File */}
        <button
          onClick={handleSaveImage}
          className="p-4 bg-surface border border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer text-center font-mono text-label-sm uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-2xl">download</span>
          Save File
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`p-4 bg-surface border rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-center font-mono text-label-sm uppercase tracking-wider ${
            copySuccess ? "border-primary text-primary" : "border-outline-variant hover:border-primary hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {copySuccess ? "done" : "content_copy"}
          </span>
          {copySuccess ? "Copied!" : "Copy Link"}
        </button>

        {/* Reset */}
        <Link
          href="/predictions"
          className="p-4 bg-primary-container text-on-primary rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary transition-all duration-300 text-center font-mono text-label-sm uppercase tracking-wider font-semibold"
        >
          <span className="material-symbols-outlined text-2xl">restart_alt</span>
          New Simulation
        </Link>
      </div>
    </main>
  );
}

export default function PredictionResultPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center font-mono text-label-sm">Loading Prediction Details...</div>}>
      <PredictionResultContent />
    </Suspense>
  );
}
