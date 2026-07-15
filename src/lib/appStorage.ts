import { topicEntries } from '../data/topics';
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
    hasSeenWelcome: getLocalStorage()?.getItem(STORAGE_KEYS.welcomeSeen) === 'true',
    language: getStoredLanguage(),
    selectedTopics: getStoredTopics(),
  };
}

export function persistWelcomeSeen() {
  getLocalStorage()?.setItem(STORAGE_KEYS.welcomeSeen, 'true');
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
  const storedLanguage = getLocalStorage()?.getItem(STORAGE_KEYS.language);

  if (storedLanguage === 'en' || storedLanguage === 'de') {
    return storedLanguage;
  }

  return typeof navigator !== 'undefined' &&
    new Intl.Locale(navigator.language).region === 'DE'
    ? 'de'
    : 'en';
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
