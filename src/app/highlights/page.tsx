"use client";

import { useState } from "react";
import { highlights, Highlight } from "@/data/highlights";
import VideoModal from "@/components/VideoModal";

export default function HighlightsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const filters = ["All", "World Cup", "EURO", "Nations League", "Other"];

  const filteredHighlights = activeFilter === "All"
    ? highlights
    : highlights.filter((h) => h.tournament.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === "Other" && !["world cup", "euro", "nations league"].includes(h.tournament.toLowerCase())));

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Header Section */}
      <section className="mb-12 border-b border-outline-variant/30 pb-6">
        <p className="font-mono text-label-sm text-primary mb-2 uppercase tracking-widest">
          Media Intelligence
        </p>
        <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight">
          International Match Highlights
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Relive unforgettable goals, tactical breakdowns, and dramatic finishes from the international game.
        </p>
      </section>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-10 pb-4 border-b border-outline-variant/20">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-2 rounded-full border font-mono text-label-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeFilter === f
                ? "border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                : "border-outline text-on-surface-variant hover:border-primary hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Highlights Cards Grid */}
      {filteredHighlights.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHighlights.map((video) => (
            <article
              key={video.id}
              className="bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/40 hover:border-primary/50 transition-all duration-300 group flex flex-col hover:shadow-[0_0_15px_rgba(212,175,55,0.05)]"
            >
              {/* Card Thumbnail Image Area */}
              <div
                className="relative w-full aspect-video bg-surface-dim cursor-pointer overflow-hidden"
                onClick={() => setActiveVideoId(video.youtubeId)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>

              {/* Match Card Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3 font-mono text-label-sm">
                  <span className="text-primary uppercase tracking-widest">
                    {video.tournament} • {video.year}
                  </span>
                  <span className="text-on-surface-variant opacity-75">{video.source}</span>
                </div>

                <h3
                  className="font-display text-title-md font-bold text-on-background mb-6 flex-1 group-hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setActiveVideoId(video.youtubeId)}
                >
                  {video.title}
                </h3>

                <button
                  onClick={() => setActiveVideoId(video.youtubeId)}
                  className="w-fit flex items-center text-primary font-mono text-label-sm uppercase tracking-widest hover:text-primary-fixed transition-colors cursor-pointer group/btn"
                >
                  <span className="material-symbols-outlined mr-2">play_arrow</span>
                  Watch Highlights
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="text-center py-16 bg-surface-container-low/40 rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-3">
            tv_off
          </span>
          <p className="font-mono text-label-sm text-on-surface-variant">
            No highlights found matching this category.
          </p>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoId && (
        <VideoModal youtubeId={activeVideoId} onClose={() => setActiveVideoId(null)} />
      )}
    </main>
  );
}
