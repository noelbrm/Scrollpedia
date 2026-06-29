import { topics } from '../data/topics';
import type {
  FetchArticlesByTopicsResult,
  LanguageCode,
  TopicKey,
  WikiFeedArticle,
  WikiFeedSession,
  WikiFullArticle,
  WikiParseResponse,
} from '../types/wiki';
import {
  encodeTitle,
  fetchJson,
  getWikipediaBaseUrl,
} from './wikiApi/client';
import { loadTopicBatch } from './wikiApi/discovery';
import { getPopularWikipediaFeed } from './wikiApi/popular';
import {
  extractArticleImages,
  extractReadableText,
  normalizeTitleKey,
} from './wikiApi/parsing';

export async function fetchArticlesByTopics(
  selectedTopicKeys: TopicKey[],
  limit: number,
  language: LanguageCode,
  session?: WikiFeedSession,
): Promise<FetchArticlesByTopicsResult> {
  const topicKeys =
    selectedTopicKeys.filter((key): key is TopicKey => key in topics).length > 0
      ? selectedTopicKeys.filter((key): key is TopicKey => key in topics)
      : (Object.keys(topics) as TopicKey[]);
  const baseSession = session ?? {
    pools: {},
    seenTitles: [],
  };
  let nextSession: WikiFeedSession = {
    pools: topicKeys.reduce<WikiFeedSession['pools']>((pools, topicKey) => {
      pools[topicKey] = baseSession.pools[topicKey] ?? {
        articles: [],
        hasMore: true,
      };
      return pools;
    }, {} as WikiFeedSession['pools']),
    seenTitles: [...baseSession.seenTitles],
  };
  const seenTitleKeys = new Set(
    nextSession.seenTitles.map((title) => normalizeTitleKey(title)),
  );
  const articles: WikiFeedArticle[] = [];
  let discoveryFailed = false;
  const exhaustedTopicKeys = new Set<TopicKey>();

  while (articles.length < limit) {
    const activeTopicKeys = topicKeys.filter((topicKey) => {
      if (exhaustedTopicKeys.has(topicKey)) {
        return false;
      }

      const pool = nextSession.pools[topicKey];
      return Boolean(pool && (pool.articles.length > 0 || pool.hasMore));
    });

    if (activeTopicKeys.length === 0) {
      break;
    }

    let roundMadeProgress = false;

    for (const topicKey of activeTopicKeys) {
      const consumeResult = await loadTopicBatch(
        topicKey,
        1,
        nextSession,
        language,
        seenTitleKeys,
      );

      nextSession = consumeResult.session;
      discoveryFailed = discoveryFailed || consumeResult.hadFetchFailure;

      if (consumeResult.articles.length > 0) {
        roundMadeProgress = true;
        articles.push(...consumeResult.articles);
      }

      const pool = nextSession.pools[topicKey];

      if (!pool || (pool.articles.length === 0 && !pool.hasMore)) {
        exhaustedTopicKeys.add(topicKey);
      }

      if (articles.length >= limit) {
        break;
      }
    }

    if (
      !roundMadeProgress &&
      discoveryFailed &&
      articles.length === 0 &&
      !hasRemainingDiscovery(nextSession, topicKeys)
    ) {
      throw new Error('Artikel konnten gerade nicht geladen werden.');
    }

    if (!roundMadeProgress) {
      break;
    }
  }

  nextSession.seenTitles = Array.from(seenTitleKeys);

  if (
    articles.length === 0 &&
    discoveryFailed &&
    !hasRemainingDiscovery(nextSession, topicKeys)
  ) {
    throw new Error('Artikel konnten gerade nicht geladen werden.');
  }

  return {
    articles: articles.slice(0, limit),
    session: nextSession,
    hasMore: hasRemainingDiscovery(nextSession, topicKeys),
  };
}

export async function fetchFullArticle(
  title: string,
  language: LanguageCode,
): Promise<WikiFullArticle> {
  const url = new URL(`${getWikipediaBaseUrl(language)}/w/api.php`);
  url.search = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
    origin: '*',
  }).toString();

  const response = await fetchJson<WikiParseResponse>(url);
  const html = response.parse?.text?.['*'] ?? '';
  const extract = extractReadableText(html);
  const images = extractArticleImages(html, language);

  if (!extract) {
    throw new Error(`Artikeltext ist leer: ${title}`);
  }

  return {
    title: response.parse?.title ?? title,
    extract,
    wikipediaUrl: `${getWikipediaBaseUrl(language)}/wiki/${encodeTitle(title)}`,
    images,
  };
}

export { getPopularWikipediaFeed };

function hasRemainingDiscovery(
  session: WikiFeedSession,
  topicKeys: TopicKey[],
): boolean {
  return topicKeys.some((topicKey) => {
    const pool = session.pools[topicKey];
    return Boolean(pool && (pool.articles.length > 0 || pool.hasMore));
  });
}
