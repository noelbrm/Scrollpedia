import {type ReactNode, useRef} from 'react';
import {ExternalLink, Info, X} from 'lucide-react';
import {uiCopy} from '../content/ui';
import type {LanguageCode} from '../types/wiki';

const GITHUB_URL = 'https://github.com/noelbrm/Scrollpedia';

type AboutButtonProps = {
    className?: string;
    label?: string;
    language: LanguageCode;
};

type InstallVisual = {
    alt: string;
    imgClassName?: string;
    size: 'icon' | 'panel';
    src: string;
};

type InstallStep = {
    text: string;
    visual?: InstallVisual;
};

type AboutCopy = (typeof uiCopy)[LanguageCode];

export default function AboutView({
                                      className,
                                      label,
                                      language,
                                  }: AboutButtonProps) {
    const copy = uiCopy[language];
    const dialogRef = useRef<HTMLDialogElement>(null);
    const installGuides = getInstallGuides(copy);
    const buttonClassName = `${className ?? ''} inline-flex items-center justify-center rounded-full border border-white/10 bg-black/45 text-sm font-semibold text-white/90 backdrop-blur transition-colors hover:border-white/20 hover:bg-black/60 hover:text-white ${label ? 'h-14 gap-2 px-6' : 'size-10'}`.trim();

    const closeDialog = () => {
        dialogRef.current?.close();
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    if (!dialogRef.current?.open) {
                        dialogRef.current?.showModal();
                    }
                }}
                className={buttonClassName}
                aria-label={copy.aboutAria}
            >
                <Info className="size-4"/>
                {label}
            </button>

            <dialog
                ref={dialogRef}
                className="fixed inset-0 z-[70] m-0 h-full w-full max-w-none border-0 bg-black/80 p-4 text-white backdrop:bg-black/80"
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeDialog();
                    }
                }}
            >
                <div className="flex h-full items-center justify-center">
                    <div
                        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-black text-white shadow-[0_40px_120px_rgba(0,0,0,0.72)]">
                        <div className="relative max-h-[92vh] overflow-y-auto px-5 pb-5 pt-0 sm:px-7 sm:pb-7 sm:pt-0">
                            <div
                                className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-end bg-black/92 px-5 pb-4 pt-5 backdrop-blur-md sm:-mx-7 sm:px-7 sm:pb-5 sm:pt-7">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white/88 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label={copy.closeAboutAria}
                                >
                                    <X className="size-4"/>
                                    {copy.aboutClose}
                                </button>
                            </div>

                            <article className="mx-auto w-full max-w-xl text-center">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/40">
                                    {copy.aboutEyebrow}
                                </p>
                                <h2 className="mt-4 font-['Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[2.25rem] font-semibold leading-[0.95] text-white sm:text-[2.8rem]">
                                    {copy.aboutTitle}
                                </h2>
                                <p className="mx-auto mt-5 max-w-[36ch] text-pretty text-[0.98rem] leading-7 text-white/74">
                                    {copy.aboutDescription}
                                </p>
                            </article>

                            <div className="mx-auto mt-8 w-full max-w-xl space-y-7">
                                <AboutSection title={copy.aboutUsageTitle}>
                                    <p className="text-pretty text-sm leading-7 text-white/74">
                                        {copy.aboutUsageDescription}
                                    </p>
                                </AboutSection>

                                <AboutSection title={copy.aboutInstallTitle} withDivider>
                                    <p className="max-w-[40ch] text-pretty text-sm leading-7 text-white/66">
                                        {copy.aboutInstallIntro}
                                    </p>
                                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                                        {installGuides.map((guide) => (
                                            <InstallGuide
                                                key={guide.title}
                                                title={guide.title}
                                                steps={guide.steps}
                                            />
                                        ))}
                                    </div>
                                </AboutSection>

                                <AboutSection title={copy.aboutMeTitle} withDivider>
                                    <p className="text-pretty text-sm leading-7 text-white/74">
                                        {copy.aboutMeDescription}
                                    </p>
                                    <div className="mt-5 flex justify-center px-1">
                                        <a
                                            href={GITHUB_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/12 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                        >
                                            <img
                                                src="/icons/github.svg"
                                                alt=""
                                                aria-hidden="true"
                                                className="size-4 invert"
                                            />
                                            {copy.aboutGithub}
                                            <ExternalLink className="size-3.5"/>
                                        </a>
                                    </div>
                                </AboutSection>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    );
}

type InstallGuideProps = {
    title: string;
    steps: InstallStep[];
};

type AboutSectionProps = {
    children: ReactNode;
    title: string;
    withDivider?: boolean;
};

function AboutSection({
                          children,
                          title,
                          withDivider = false,
                      }: AboutSectionProps) {
    return (
        <section
            className={`py-1 ${withDivider ? 'border-t border-white/10 pt-6 sm:pt-7' : ''}`}
        >
            <h3 className="text-lg font-semibold text-white sm:text-[1.35rem]">
                {title}
            </h3>
            <div className="mt-3.5">{children}</div>
        </section>
    );
}

function InstallGuide({title, steps}: InstallGuideProps) {
    return (
        <div>
            <p className="text-base font-semibold text-white sm:text-lg">{title}</p>

            <div className="mt-4 space-y-4">
                {steps.map((step, index) => (
                    <article key={`${title}-${index}`}>
                        <div className="flex items-start gap-3">
              <span
                  className="mt-0.5 inline-flex min-w-6 shrink-0 items-center justify-center text-[0.82rem] font-semibold text-white/55">
                {index + 1}
              </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2.5">
                                    <p className="min-w-0 text-sm leading-6 text-white/76">
                                        {step.text}
                                    </p>

                                    {step.visual?.size === 'icon' ? (
                                        <img
                                            src={step.visual.src}
                                            alt={step.visual.alt}
                                            className={`mt-0.5 h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6 ${step.visual.imgClassName ?? ''}`.trim()}
                                        />
                                    ) : null}
                                </div>

                                {step.visual?.size === 'panel' ? (
                                    <figure className="mt-3 flex max-w-[10rem] flex-col items-start">
                                        <img
                                            src={step.visual.src}
                                            alt={step.visual.alt}
                                            className={`h-auto w-full rounded-[0.9rem] ${step.visual.imgClassName ?? ''}`.trim()}
                                        />
                                    </figure>
                                ) : null}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function getInstallGuides(copy: AboutCopy) {
    return [
        {
            title: copy.aboutInstallIos,
            steps: [
                {text: copy.aboutInstallIosStep1},
                {
                    text: copy.aboutInstallIosStep2,
                    visual: {
                        alt: copy.aboutInstallIosShareLabel,
                        imgClassName: 'object-contain',
                        size: 'icon' as const,
                        src: '/images/install-guides/IOS-share-icon-computern.jpg',
                    },
                },
                {
                    text: copy.aboutInstallIosStep3,
                    visual: {
                        alt: copy.aboutInstallIosHomeLabel,
                        imgClassName: 'object-contain',
                        size: 'panel' as const,
                        src: '/images/install-guides/IOS-add-to-home.png',
                    },
                },
                {text: copy.aboutInstallIosStep4},
            ],
        },
        {
            title: copy.aboutInstallAndroid,
            steps: [
                {text: copy.aboutInstallAndroidStep1},
                {
                    text: copy.aboutInstallAndroidStep2,
                    visual: {
                        alt: copy.aboutInstallAndroidMenuLabel,
                        imgClassName: 'object-contain',
                        size: 'icon' as const,
                        src: '/images/install-guides/android-3-dots.png',
                    },
                },
                {
                    text: copy.aboutInstallAndroidStep3,
                    visual: {
                        alt: copy.aboutInstallAndroidHomeLabel,
                        imgClassName: 'object-contain',
                        size: 'panel' as const,
                        src: '/images/install-guides/android-add-to-home.png',
                    },
                },
                {text: copy.aboutInstallAndroidStep4},
            ],
        },
    ];
}
