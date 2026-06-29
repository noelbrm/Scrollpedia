import { topicEntries } from '../data/topics';
import type { TopicKey } from '../data/topics';
import type { FeedMode, LanguageCode } from '../types/wiki';

const STORAGE_KEYS = {
  feedMode: 'wikitok.feedMode',
  language: 'wikitok.language',
  selectedTopics: 'wikitok.selectedTopics',
} as const;

const VALID_TOPIC_KEYS = new Set(topicEntries.map(([topicKey]) => topicKey));

type StoredPreferences = {
  feedMode: FeedMode;
  hasStoredFeedMode: boolean;
  language: LanguageCode;
  selectedTopics: TopicKey[];
};

export function getStoredPreferences(): StoredPreferences {
  return {
    ...getStoredFeedMode(),
    language: getStoredLanguage(),
    selectedTopics: getStoredTopics(),
  };
}

export function persistFeedMode(feedMode: FeedMode) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEYS.feedMode, feedMode);
}

export function persistLanguage(language: LanguageCode) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEYS.language, language);
}

export function persistSelectedTopics(selectedTopics: TopicKey[]) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(
    STORAGE_KEYS.selectedTopics,
    JSON.stringify(selectedTopics),
  );
}

function getStoredFeedMode(): {
  feedMode: FeedMode;
  hasStoredFeedMode: boolean;
} {
  const storage = getLocalStorage();

  if (!storage) {
    return {
      feedMode: 'popular',
      hasStoredFeedMode: false,
    };
  }

  const storedFeedMode = storage.getItem(STORAGE_KEYS.feedMode);

  if (storedFeedMode === 'popular' || storedFeedMode === 'topics') {
    return {
      feedMode: storedFeedMode,
      hasStoredFeedMode: true,
    };
  }

  return {
    feedMode: 'popular',
    hasStoredFeedMode: false,
  };
}

function getStoredLanguage(): LanguageCode {
  const storage = getLocalStorage();

  if (!storage) {
    return 'de';
  }

  const storedLanguage = storage.getItem(STORAGE_KEYS.language);
  return storedLanguage === 'en' || storedLanguage === 'de' ? storedLanguage : 'de';
}

function getStoredTopics(): TopicKey[] {
  const storage = getLocalStorage();

  if (!storage) {
    return [];
  }

  const storedTopics = storage.getItem(STORAGE_KEYS.selectedTopics);

  if (!storedTopics) {
    return [];
  }

  try {
    const parsedTopics = JSON.parse(storedTopics);

    if (!Array.isArray(parsedTopics)) {
      return [];
    }

    return parsedTopics.filter(
      (topicKey): topicKey is TopicKey =>
        typeof topicKey === 'string' && VALID_TOPIC_KEYS.has(topicKey as TopicKey),
    );
  } catch {
    return [];
  }
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}
