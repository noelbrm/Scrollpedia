import { MAX_SELECTED_TOPICS, topicEntries } from '../data/topics';
import type { TopicKey } from '../data/topics';
import type { FeedMode, LanguageCode } from '../types/wiki';

const STORAGE_KEYS = {
  feedMode: 'wikitok.feedMode',
  language: 'wikitok.language',
  selectedTopics: 'wikitok.selectedTopics',
  welcomeSeen: 'wikitok.welcomeSeen',
} as const;

const VALID_TOPIC_KEYS = new Set(topicEntries.map(([topicKey]) => topicKey));

type StoredPreferences = {
  feedMode: FeedMode;
  hasStoredFeedMode: boolean;
  hasSeenWelcome: boolean;
  language: LanguageCode;
  selectedTopics: TopicKey[];
};

export function getStoredPreferences(): StoredPreferences {
  return {
    ...getStoredFeedMode(),
    hasSeenWelcome: getStoredItem(STORAGE_KEYS.welcomeSeen) === 'true',
    language: getStoredLanguage(),
    selectedTopics: getStoredTopics(),
  };
}

export function persistWelcomeSeen() {
  persistItem(STORAGE_KEYS.welcomeSeen, 'true');
}

export function persistFeedMode(feedMode: FeedMode) {
  persistItem(STORAGE_KEYS.feedMode, feedMode);
}

export function persistLanguage(language: LanguageCode) {
  persistItem(STORAGE_KEYS.language, language);
}

export function persistSelectedTopics(selectedTopics: TopicKey[]) {
  persistItem(
    STORAGE_KEYS.selectedTopics,
    JSON.stringify(selectedTopics),
  );
}

function getStoredFeedMode(): {
  feedMode: FeedMode;
  hasStoredFeedMode: boolean;
} {
  const storedFeedMode = getStoredItem(STORAGE_KEYS.feedMode);

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
  const storedLanguage = getStoredItem(STORAGE_KEYS.language);

  if (storedLanguage === 'en' || storedLanguage === 'de') {
    return storedLanguage;
  }

  return typeof navigator !== 'undefined' &&
    new Intl.Locale(navigator.language).language === 'de'
    ? 'de'
    : 'en';
}

function getStoredTopics(): TopicKey[] {
  const storedTopics = getStoredItem(STORAGE_KEYS.selectedTopics);

  if (!storedTopics) {
    return [];
  }

  try {
    const parsedTopics = JSON.parse(storedTopics);

    if (!Array.isArray(parsedTopics)) {
      return [];
    }

    return Array.from(
      new Set(
        parsedTopics.filter(
          (topicKey): topicKey is TopicKey =>
            typeof topicKey === 'string' &&
            VALID_TOPIC_KEYS.has(topicKey as TopicKey),
        ),
      ),
    ).slice(0, MAX_SELECTED_TOPICS);
  } catch {
    return [];
  }
}

function getStoredItem(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function persistItem(key: string, value: string) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Preferences remain usable in memory when browser storage is unavailable.
  }
}
