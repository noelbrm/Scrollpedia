import type {
  FetchPopularFeedResult,
  LanguageCode,
  PopularFeedSession,
  WikiFeedArticle,
} from '../../types/wiki';
import { fetchJson, getWikipediaBaseUrl } from './client';
import {
  normalizeTitleKey,
  pageToLabeledFeedArticle,
  type WikiQueryResponse,
} from './parsing';

type PopularFeedOptions = {
  language: LanguageCode;
  session?: PopularFeedSession;
  totalLimit: number;
};

type PopularTopResponse = {
  items?: Array<{
    articles?: Array<{
      article?: string;
    }>;
  }>;
};

type UtcDayParts = {
  day: string;
  dayKey: string;
  month: string;
  year: string;
};

const POPULAR_PROJECT_BY_LANGUAGE: Record<LanguageCode, string> = {
  de: 'de.wikipedia.org',
  en: 'en.wikipedia.org',
};

const POPULAR_GENRE_LABEL_BY_LANGUAGE: Record<LanguageCode, string> = {
  de: 'Meistgesehen',
  en: 'Most Viewed',
};

const DISALLOWED_EXACT_TITLES = new Set([
  'Hauptseite',
  'Main Page',
  'Main_Page',
]);

const DISALLOWED_PREFIXES = [
  'Category:',
  'Datei:',
  'Draft:',
  'Entwurf:',
  'File:',
  'Help:',
  'Hilfe:',
  'MediaWiki:',
  'Portal:',
  'Special:',
  'Spezial:',
  'Template:',
  'Vorlage:',
  'Wikipedia:',
];

export async function getPopularWikipediaFeed({
  language,
  session,
  totalLimit,
}: PopularFeedOptions): Promise<FetchPopularFeedResult> {
  const utcDay = getYesterdayUtcDayParts();
  const candidateTitles = await getPopularCandidateTitles(language, utcDay);
  const nextSession: PopularFeedSession =
    session && session.dayKey === utcDay.dayKey
      ? {
          candidateTitles,
          cursor: Math.min(session.cursor, candidateTitles.length),
          dayKey: utcDay.dayKey,
          seenTitles: [...session.seenTitles],
        }
      : {
          candidateTitles,
          cursor: 0,
          dayKey: utcDay.dayKey,
          seenTitles: [],
        };
  const articles: WikiFeedArticle[] = [];
  const seenTitleKeys = new Set(
    nextSession.seenTitles.map((title) => normalizeTitleKey(title)),
  );

  while (
    articles.length < totalLimit &&
    nextSession.cursor < nextSession.candidateTitles.length
  ) {
    const batchTitles = nextSession.candidateTitles.slice(
      nextSession.cursor,
      nextSession.cursor + (totalLimit - articles.length),
    );

    if (batchTitles.length === 0) {
      break;
    }

    nextSession.cursor += batchTitles.length;

    const batchArticles = await fetchPopularArticleDetails(
      batchTitles,
      language,
    );

    for (const article of batchArticles) {
      const key = normalizeTitleKey(article.title);

      if (!key || seenTitleKeys.has(key)) {
        continue;
      }

      seenTitleKeys.add(key);
      nextSession.seenTitles.push(article.title);
      articles.push(article);

      if (articles.length >= totalLimit) {
        break;
      }
    }

  }

  return {
    articles,
    hasMore: nextSession.cursor < nextSession.candidateTitles.length,
    session: nextSession,
  };
}

async function getPopularCandidateTitles(
  language: LanguageCode,
  utcDay: UtcDayParts,
): Promise<string[]> {
  const project = POPULAR_PROJECT_BY_LANGUAGE[language];
  const url = new URL(
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${project}/all-access/${utcDay.year}/${utcDay.month}/${utcDay.day}`,
  );
  const response = await fetchJson<PopularTopResponse>(url);
  const titles = (response.items?.[0]?.articles ?? [])
    .map((entry) => entry.article?.trim() ?? '')
    .filter(Boolean)
    .filter((title) => !isDisallowedPopularTitle(title));
  const seen = new Set<string>();
  const uniqueTitles = titles.filter((title) => {
    const key = normalizeTitleKey(title);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  return uniqueTitles;
}

async function fetchPopularArticleDetails(
  titles: string[],
  language: LanguageCode,
): Promise<WikiFeedArticle[]> {
  const url = new URL(`${getWikipediaBaseUrl(language)}/w/api.php`);
  url.search = new URLSearchParams({
    action: 'query',
    exintro: '1',
    exlimit: 'max',
    explaintext: '1',
    exsentences: '2',
    format: 'json',
    formatversion: '2',
    inprop: 'url',
    origin: '*',
    pilimit: 'max',
    piprop: 'thumbnail',
    pithumbsize: '500',
    ppprop: 'disambiguation',
    prop: 'pageimages|pageterms|extracts|info|pageprops',
    redirects: '1',
    titles: titles.join('|'),
    wbptterms: 'description',
  }).toString();

  const data = await fetchJson<WikiQueryResponse>(url);

  return (data.query?.pages ?? [])
    .map((page) =>
      pageToLabeledFeedArticle(
        page,
        {
          genreLabel: POPULAR_GENRE_LABEL_BY_LANGUAGE[language],
          source: 'wikipedia-popular',
          subgenreLabel: '',
        },
        language,
      ),
    )
    .filter(
      (article): article is WikiFeedArticle =>
        article !== null && Boolean(article.image),
    );
}
function getYesterdayUtcDayParts(): UtcDayParts {
  const [year, month, day] = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10)
    .split('-');

  return {
    day,
    dayKey: `${year}-${month}-${day}`,
    month,
    year,
  };
}

function isDisallowedPopularTitle(title: string): boolean {
  const normalizedTitle = title.trim();
  const displayTitle = normalizedTitle.replaceAll('_', ' ');

  if (!normalizedTitle) {
    return true;
  }

  if (
    DISALLOWED_EXACT_TITLES.has(normalizedTitle) ||
    DISALLOWED_EXACT_TITLES.has(displayTitle)
  ) {
    return true;
  }

  return DISALLOWED_PREFIXES.some((prefix) =>
    normalizedTitle.startsWith(prefix),
  );
}

