import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-grow flex flex-col w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-16">
      {/* Hero Section */}
      <section 
        className="relative rounded-2xl overflow-hidden min-h-[60vh] flex flex-col justify-center p-8 md:p-16 border border-outline-variant glass-panel"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(5, 5, 5, 0.95) 30%, rgba(5, 5, 5, 0.3) 100%), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest to-transparent z-0 opacity-40"></div>
        
        <div className="relative z-10 max-w-3xl flex flex-col items-start gap-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary-container/40 bg-surface-container-high text-primary font-mono text-label-sm uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
            Powered by Natural Language Processing
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-on-surface font-bold leading-tight">
            International Football.<br />
            <span className="gold-gradient-text">One Intelligent Hub.</span>
          </h1>
          
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl">
            Elevate your tactical understanding with elite-level data analysis, predictive modeling, and instant insights from the global game.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/football-ai"
              className="bg-primary-container text-on-primary font-title text-title-md font-bold uppercase py-4 px-8 rounded-lg hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
            >
              Ask Football AI
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              href="/predictions"
              className="bg-transparent border border-primary-container text-primary font-title text-title-md font-bold uppercase py-4 px-8 rounded-lg hover:bg-surface-container hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Make a Prediction
              <span className="material-symbols-outlined">query_stats</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
        {/* Football AI */}
        <Link
          href="/football-ai"
          className="md:col-span-8 glass-panel rounded-xl p-8 flex flex-col justify-between hover-gold-glow group relative overflow-hidden transition-all duration-300 cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 text-primary-container/10 group-hover:text-primary-container/15 transition-all duration-300">
            <span className="material-symbols-outlined text-[180px]">robot_2</span>
          </div>
          
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">forum</span>
            <h3 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2 font-bold">
              Football AI
            </h3>
            <p className="font-body text-body-md text-on-surface-variant max-w-md">
              Query complex tactical data, player statistics, and historical trends using natural language. Get instant, authoritative answers.
            </p>
          </div>
          
          <div className="relative z-10 mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            <span className="font-mono text-label-sm text-primary uppercase">NLP Powered Analysis</span>
            <span className="text-on-surface group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_outward</span>
            </span>
          </div>
        </Link>

        {/* Tournament Predictor */}
        <Link
          href="/predictions"
          className="md:col-span-4 glass-panel rounded-xl p-8 flex flex-col justify-between hover-gold-glow group bg-gradient-to-br from-surface to-surface-container-highest transition-all duration-300 cursor-pointer"
        >
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">analytics</span>
            <h3 className="font-title text-title-md text-on-surface mb-2 font-bold">
              Tournament Predictor
            </h3>
            <p className="font-body text-body-md text-on-surface-variant">
              Data-driven forecasting for major international competitions.
            </p>
          </div>
          
          <div className="mt-4 bg-surface-container-low rounded p-4 border border-outline-variant flex flex-col gap-2 relative z-10">
            <div className="flex justify-between items-center font-mono text-label-sm">
              <span className="text-on-surface">Team A Win</span>
              <span className="text-primary font-bold">64%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full" style={{ width: "64%" }}></div>
            </div>
          </div>
        </Link>

        {/* Match Highlights */}
        <Link
          href="/highlights"
          className="md:col-span-6 glass-panel rounded-xl p-8 flex flex-col justify-between hover-gold-glow group relative overflow-hidden transition-all duration-300 cursor-pointer"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-surface/85 group-hover:bg-surface/75 transition-colors z-0"></div>
          
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">play_circle</span>
            <h3 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2 font-bold">
              Match Highlights
            </h3>
            <p className="font-body text-body-md text-on-surface-variant max-w-sm">
              Curated video intelligence and tactical breakdowns of key moments.
            </p>
          </div>
        </Link>

        {/* Football News */}
        <Link
          href="/news"
          className="md:col-span-6 glass-panel rounded-xl p-8 flex flex-col justify-between hover-gold-glow group bg-surface-container-low transition-all duration-300 cursor-pointer"
        >
          <div className="relative z-10 w-full">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">newspaper</span>
            <h3 className="font-title text-title-md text-on-surface mb-4 font-bold">
              Latest Intelligence
            </h3>
            <ul className="flex flex-col gap-4 w-full">
              <li className="flex items-start gap-3 pb-3 border-b border-outline-variant/30">
                <span className="text-primary font-mono text-label-sm mt-1">10:45</span>
                <span className="text-on-surface font-body text-body-md line-clamp-2 group-hover:text-primary transition-colors">
                  Tactical shift observed in recent international friendly setup.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-mono text-label-sm mt-1">08:30</span>
                <span className="text-on-surface font-body text-body-md line-clamp-2 group-hover:text-primary transition-colors">
                  Injury report update impacts upcoming tournament predictions.
                </span>
              </li>
            </ul>
          </div>
        </Link>
      </section>
    </main>
  );
}
