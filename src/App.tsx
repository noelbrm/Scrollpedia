import { useEffect, useState } from 'react';
import ArticleFeed from './components/ArticleFeed';
import ArticleDetailView from './components/ArticleDetailView';
import GenreSelection from './components/GenreSelection';
import GenreSelectionBackdrop from './components/GenreSelectionBackdrop';
import WelcomeScreen from './components/WelcomeScreen';
import type { TopicKey } from './data/topics';
import {
  persistFeedMode,
  getStoredPreferences,
  persistLanguage,
  persistSelectedTopics,
  persistWelcomeSeen,
} from './lib/appStorage';
import type {
  FeedMode,
  LanguageCode,
  WikiFeedArticle,
} from './types/wiki';

type View = 'welcome' | 'onboarding' | 'feed';

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
  const [view, setView] = useState<View>(() =>
    storedPreferences.hasSeenWelcome ? 'onboarding' : 'welcome',
  );
  const [activeArticle, setActiveArticle] = useState<WikiFeedArticle | null>(null);

  const handleBackToGenres = () => {
    setActiveArticle(null);
    setView('onboarding');
  };

  const handleWelcomeContinue = () => {
    persistWelcomeSeen();
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
      {view !== 'feed' ? (
        <section className="relative isolate min-h-dvh overflow-hidden bg-neutral-950">
          <GenreSelectionBackdrop />
          <div className="absolute inset-0 z-0 bg-black/48" />
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1),rgba(0,0,0,0.68)_82%)]" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-black/42 to-black/80" />

          {view === 'welcome' ? (
            <WelcomeScreen
              language={language}
              onLanguageChange={setLanguage}
              onContinue={handleWelcomeContinue}
            />
          ) : (
            <GenreSelection
              feedMode={feedMode}
              language={language}
              onBackToWelcome={() => setView('welcome')}
              onLanguageChange={setLanguage}
              onFeedModeChange={setFeedMode}
              selectedTopics={selectedTopics}
              onChange={setSelectedTopics}
              onContinue={() => setView('feed')}
            />
          )}
        </section>
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
