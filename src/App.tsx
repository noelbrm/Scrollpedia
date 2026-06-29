import { useEffect, useState } from 'react';
import ArticleFeed from './components/ArticleFeed';
import ArticleDetailView from './components/ArticleDetailView';
import GenreSelection from './components/GenreSelection';
import type { TopicKey } from './data/topics';
import {
  persistFeedMode,
  getStoredPreferences,
  persistLanguage,
  persistSelectedTopics,
} from './lib/appStorage';
import type {
  FeedMode,
  LanguageCode,
  WikiFeedArticle,
} from './types/wiki';

type View = 'onboarding' | 'feed';

export default function App() {
  const [storedPreferences] = useState(getStoredPreferences);
  const [feedMode, setFeedMode] = useState<FeedMode>(
    () => storedPreferences.feedMode,
  );
  const [language, setLanguage] = useState<LanguageCode>(
    () => storedPreferences.language,
  );
  const [selectedTopics, setSelectedTopics] = useState<TopicKey[]>(
    () => storedPreferences.selectedTopics,
  );
  const [view, setView] = useState<View>(() => {
    const shouldOpenFeed =
      (storedPreferences.hasStoredFeedMode &&
        storedPreferences.feedMode === 'popular') ||
      storedPreferences.selectedTopics.length > 0;

    return shouldOpenFeed ? 'feed' : 'onboarding';
  });
  const [activeArticle, setActiveArticle] = useState<WikiFeedArticle | null>(null);

  const handleBackToGenres = () => {
    setActiveArticle(null);
    setView('onboarding');
  };

  useEffect(() => {
    setActiveArticle(null);
  }, [language]);

  useEffect(() => {
    persistLanguage(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;

    const description = document.querySelector('meta[name="description"]');

    if (description) {
      description.setAttribute(
        'content',
        language === 'de'
          ? 'Scrollpedia ist eine TikTok-ähnliche App zum Scrollen von Content, nur mit wissenswerten Wikipedia-Artikeln.'
          : 'Scrollpedia is a TikTok-like app for scrolling content, except the content is informative Wikipedia articles.',
      );
    }
  }, [language]);

  useEffect(() => {
    persistFeedMode(feedMode);
  }, [feedMode]);

  useEffect(() => {
    persistSelectedTopics(selectedTopics);
  }, [selectedTopics]);

  useEffect(() => {
    if (feedMode === 'popular' && selectedTopics.length > 0) {
      setSelectedTopics([]);
    }
  }, [feedMode, selectedTopics.length]);

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-50 antialiased">
      {view === 'onboarding' ? (
        <GenreSelection
          feedMode={feedMode}
          language={language}
          onLanguageChange={setLanguage}
          onFeedModeChange={setFeedMode}
          selectedTopics={selectedTopics}
          onChange={setSelectedTopics}
          onContinue={() => setView('feed')}
        />
      ) : (
        <>
          <ArticleFeed
            feedMode={feedMode}
            language={language}
            onBackToGenres={handleBackToGenres}
            selectedTopics={selectedTopics}
            onOpenArticle={setActiveArticle}
          />
          {activeArticle ? (
            <ArticleDetailView
              article={activeArticle}
              language={language}
              onBack={() => setActiveArticle(null)}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
