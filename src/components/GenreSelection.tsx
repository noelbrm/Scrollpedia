import type { TopicKey } from '../data/topics';
import { topicEntries } from '../data/topics';
import { uiCopy } from '../content/ui';
import type { FeedMode, LanguageCode } from '../types/wiki';
import AboutButton from './AboutButton';
import GenreSelectionBackdrop from './GenreSelectionBackdrop';
import LanguageSwitcher from './LanguageSwitcher';

type GenreSelectionProps = {
    feedMode: FeedMode;
    language: LanguageCode;
    onFeedModeChange: (feedMode: FeedMode) => void;
    onLanguageChange: (language: LanguageCode) => void;
    selectedTopics: TopicKey[];
    onChange: (topics: TopicKey[]) => void;
    onContinue: () => void;
};

export default function GenreSelection({
  feedMode,
  language,
  onFeedModeChange,
  onLanguageChange,
  selectedTopics,
  onChange,
  onContinue,
}: GenreSelectionProps) {
  const copy = uiCopy[language];
  const isPopularSelected = feedMode === 'popular';
  const hasSelectedTopics = selectedTopics.length > 0;
  const canContinue = isPopularSelected || hasSelectedTopics;

  const toggleTopic = (topicKey: TopicKey) => {
    onFeedModeChange('topics');

    const nextTopics = selectedTopics.includes(topicKey)
      ? selectedTopics.filter((id) => id !== topicKey)
      : [...selectedTopics, topicKey];

    onChange(nextTopics);
  };

  const selectPopular = () => {
    onFeedModeChange('popular');
    onChange([]);
  };

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-neutral-950">
      <GenreSelectionBackdrop />
      <div className="absolute inset-0 z-0 bg-black/42" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.13),rgba(0,0,0,0.5)_78%)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/27 via-black/42 to-black/62" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-12 sm:pt-16">
          <div className="flex items-center justify-between gap-2">
            <AboutButton language={language} />
            <LanguageSwitcher language={language} onChange={onLanguageChange} />
          </div>

          <div className="flex flex-1 items-center justify-center pb-6">
            <div className="w-full rounded-[2rem] border border-white/10 bg-black/30 px-5 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-6 sm:py-8">
              <h1 className="mx-auto max-w-[20ch] text-center font-['Inter','Avenir_Next','Segoe_UI',sans-serif] text-[1.8rem] font-semibold leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.46)] sm:text-[2.2rem]">
                {copy.genreHeading}
              </h1>

              <div className="mt-8">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={selectPopular}
                    className={`min-w-[7.5rem] whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all duration-200 sm:min-w-[8.25rem] sm:text-base ${
                      isPopularSelected
                        ? 'border-white/70 bg-gradient-to-r from-amber-300/30 via-white/18 to-orange-300/24 text-white shadow-[0_12px_28px_rgba(0,0,0,0.24),0_0_0_1px_rgba(255,255,255,0.22)] ring-2 ring-amber-200/20'
                        : 'border-white/10 bg-gradient-to-r from-amber-200/16 via-white/[0.08] to-orange-200/14 text-white/96 hover:border-white/20 hover:from-amber-200/22 hover:via-white/[0.12] hover:to-orange-200/18'
                    }`}
                    aria-pressed={isPopularSelected}
                  >
                    {copy.popularLabel}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {topicEntries.map(([topicKey, topic]) => {
                    const isSelected =
                      feedMode === 'topics' && selectedTopics.includes(topicKey);

                    return (
                      <button
                        key={topicKey}
                        type="button"
                        onClick={() => toggleTopic(topicKey)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all duration-200 sm:text-base ${
                          isSelected
                            ? 'border-white bg-white/24 text-white shadow-[0_12px_28px_rgba(0,0,0,0.24)]'
                            : 'border-white/10 bg-transparent text-white/92 hover:border-white/20 hover:text-white'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {topic.label[language]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-black/0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className={`flex h-14 w-full items-center justify-center rounded-full px-6 text-base font-semibold shadow-lg transition-colors ${
                canContinue
                  ? 'bg-white text-neutral-950'
                  : 'cursor-not-allowed bg-white/12 text-white/45 shadow-none'
              }`}
            >
              {copy.continue}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
