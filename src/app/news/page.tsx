import { newsArticles } from "@/data/news";

export default function NewsPage() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Header Section */}
      <section className="mb-12 border-b border-outline-variant/30 pb-6">
        <p className="font-mono text-label-sm text-primary mb-2 uppercase tracking-widest">
          Media Intelligence
        </p>
        <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight">
          International Football News
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Stay informed on team news, tactical breakdowns, qualifiers and tournament updates from the global stage.
        </p>
      </section>

      {/* News Articles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <article
            key={article.id}
            className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col border border-outline-variant/40 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all duration-300 group"
          >
            {/* Article Image Container */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-primary-container text-on-primary font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-primary shadow-md">
                {article.category}
              </div>
            </div>

            {/* Article Details */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="font-display text-title-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {article.title}
              </h2>
              
              <p className="font-body text-body-md text-on-surface-variant mb-6 flex-grow line-clamp-3">
                {article.summary}
              </p>

              {/* Card Action footer */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant/30 font-mono text-label-sm">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-medium">Source: {article.source}</span>
                  <span className="text-on-surface-variant opacity-70 text-[10px]">{article.date}</span>
                </div>
                
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:text-primary-fixed transition-colors uppercase tracking-wider group/btn"
                >
                  Read Original
                  <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
