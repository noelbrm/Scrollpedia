import { uiCopy } from '../content/ui';
import type { LanguageCode, WikiFeedArticle } from '../types/wiki';

type ArticleCardProps = {
  article: WikiFeedArticle;
  language: LanguageCode;
  onReadMore: (article: WikiFeedArticle) => void;
};

export default function ArticleCard({
  article,
  language,
  onReadMore,
}: ArticleCardProps) {
  const copy = uiCopy[language];

  return (
    <article className="relative h-dvh snap-start snap-always overflow-hidden bg-neutral-950">
      <img
        src={article.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[55%] items-end px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28">
        <div className="max-w-[82%] rounded-[1.6rem] px-2 py-2 text-white sm:px-3 sm:py-3">
          <p className="mb-3 text-sm italic text-white/72 [font-family:Georgia,'Times_New_Roman',serif]">
            {article.genreLabel}
            {article.subgenreLabel ? ` \u00B7 ${article.subgenreLabel}` : ''}
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-none sm:text-5xl">
            {article.title}
          </h2>
          <p className="mt-4 line-clamp-4 text-pretty text-base leading-7 text-white/80">
            {article.extract}
          </p>
          <button
            type="button"
            onClick={() => onReadMore(article)}
            className="mt-5 inline-flex text-sm font-semibold text-white underline decoration-white/40 underline-offset-4"
            aria-label={`${copy.readMore}: ${article.title}`}
          >
            {copy.readMore}
          </button>
        </div>
      </div>
    </article>
  );
}
