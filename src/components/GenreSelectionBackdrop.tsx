import type { CSSProperties } from 'react';

const BACKDROP_CARDS = [
  {
    src: '/images/genre-cards/Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg',
  },
  {
    src: '/images/genre-cards/Albert_Einstein_Head_cleaned.jpg',
  },
  {
    src: '/images/genre-cards/Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg',
  },
  {
    src: '/images/genre-cards/Combat_deuxi%C3%A8me_croisade.jpg',
  },
  {
    src: '/images/genre-cards/Cordeliere_and_Regent.jpg',
  },
  {
    src: '/images/genre-cards/Fleet_5_nations.jpg',
  },
  {
    src: '/images/genre-cards/Meteosat-12-fci-march-equinox-2025-noon.jpg',
  },
  {
    src: '/images/genre-cards/Michael_Jackson_in_1988.jpg',
  },
  {
    src: '/images/genre-cards/Mohenjo-daro_Priesterk%C3%B6nig.jpg',
  },
  {
    src: '/images/genre-cards/Otto_I_Manuscriptum_Mediolanense_c_1200.jpg',
  },
  {
    src: '/images/genre-cards/Oxford_Dodo_display.jpg',
  },
  {
    src: '/images/genre-cards/Queen_Elizabeth_II_on_her_Coronation_Day.jpg',
  },
  {
    src: '/images/genre-cards/Sebastiano_Ricci_002.jpg',
  },
  {
    src: '/images/genre-cards/Statue-Augustus.jpg',
  },
  {
    src: '/images/genre-cards/Triple_Entente.jpg',
  },
  {
    src: '/images/genre-cards/Elisabeth_of_Austria,_by_Franz_Xaver_Winterhalter.jpg',
  },
] as const;

const ROWS = [
  { indexes: [0, 1, 2, 3, 4, 5], direction: 'left', duration: 48 },
  { indexes: [6, 7, 8, 9, 10, 11], direction: 'right', duration: 54 },
  { indexes: [12, 13, 14, 15, 0, 2], direction: 'left', duration: 58 },
  { indexes: [5, 7, 9, 11, 13, 15], direction: 'right', duration: 52 },
] as const;

export default function GenreSelectionBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:inset-y-0 md:left-1/2 md:right-auto md:w-[767px] md:-translate-x-1/2">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-6 px-2 sm:gap-7 sm:px-4">
        {ROWS.map((row, rowIndex) => {
          const cards = row.indexes.map((cardIndex) => BACKDROP_CARDS[cardIndex]);

          return (
            <div
              key={`${row.direction}-${rowIndex}`}
              className="relative left-1/2 w-[138%] -translate-x-1/2 overflow-hidden py-1 md:w-[1058px]"
            >
              <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-neutral-950 via-neutral-950/65 to-transparent md:hidden" />
              <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-neutral-950 via-neutral-950/65 to-transparent md:hidden" />
              <div
                className={`genre-backdrop-strip flex w-max px-3 sm:px-4 lg:px-0 ${
                  row.direction === 'right'
                    ? 'genre-backdrop-strip-right'
                    : 'genre-backdrop-strip-left'
                }`}
                style={
                  {
                    '--scroll-duration': `${row.duration}s`,
                  } as CSSProperties
                }
              >
                <CardStrip cards={cards} />
                <CardStrip cards={cards} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CardStripProps = {
  cards: ReadonlyArray<(typeof BACKDROP_CARDS)[number]>;
};

function CardStrip({ cards }: CardStripProps) {
  return (
    <div className="flex gap-4 pr-4 sm:gap-5 sm:pr-5">
      {cards.map((card, index) => (
        <article
          key={`${card.src}-${index}`}
          className="relative h-[9.5rem] w-[6.6rem] shrink-0 overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_48px_rgba(0,0,0,0.26)] backdrop-blur-[2px] sm:h-[11.5rem] sm:w-[8rem]"
          aria-hidden="true"
        >
          <img
            src={card.src}
            alt=""
            className="h-full w-full object-cover opacity-[0.92] saturate-[0.82] contrast-[1.02]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-black/12 to-white/10" />
          <div className="absolute inset-x-3 bottom-3 h-px rounded-full bg-white/18" />
        </article>
      ))}
    </div>
  );
}
