import { topics } from '../../data/topics';
import type {
  LanguageCode,
  TopicKey,
  WikiFeedArticle,
  WikiFeedSession,
} from '../../types/wiki';
import { MAX_SEARCH_RESULTS_PER_TOPIC } from './constants';
import { fetchJson, getWikipediaBaseUrl } from './client';
import {
  deduplicateFeedArticles,
  normalizeTitleKey,
  pageToLabeledFeedArticle,
  type WikiQueryResponse,
} from './parsing';

export async function loadTopicBatch(
  topicKey: TopicKey,
  target: number,
  session: WikiFeedSession,
  language: LanguageCode,
  seenTitleKeys: Set<string>,
): Promise<{
  session: WikiFeedSession;
  hadFetchFailure: boolean;
  articles: WikiFeedArticle[];
}> {
  const articles: WikiFeedArticle[] = [];
  const pool = session.pools[topicKey] ?? {
    articles: [],
    hasMore: true,
  };
  session.pools[topicKey] = pool;
  let hadFetchFailure = false;

  while (articles.length < target) {
    if (pool.articles.length === 0) {
      if (!pool.hasMore) {
        break;
      }

      try {
        const fetchedArticles = await fetchGenrePool(topicKey, language, target);
        const nextArticles = fetchedArticles.filter((article) => {
          const normalizedTitle = normalizeTitleKey(article.title);

          if (!normalizedTitle || seenTitleKeys.has(normalizedTitle)) {
            return false;
          }

          return true;
        });

        pool.articles.push(...nextArticles);
        pool.hasMore = nextArticles.length > 0;
      } catch {
        hadFetchFailure = true;
        pool.hasMore = false;
        break;
      }
    }

    const article = pool.articles.shift();

    if (!article) {
      break;
    }

    const normalizedTitle = normalizeTitleKey(article.title);

    if (!normalizedTitle || seenTitleKeys.has(normalizedTitle)) {
      continue;
    }

    seenTitleKeys.add(normalizedTitle);
    articles.push(article);
  }

  return {
    session,
    hadFetchFailure,
    articles,
  };
}

async function fetchGenrePool(
  topicKey: TopicKey,
  language: LanguageCode,
  requestedPoolSize: number,
): Promise<WikiFeedArticle[]> {
  const articleTopics = topics[topicKey].articleTopics;
  const collected: WikiFeedArticle[] = [];

  for (const articleTopic of articleTopics) {
    if (collected.length >= requestedPoolSize) {
      break;
    }

    const remaining = requestedPoolSize - collected.length;
    const url = new URL(`${getWikipediaBaseUrl(language)}/w/api.php`);
    url.search = new URLSearchParams({
      action: 'query',
      exintro: '1',
      exlimit: 'max',
      exsentences: '2',
      explaintext: '1',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrnamespace: '0',
      gsrlimit: String(
        Math.min(Math.max(remaining * 2, 20), MAX_SEARCH_RESULTS_PER_TOPIC),
      ),
      gsrsearch: `articletopic:${articleTopic.key}`,
      gsrsort: 'random',
      inprop: 'url',
      origin: '*',
      pilimit: 'max',
      piprop: 'thumbnail',
      pithumbsize: '500',
      ppprop: 'disambiguation',
      prop: 'pageimages|pageterms|extracts|info|pageprops',
      wbptterms: 'description',
    }).toString();

    const data = await fetchJson<WikiQueryResponse>(url);

    const pages = data.query?.pages ?? [];
    const articles = pages
      .map((page) =>
        pageToLabeledFeedArticle(
          page,
          {
            genreLabel: topics[topicKey].label[language],
            source: 'wikipedia-search',
            subgenreLabel: articleTopic.label[language],
          },
          language,
        ),
      )
      .filter((article): article is WikiFeedArticle => article !== null);
    collected.push(...articles);
  }

  return deduplicateFeedArticles(collected).slice(0, requestedPoolSize);
}
