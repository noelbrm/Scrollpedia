import type {
  LanguageCode,
  WikiFeedArticle,
} from '../../types/wiki';
import { encodeTitle, getWikipediaBaseUrl } from './client';

export type WikiPage = {
  canonicalurl?: string;
  extract?: string;
  fullurl?: string;
  ns?: number;
  pageid?: number;
  pageprops?: {
    disambiguation?: string;
  };
  terms?: {
    description?: string[];
  };
  thumbnail?: {
    height?: number;
    source?: string;
    width?: number;
  };
  title?: string;
};

export type WikiQueryResponse = {
  error?: {
    code?: string;
    info?: string;
  };
  query?: {
    pages?: WikiPage[];
  };
};

type FeedArticleLabels = {
  genreLabel: string;
  source: string;
  subgenreLabel?: string;
};

const SENSITIVE_FEED_PATTERNS = [
  /\badult\b/i,
  /\bbdsm\b/i,
  /\bclitoris\b/i,
  /\berotic\b/i,
  /\berotik\b/i,
  /\bfetish\b/i,
  /\bgenital(?:ia)?\b/i,
  /\bnaked\b/i,
  /\bnude\b/i,
  /\bnudity\b/i,
  /\bpenis\b/i,
  /\bporn(?:o|ography)?\b/i,
  /\bsexual\b/i,
  /\bsexualit(?:y|ät)\b/i,
  /\bsex\b/i,
  /\bvagina\b/i,
  /\bvulva\b/i,
] as const;

export function deduplicateFeedArticles(
  articles: WikiFeedArticle[],
): WikiFeedArticle[] {
  const seen = new Set<string>();

  return articles.filter((article) => {
    const key = normalizeTitleKey(article.title);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractArticleImages(
  html: string,
  language: LanguageCode,
): string[] {
  const document = new DOMParser().parseFromString(html, 'text/html');

  const imageUrls = [...document.querySelectorAll('img')]
    .map((image) => {
      const src = image.getAttribute('src') ?? '';
      const width = Number(image.getAttribute('width') ?? '0');
      const height = Number(image.getAttribute('height') ?? '0');

      if (width > 0 && width < 120) {
        return '';
      }

      if (height > 0 && height < 120) {
        return '';
      }

      return normalizeImageUrl(src, language);
    })
    .filter(Boolean);

  return Array.from(new Set(imageUrls));
}

export function extractReadableText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');

  document
    .querySelectorAll(
      '.mw-editsection, .reference, .navbox, .metadata, table, style, script, sup',
    )
    .forEach((node) => node.remove());

  const paragraphs = [...document.querySelectorAll('p')]
    .map((paragraph) =>
      paragraph.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    )
    .filter(Boolean);

  return paragraphs.join('\n\n');
}

export function normalizeTitleKey(title: string): string {
  return title.trim().replaceAll('_', ' ').toLocaleLowerCase('de-DE');
}

export function pageToLabeledFeedArticle(
  page: WikiPage,
  labels: FeedArticleLabels,
  language: LanguageCode,
): WikiFeedArticle | null {
  if (!page.title) {
    return null;
  }

  if (page.ns !== undefined && page.ns !== 0) {
    return null;
  }

  if (page.pageprops?.disambiguation !== undefined) {
    return null;
  }

  const title = page.title.trim();
  const image = page.thumbnail?.source ?? null;
  const description = page.terms?.description?.[0]?.trim() ?? '';

  if (!title || !image) {
    return null;
  }

  if (matchesSensitiveFeedContent(title, description)) {
    return null;
  }

  const extract = page.extract?.trim() ?? '';

  if (!extract) {
    return null;
  }

  return {
    id: String(page.pageid ?? title),
    title,
    extract,
    image,
    wikipediaUrl:
      page.fullurl ??
      page.canonicalurl ??
      `${getWikipediaBaseUrl(language)}/wiki/${encodeTitle(title)}`,
    category: description || 'Wikipedia',
    genreLabel: labels.genreLabel,
    subgenreLabel: labels.subgenreLabel ?? '',
    source: labels.source,
  };
}

function matchesSensitiveFeedContent(title: string, description: string): boolean {
  const haystack = [title, description].filter(Boolean).join(' ');

  if (!haystack.trim()) {
    return false;
  }

  return SENSITIVE_FEED_PATTERNS.some((pattern) => pattern.test(haystack));
}

function normalizeImageUrl(src: string, language: LanguageCode): string {
  const trimmedSrc = src.trim();

  if (!trimmedSrc) {
    return '';
  }

  if (trimmedSrc.startsWith('//')) {
    return `https:${trimmedSrc}`;
  }

  if (trimmedSrc.startsWith('/')) {
    return `${getWikipediaBaseUrl(language)}${trimmedSrc}`;
  }

  if (trimmedSrc.startsWith('http://') || trimmedSrc.startsWith('https://')) {
    return trimmedSrc;
  }

  return '';
}
