import { uiCopy } from '../content/ui';
import type { LanguageCode } from '../types/wiki';

type LanguageSwitcherProps = {
  className?: string;
  language: LanguageCode;
  onChange: (language: LanguageCode) => void;
};

const LANGUAGE_OPTIONS: { label: string; value: LanguageCode }[] = [
  { label: 'DE', value: 'de' },
  { label: 'EN', value: 'en' },
];

export default function LanguageSwitcher({
  language,
  onChange,
  className,
}: LanguageSwitcherProps) {
  const copy = uiCopy[language];

  return (
    <div
      className={[
        'inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1 backdrop-blur',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={copy.languageLabel}
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = option.value === language;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive ? 'bg-white text-neutral-950' : 'text-white/72 hover:text-white'
            }`}
            aria-pressed={isActive}
            aria-label={option.value === 'de' ? 'Deutsch' : 'English'}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
