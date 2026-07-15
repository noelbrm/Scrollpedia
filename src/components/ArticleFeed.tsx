import {useCallback, useEffect, useRef, useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import {uiCopy} from '../content/ui';
import {type TopicKey, topics} from '../data/topics';
import {fetchArticlesByTopics, getPopularWikipediaFeed,} from '../services/wikiApi';
import type {FeedMode, LanguageCode, PopularFeedSession, WikiFeedArticle, WikiFeedSession,} from '../types/wiki';
import ArticleCard from './ArticleCard';

type ArticleFeedProps = {
    feedMode: FeedMode;
    language: LanguageCode;
    onBackToGenres: () => void;
    onOpenArticle: (article: WikiFeedArticle) => void;
    selectedTopics: TopicKey[];
};

const INITIAL_BATCH_LIMIT = 12;
const PRELOAD_BATCH_LIMIT = 8;
const ROTATION_INTERVAL_MS = 2000;

export default function ArticleFeed({
                                        feedMode,
                                        language,
                                        onBackToGenres,
                                        selectedTopics,
                                        onOpenArticle,
                                    }: ArticleFeedProps) {
    const copy = uiCopy[language];
    const rotatingTopics = selectedTopics
        .map((topicKey) => topics[topicKey]?.label[language] ?? '')
        .filter(Boolean);
    const [articles, setArticles] = useState<WikiFeedArticle[]>([]);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const feedRef = useRef<HTMLElement | null>(null);
    const preloadRef = useRef<HTMLDivElement | null>(null);
    const sessionRef = useRef<PopularFeedSession | WikiFeedSession | undefined>(
        undefined,
    );
    const sessionModeRef = useRef<FeedMode | undefined>(undefined);
    const requestIdRef = useRef(0);
    const backLabel =
        feedMode === 'popular' ? copy.changeSelection : copy.changeGenres;
    const backAria =
        feedMode === 'popular' ? copy.changeSelectionAria : copy.changeGenresAria;
    const currentTopicLabel = rotatingTopics[currentTopicIndex] ?? '';
    const loadingTopicLine =
        feedMode === 'popular'
            ? copy.loadingPopularLine
            : currentTopicLabel
                ? `${currentTopicLabel}${copy.loadingGenreSuffix}`
                : copy.loadingGenreFallback;

    const fetchFeedBatch = useCallback(
        async (limit: number) => {
            if (feedMode === 'popular') {
                return getPopularWikipediaFeed({
                    language,
                    session:
                        sessionModeRef.current === 'popular'
                            ? (sessionRef.current as PopularFeedSession | undefined)
                            : undefined,
                    totalLimit: limit,
                });
            }

            return fetchArticlesByTopics(
                selectedTopics,
                limit,
                language,
                sessionModeRef.current === 'topics'
                    ? (sessionRef.current as WikiFeedSession | undefined)
                    : undefined,
            );
        },
        [feedMode, language, selectedTopics],
    );

    useEffect(() => {
        setCurrentTopicIndex(0);
    }, [language, selectedTopics]);

    useEffect(() => {
        if (rotatingTopics.length <= 1) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentTopicIndex((current) => (current + 1) % rotatingTopics.length);
        }, ROTATION_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [rotatingTopics]);

    const loadMoreArticles = useCallback(async () => {
        if (isLoading || isLoadingMore || error || !hasMore) {
            return;
        }

        const activeRequestId = requestIdRef.current;
        setIsLoadingMore(true);

        try {
            const result = await fetchFeedBatch(PRELOAD_BATCH_LIMIT);

            if (requestIdRef.current !== activeRequestId) {
                return;
            }

            sessionRef.current = result.session;
            sessionModeRef.current = feedMode;
            setHasMore(result.hasMore);

            if (result.articles.length === 0) {
                return;
            }

            setArticles((current) => [...current, ...result.articles]);
        } catch {
            // Keep the feed alive after transient preload failures.
        } finally {
            if (requestIdRef.current === activeRequestId) {
                setIsLoadingMore(false);
            }
        }
    }, [error, feedMode, fetchFeedBatch, hasMore, isLoading, isLoadingMore]);

    useEffect(() => {
        const currentRequestId = requestIdRef.current + 1;
        requestIdRef.current = currentRequestId;
        let isCurrentRequest = true;
        sessionRef.current = undefined;
        sessionModeRef.current = undefined;
        setArticles([]);
        setHasMore(true);
        setIsLoadingMore(false);

        async function loadArticles() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchFeedBatch(INITIAL_BATCH_LIMIT);

                if (isCurrentRequest && requestIdRef.current === currentRequestId) {
                    sessionRef.current = result.session;
                    sessionModeRef.current = feedMode;
                    setArticles(result.articles);
                    setHasMore(result.hasMore);
                }
            } catch {
                if (isCurrentRequest && requestIdRef.current === currentRequestId) {
                    setError(uiCopy[language].feedUnavailableDescription);
                    setArticles([]);
                    setHasMore(false);
                }
            } finally {
                if (isCurrentRequest && requestIdRef.current === currentRequestId) {
                    setIsLoading(false);
                }
            }
        }

        loadArticles();

        return () => {
            isCurrentRequest = false;
        };
    }, [feedMode, fetchFeedBatch, language, selectedTopics]);

    useEffect(() => {
        const feed = feedRef.current;
        const preloadTarget = preloadRef.current;

        if (!feed || !preloadTarget) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }

                void loadMoreArticles();
            },
            {
                root: feed,
                rootMargin: '0px 0px 160% 0px',
            },
        );

        observer.observe(preloadTarget);

        return () => {
            observer.disconnect();
        };
    }, [articles.length, loadMoreArticles]);

    const topBar = (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 px-4">
            <div className="mx-auto flex w-full items-start justify-between gap-3 md:w-[767px] md:px-4">
                <button
                    type="button"
                    onClick={onBackToGenres}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:text-white"
                    aria-label={backAria}
                >
                    <ArrowLeft className="size-4"/>
                    {backLabel}
                </button>
            </div>
        </div>
    );

    if (isLoading && articles.length === 0) {
        return (
            <section
                className="relative flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-center text-white"
                aria-label={copy.loadingAriaLabel}
            >
                {topBar}
                <div className="max-w-xs">
                    <div
                        className="mx-auto size-10 animate-spin rounded-full border-2 border-white/15 border-t-white/90"/>
                    <h2 className="mt-6 text-balance text-2xl font-semibold">
                        {copy.loadingTitle}
                    </h2>
                    <p className="mt-3 min-h-6 text-pretty text-sm leading-6 text-white/70 transition-opacity duration-300">
                        {loadingTopicLine}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={feedRef}
            className="h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-neutral-950 md:mx-auto md:w-[767px]"
            aria-label={copy.feedAriaLabel}
        >
            {topBar}
            {!isLoading && error ? (
                renderFeedMessage(copy.feedUnavailableTitle, error)
            ) : null}
            {!isLoading && !error && articles.length === 0 && !hasMore ? (
                renderFeedMessage(
                    feedMode === 'popular'
                        ? copy.noPopularArticlesTitle
                        : copy.noArticlesTitle,
                    feedMode === 'popular'
                        ? copy.noPopularArticlesDescription
                        : copy.noArticlesDescription,
                )
            ) : null}
            {!isLoading && !error && articles.length === 0 && hasMore ? (
                renderFeedMessage(
                    feedMode === 'popular'
                        ? copy.preparingPopularTitle
                        : copy.preparingTitle,
                    feedMode === 'popular'
                        ? copy.preparingPopularDescription
                        : copy.preparingDescription,
                )
            ) : null}
            {!isLoading && !error
                ? articles.map((article, index) => (
                    <ArticleCard
                        key={`${article.id}-${index}`}
                        article={article}
                        language={language}
                        onReadMore={onOpenArticle}
                    />
                ))
                : null}
            {!isLoading && !error ? (
                <div ref={preloadRef} className="h-16 w-full" aria-hidden="true"/>
            ) : null}
            {!isLoading && !error && isLoadingMore ? (
                <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center px-4 pb-6">
                    <div
                        className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-white/80 backdrop-blur">
                        {copy.loadingMore}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function renderFeedMessage(title: string, description?: string) {
    return (
        <div className="flex h-dvh snap-start items-center justify-center px-6 text-center text-white">
            <div className="max-w-xs">
                <h2 className="text-balance text-2xl font-semibold">{title}</h2>
                {description ? (
                    <p className="mt-3 text-pretty text-sm leading-6 text-white/70">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
