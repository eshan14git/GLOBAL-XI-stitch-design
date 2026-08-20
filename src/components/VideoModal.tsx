"use client";

import { useEffect } from "react";

interface VideoModalProps {
  youtubeId: string;
  onClose: () => void;
}

export default function VideoModal({ youtubeId, onClose }: VideoModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      {/* Click outside target */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-primary/30 bg-surface shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/60 hover:bg-primary hover:text-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-20"
          aria-label="Close video player"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Iframe */}
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
