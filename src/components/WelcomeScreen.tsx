import { ArrowRight } from 'lucide-react';
import { uiCopy } from '../content/ui';
import type { LanguageCode } from '../types/wiki';
import AboutView from './AboutView';
import LanguageSwitcher from './LanguageSwitcher';

type WelcomeScreenProps = {
  language: LanguageCode;
  onContinue: () => void;
  onLanguageChange: (language: LanguageCode) => void;
};

export default function WelcomeScreen({
  language,
  onContinue,
  onLanguageChange,
}: WelcomeScreenProps) {
  const copy = uiCopy[language];

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12 sm:pt-16">
      <div className="mx-auto flex w-full max-w-md justify-end">
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
        <img
          src="/icons/icon.svg"
          alt=""
          aria-hidden="true"
          className="size-24 rounded-[1.75rem] border border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.55)] sm:size-28"
        />
        <h1 className="mt-7 max-w-[12ch] text-balance font-['Fraunces','Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[2.65rem] font-semibold leading-[0.96] text-white [text-shadow:0_12px_44px_rgba(0,0,0,0.72)] sm:text-[3.35rem]">
          {copy.welcomeTitle}
        </h1>
      </div>

      <div className="mx-auto grid w-full max-w-md gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-neutral-950 shadow-[0_18px_48px_rgba(0,0,0,0.32)] transition-colors hover:bg-neutral-100"
        >
          {copy.welcomeStart}
          <ArrowRight className="size-4" />
        </button>
        <AboutView
          className="w-full"
          label={copy.welcomeExplanation}
          language={language}
        />
        <footer className="mt-1 text-center text-[0.68rem] text-white/40">
          {language === 'de' ? 'Erstellt von ' : 'Created by '}
          <a
            href="https://github.com/noelbrm/Scrollpedia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white"
          >
            Noel Bromkamp
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
