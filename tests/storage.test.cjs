const assert = require('node:assert/strict');
const { test, beforeEach, after } = require('node:test');
const {
  getStoredPreferences,
  persistFeedMode,
  persistLanguage,
  persistSelectedTopics,
  persistWelcomeSeen,
} = require('../src/lib/appStorage.ts');
const { MAX_SELECTED_TOPICS, topicEntries } = require('../src/data/topics.ts');

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
let values;

beforeEach(() => {
  values = new Map();
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      },
    },
  });
});

after(() => {
  for (const [key, descriptor] of [
    ['window', originalWindow],
    ['navigator', originalNavigator],
  ]) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

function assertDefaultPreferences() {
  assert.deepEqual(getStoredPreferences(), {
    feedMode: 'popular',
    hasStoredFeedMode: false,
    hasSeenWelcome: false,
    language: 'en',
    selectedTopics: [],
  });
}

function assertWritesDoNotThrow() {
  assert.doesNotThrow(() => {
    persistWelcomeSeen();
    persistFeedMode('topics');
    persistLanguage('de');
    persistSelectedTopics(['history']);
  });
}

test('blocked storage getter falls back to defaults and allows preference changes', () => {
  Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage is blocked', 'SecurityError'); },
  });
  assertDefaultPreferences();
  assertWritesDoNotThrow();
});

test('failed storage reads fall back to defaults', () => {
  window.localStorage.getItem = () => {
    throw new DOMException('Storage is blocked', 'SecurityError');
  };
  assertDefaultPreferences();
});

test('full storage does not throw when saving any preference', () => {
  window.localStorage.setItem = () => {
    throw new DOMException('Storage is full', 'QuotaExceededError');
  };
  assertWritesDoNotThrow();
  assertDefaultPreferences();
});

test('all preference writes can be read back', () => {
  persistWelcomeSeen();
  persistFeedMode('topics');
  persistLanguage('de');
  persistSelectedTopics(['history']);
  assert.deepEqual(getStoredPreferences(), {
    feedMode: 'topics',
    hasStoredFeedMode: true,
    hasSeenWelcome: true,
    language: 'de',
    selectedTopics: ['history'],
  });
});

test('malformed topic preferences are ignored', () => {
  for (const stored of ['{', 'null', '{}', '"history"']) {
    values.set('wikitok.selectedTopics', stored);
    assert.deepEqual(getStoredPreferences().selectedTopics, []);
  }
});

test('topic preferences retain only unique known topics within the limit', () => {
  const topicKeys = topicEntries.map(([key]) => key);
  assert.ok(topicKeys.length > MAX_SELECTED_TOPICS);
  values.set('wikitok.selectedTopics', JSON.stringify([
    'unknown-topic', null, 17, topicKeys[0], topicKeys[0], ...topicKeys.slice(1),
  ]));
  assert.deepEqual(
    getStoredPreferences().selectedTopics,
    topicKeys.slice(0, MAX_SELECTED_TOPICS),
  );
});

test('language fallback follows the browser language rather than its region', () => {
  for (const language of ['de', 'de-DE', 'de-AT', 'de-CH']) {
    navigator.language = language;
    assert.equal(getStoredPreferences().language, 'de', language);
  }
  for (const language of ['en', 'en-DE', 'fr-FR']) {
    navigator.language = language;
    assert.equal(getStoredPreferences().language, 'en', language);
  }
});

test('a saved language takes precedence over the browser language', () => {
  navigator.language = 'de-AT';
  values.set('wikitok.language', 'en');
  assert.equal(getStoredPreferences().language, 'en');
  navigator.language = 'en-US';
  values.set('wikitok.language', 'de');
  assert.equal(getStoredPreferences().language, 'de');
});
