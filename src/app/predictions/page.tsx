import Link from "next/link";
import { tournaments } from "@/data/tournaments";

export default function PredictionsPage() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Header Section */}
      <section className="mb-12 border-b border-outline-variant/30 pb-6">
        <p className="font-mono text-label-sm text-primary mb-2 uppercase tracking-widest">
          Tournament Intelligence
        </p>
        <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight">
          Select Tournament
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Simulate the global stage. Choose a competition to predict matches, group advancements, and select your champions.
        </p>
      </section>

      {/* Tournaments Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => {
          const isAvailable = tournament.status === "available";
          
          const CardContent = (
            <div className={`h-full flex flex-col justify-between p-6 rounded-xl border transition-all duration-300 ${
              isAvailable
                ? "bg-surface-container-low border-outline-variant hover:border-primary/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.05)] group"
                : "bg-surface-container-lowest/30 border-outline-variant/20 opacity-60 cursor-not-allowed"
            }`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full font-mono text-label-sm uppercase tracking-wider font-semibold border ${
                    isAvailable
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface border-outline-variant text-on-surface-variant"
                  }`}>
                    {isAvailable ? "Available" : "Coming Soon"}
                  </span>
                </div>
                
                <h3 className="font-display text-headline-lg-mobile md:text-title-md font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {tournament.name}
                </h3>
                
                <p className="font-body text-body-md text-on-surface-variant">
                  {tournament.tagline}
                </p>
              </div>

              {isAvailable && (
                <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-primary font-mono text-label-sm uppercase tracking-wider">
                  <span>Start Predictor</span>
                  <span className="material-symbols-outlined transform group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              )}
            </div>
          );

          return isAvailable ? (
            <Link key={tournament.id} href={`/predictions/simulate?tournament=${tournament.id}`}>
              {CardContent}
            </Link>
          ) : (
            <div key={tournament.id}>
              {CardContent}
            </div>
          );
        })}
      </section>
    </main>
  );
}
