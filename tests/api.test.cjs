const assert = require('node:assert/strict');
const { test } = require('node:test');
const { fetchArticlesByTopics } = require('../src/services/wikiApi.ts');
const { fetchJson } = require('../src/services/wikiApi/client.ts');
const { getPopularWikipediaFeed } = require('../src/services/wikiApi/popular.ts');

function page(title) {
  return { title, extract: 'Article text', thumbnail: { source: 'https://example.org/image.jpg' } };
}

function article(title) {
  return {
    id: title, title, extract: 'Article text', image: 'https://example.org/image.jpg',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/' + title,
    category: 'Wikipedia', genreLabel: 'Music', subgenreLabel: 'Music', source: 'wikipedia-search',
  };
}

function setupWindow(t) {
  const previous = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  t.after(() => { globalThis.window = previous; });
}

test('initial topic failure rejects, then a fresh request can recover', async (t) => {
  setupWindow(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  await assert.rejects(fetchArticlesByTopics(['music'], 1, 'en'));
  fetch.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ query: { pages: [page('Recovered')] } }) }));
  const result = await fetchArticlesByTopics(['music'], 1, 'en');
  assert.deepEqual(result.articles.map((item) => item.title), ['Recovered']);
});

test('a failed topic request preserves its session and remains retryable', async (t) => {
  setupWindow(t);
  const session = { pools: { music: { articles: [], hasMore: true } }, seenTitles: ['already read'] };
  const before = structuredClone(session);
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  await assert.rejects(fetchArticlesByTopics(['music'], 2, 'en', session));
  assert.deepEqual(session, before);
  assert.equal(fetch.mock.callCount(), 1);
  fetch.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ query: { pages: [page('Recovered')] } }) }));
  const result = await fetchArticlesByTopics(['music'], 1, 'en', session);
  assert.deepEqual(result.articles.map((item) => item.title), ['Recovered']);
  assert.deepEqual(session, before);
});

test('partial topic results keep failed topics retryable without consuming the prior session', async (t) => {
  setupWindow(t);
  const session = { pools: { music: { articles: [article('Cached')], hasMore: true } }, seenTitles: [] };
  const before = structuredClone(session);
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  const result = await fetchArticlesByTopics(['music'], 2, 'en', session);
  assert.deepEqual(result.articles.map((item) => item.title), ['Cached']);
  assert.equal(result.hasMore, true);
  assert.equal(result.session.pools.music.hasMore, true);
  assert.deepEqual(session, before);
  assert.equal(fetch.mock.callCount(), 1);
  fetch.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ query: { pages: [page('New')] } }) }));
  const next = await fetchArticlesByTopics(['music'], 1, 'en', result.session);
  assert.deepEqual(next.articles.map((item) => item.title), ['New']);
});

test('the API timeout aborts a stalled response body after headers arrive', async (t) => {
  setupWindow(t);
  globalThis.window.setTimeout = (callback) => setTimeout(callback, 10);
  let signal;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    signal = options.signal;
    return new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')), { once: true });
      },
    }));
  });
  await assert.rejects(fetchJson('https://example.org'), /Wikipedia API request failed/);
  assert.equal(signal.aborted, true);
});

test('a failed topic is skipped only for the current batch while other topics fill it', async (t) => {
  setupWindow(t);
  let failedCalls = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (new URL(url).searchParams.get('gsrsearch') === 'articletopic:music') {
      failedCalls += 1;
      throw new Error('offline');
    }
    return { ok: true, json: async () => ({ query: { pages: Array.from({ length: 5 }, (_, i) => page('Sport ' + i)) } }) };
  });
  const result = await fetchArticlesByTopics(['music', 'sport'], 3, 'en');
  assert.equal(result.articles.length, 3);
  assert.equal(failedCalls, 1);
  assert.equal(result.session.pools.music.hasMore, true);
  assert.equal(result.hasMore, true);
});

test('popular feed retains seen titles across UTC midnight', async (t) => {
  setupWindow(t);
  const now = t.mock.method(Date, 'now', () => Date.parse('2026-10-18T23:59:00Z'));
  t.mock.method(globalThis, 'fetch', async (url) => ({
    ok: true,
    json: async () => String(url).includes('/metrics/')
      ? { items: [{ articles: [{ article: 'A' }, { article: 'B' }, { article: 'C' }] }] }
      : { query: { pages: new URL(url).searchParams.get('titles').split('|').map(page) } },
  }));
  const first = await getPopularWikipediaFeed({ language: 'en', totalLimit: 1 });
  now.mock.mockImplementation(() => Date.parse('2026-10-19T00:01:00Z'));
  const next = await getPopularWikipediaFeed({ language: 'en', totalLimit: 1, session: first.session });
  assert.notEqual(first.session.dayKey, next.session.dayKey);
  assert.deepEqual(first.articles.map((item) => item.title), ['A']);
  assert.deepEqual(next.articles.map((item) => item.title), ['B']);
  assert.deepEqual(first.session.seenTitles, ['A']);
});
