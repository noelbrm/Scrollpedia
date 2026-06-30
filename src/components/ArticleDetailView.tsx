import {useEffect, useState} from 'react';
import {ArrowLeft, ExternalLink, Moon, Sun, X} from 'lucide-react';
import {uiCopy} from '../content/ui';
import {fetchFullArticle} from '../services/wikiApi';
import type {LanguageCode, WikiFeedArticle, WikiFullArticle,} from '../types/wiki';

type ArticleDetailViewProps = {
    article: WikiFeedArticle;
    language: LanguageCode;
    onBack: () => void;
};

export default function ArticleDetailView({
                                              article,
                                              language,
                                              onBack,
                                          }: ArticleDetailViewProps) {
    const copy = uiCopy[language];
    const [fullArticle, setFullArticle] = useState<WikiFullArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightMode, setIsLightMode] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const themeLabel = isLightMode ? copy.enableDarkMode : copy.enableLightMode;
    const articleText = fullArticle?.extract ?? article.extract;
    const paragraphs = articleText.split('\n\n').filter(Boolean);
    const galleryImages = Array.from(
        new Set([article.image, ...(fullArticle?.images ?? [])].filter(Boolean)),
    ) as string[];

    useEffect(() => {
        let shouldIgnore = false;

        async function loadArticle() {
            setIsLoading(true);
            setError(null);

            try {
                const nextArticle = await fetchFullArticle(article.title, language);

                if (!shouldIgnore) {
                    setFullArticle(nextArticle);
                }
            } catch {
                if (!shouldIgnore) {
                    setError(copy.articleLoadError);
                }
            } finally {
                if (!shouldIgnore) {
                    setIsLoading(false);
                }
            }
        }

        void loadArticle();

        return () => {
            shouldIgnore = true;
        };
    }, [article.title, copy.articleLoadError, language]);

    return (
        <section
            className={`fixed inset-0 z-50 overflow-y-auto transition-colors ${
                isLightMode ? 'bg-stone-100 text-neutral-950' : 'bg-neutral-950 text-white'
            }`}
        >
            <div className="mx-auto min-h-dvh w-full px-5 pb-10 pt-5 md:w-[767px]">
                <div
                    className={`sticky top-0 z-20 -mx-5 mb-6 flex items-center justify-between px-5 pb-4 pt-3 backdrop-blur transition-colors ${
                        isLightMode
                            ? 'bg-gradient-to-b from-stone-100 via-stone-100/95 to-transparent'
                            : 'bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-transparent'
                    }`}
                >
                    <button
                        type="button"
                        onClick={onBack}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                            isLightMode
                                ? 'border border-black/10 bg-black/5 text-neutral-900'
                                : 'border border-white/10 bg-white/5 text-white/90'
                        }`}
                        aria-label={copy.backToFeedAria}
                    >
                        <ArrowLeft className="size-4"/>
                        {copy.backToFeed}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLightMode((current) => !current)}
                        className={`inline-flex items-center justify-center rounded-full p-2.5 transition-colors ${
                            isLightMode
                                ? 'border border-black/10 bg-black/5 text-neutral-900'
                                : 'border border-white/10 bg-white/5 text-white/72'
                        }`}
                        aria-label={themeLabel}
                    >
                        {isLightMode ? <Moon className="size-4"/> : <Sun className="size-4"/>}
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <p
                            className={`text-sm font-medium uppercase tracking-[0.28em] ${
                                isLightMode ? 'text-neutral-500' : 'text-white/35'
                            }`}
                        >
                            {article.category}
                        </p>
                        <h1
                            className={`mt-4 max-w-[11ch] text-balance text-4xl font-semibold leading-[0.95] sm:text-5xl ${
                                isLightMode ? 'text-neutral-950' : 'text-white'
                            }`}
                        >
                            {article.title}
                        </h1>
                    </div>

                    {galleryImages.length > 0 ? (
                        <div className="space-y-3">
                            <div
                                className={`overflow-hidden rounded-[2rem] border ${
                                    isLightMode ? 'border-black/10 bg-white/70' : 'border-white/10 bg-white/[0.03]'
                                }`}
                            >
                                <img
                                    src={galleryImages[0]}
                                    alt={article.title}
                                    className="h-[18rem] w-full cursor-zoom-in object-cover"
                                    onClick={() => setExpandedImage(galleryImages[0])}
                                />
                            </div>
                            {galleryImages.length > 1 ? (
                                <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
                                    {galleryImages.slice(1).map((imageUrl, index) => (
                                        <div
                                            key={`${imageUrl}-${index}`}
                                            className={`min-w-[12rem] snap-start overflow-hidden rounded-[1.5rem] border ${
                                                isLightMode ? 'border-black/10 bg-white/70' : 'border-white/10 bg-white/[0.03]'
                                            }`}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={`${article.title} ${copy.galleryImageLabel} ${index + 2}`}
                                                className="h-40 w-full cursor-zoom-in object-cover"
                                                onClick={() => setExpandedImage(imageUrl)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div
                            className={`rounded-[2rem] border p-5 ${
                                isLightMode ? 'border-black/10 bg-white/70' : 'border-white/10 bg-white/[0.03]'
                            }`}
                        >
                            <p
                                className={`text-sm leading-7 ${
                                    isLightMode ? 'text-neutral-600' : 'text-white/60'
                                }`}
                            >
                                {copy.articleLoading}
                            </p>
                        </div>
                    ) : null}

                    {error ? (
                        <div
                            className="rounded-[2rem] border border-[#ff4fa2]/30 bg-[#ff4fa2]/10 p-5 text-sm leading-7 text-[#ffc1df]">
                            {error}
                        </div>
                    ) : null}

                    {!isLoading && !error ? (
                        <div
                            className={`rounded-[2rem] border px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-colors ${
                                isLightMode
                                    ? 'border-black/10 bg-white text-neutral-900'
                                    : 'border-white/10 bg-black text-white'
                            }`}
                        >
                            <a
                                href={article.wikipediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 ${
                                    isLightMode
                                        ? 'decoration-black/20 text-neutral-900'
                                        : 'decoration-white/25 text-white'
                                }`}
                            >
                                {copy.readOnWikipedia}
                                <ExternalLink className="size-4"/>
                            </a>
                            <div
                                className={`space-y-5 text-pretty text-[0.98rem] leading-8 sm:text-[1.15rem] ${
                                    isLightMode ? 'text-neutral-700' : 'text-white/72'
                                }`}
                            >
                                {paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            {expandedImage ? (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-2 sm:p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div
                        className="relative flex w-full items-center justify-center md:w-[767px]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setExpandedImage(null)}
                            className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 p-2 text-white transition-colors hover:bg-white/15 sm:right-4 sm:top-4"
                            aria-label={copy.aboutClose}
                        >
                            <X className="size-5"/>
                        </button>
                        <img
                            src={expandedImage}
                            alt={article.title}
                            className="max-h-[96vh] w-full object-contain"
                        />
                    </div>
                </div>
            ) : null}
        </section>
    );
}
