import type { TopicKey } from '../data/topics';

export type { TopicKey };

export type LanguageCode = 'de' | 'en';
export type FeedMode = 'topics' | 'popular';

export type ArticleTopic = {
  key: string;
  label: Record<LanguageCode, string>;
};

export type Topic = {
  label: Record<LanguageCode, string>;
  articleTopics: readonly ArticleTopic[];
};

export type WikiArticle = {
  id: string;
  title: string;
  extract: string;
  image: string | null;
  wikipediaUrl: string;
  category: string;
  source: string;
};

export type WikiFeedArticle = WikiArticle & {
  genreLabel: string;
  image: string;
  subgenreLabel: string;
};

export type WikiFullArticle = {
  title: string;
  extract: string;
  wikipediaUrl: string;
  images: string[];
};

export type TopicCandidatePool = {
  articles: WikiFeedArticle[];
  hasMore: boolean;
};

export type WikiFeedSession = {
  pools: Partial<Record<TopicKey, TopicCandidatePool>>;
  seenTitles: string[];
};

export type PopularFeedSession = {
  dayKey: string;
  candidateTitles: string[];
  cursor: number;
  seenTitles: string[];
};

export type FetchArticlesByTopicsResult = {
  articles: WikiFeedArticle[];
  session: WikiFeedSession;
  hasMore: boolean;
};

export type FetchPopularFeedResult = {
  articles: WikiFeedArticle[];
  session: PopularFeedSession;
  hasMore: boolean;
};

export type WikiParseResponse = {
  parse?: {
    title?: string;
    text?: {
      '*'?: string;
    };
  };
};
