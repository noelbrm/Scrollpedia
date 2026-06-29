import { FETCH_TIMEOUT_MS } from './constants';

const API_ERROR_MESSAGE = 'Wikipedia API request failed';

export function encodeTitle(title: string): string {
  return encodeURIComponent(title.trim().replaceAll(' ', '_'));
}

export async function fetchJson<T>(url: string | URL): Promise<T> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(API_ERROR_MESSAGE);
  }

  const data = (await response.json().catch(() => {
    throw new Error(API_ERROR_MESSAGE);
  })) as T;

  if (hasApiError(data)) {
    throw new Error(API_ERROR_MESSAGE);
  }

  return data;
}

async function fetchWithTimeout(url: string | URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(API_ERROR_MESSAGE);
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getWikipediaBaseUrl(language: string): string {
  return `https://${language}.wikipedia.org`;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

function hasApiError(data: unknown): data is { error: unknown } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    Boolean((data as { error?: unknown }).error)
  );
}
