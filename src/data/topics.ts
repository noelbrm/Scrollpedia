import type { ArticleTopic, Topic } from '../types/wiki';

export const MAX_SELECTED_TOPICS = 3;

function articleTopic(
  key: string,
  de: string,
  en: string,
): ArticleTopic {
  return {
    key,
    label: { de, en },
  };
}

export const topics = {
  history: {
    label: {
      de: 'Geschichte',
      en: 'History',
    },
    articleTopics: [
      articleTopic('history', 'Historie', 'History'),
      articleTopic('military-and-warfare', 'Militär', 'Military'),
    ],
  },

  science: {
    label: {
      de: 'Wissenschaft',
      en: 'Science',
    },
    articleTopics: [
      articleTopic('stem', 'MINT', 'STEM'),
      articleTopic('physics', 'Physik', 'Physics'),
      articleTopic('chemistry', 'Chemie', 'Chemistry'),
      articleTopic('biology', 'Biologie', 'Biology'),
      articleTopic('mathematics', 'Mathematik', 'Mathematics'),
      articleTopic('space', 'Weltraum', 'Space'),
    ],
  },

  technology: {
    label: {
      de: 'Technologie',
      en: 'Technology',
    },
    articleTopics: [
      articleTopic('technology', 'Technik', 'Technology'),
      articleTopic('computing', 'Computer', 'Computing'),
      articleTopic('software', 'Software', 'Software'),
      articleTopic('internet-culture', 'Netzkultur', 'Internet Culture'),
      articleTopic('engineering', 'Ingenieurwesen', 'Engineering'),
    ],
  },

  geography: {
    label: {
      de: 'Geografie',
      en: 'Geography',
    },
    articleTopics: [
      articleTopic('geographical', 'Orte', 'Places'),
      articleTopic('europe', 'Europa', 'Europe'),
      articleTopic('asia', 'Asien', 'Asia'),
      articleTopic('africa', 'Afrika', 'Africa'),
      articleTopic('north-america', 'Nordamerika', 'North America'),
      articleTopic('south-america', 'Südamerika', 'South America'),
      articleTopic('oceania', 'Ozeanien', 'Oceania'),
    ],
  },

  art: {
    label: {
      de: 'Kunst',
      en: 'Art',
    },
    articleTopics: [
      articleTopic('visual-arts', 'Bildende Kunst', 'Visual Arts'),
      articleTopic('architecture', 'Architektur', 'Architecture'),
      articleTopic('performing-arts', 'Darstellende Kunst', 'Performing Arts'),
    ],
  },

  music: {
    label: {
      de: 'Musik',
      en: 'Music',
    },
    articleTopics: [articleTopic('music', 'Musik', 'Music')],
  },

  film: {
    label: {
      de: 'Film',
      en: 'Film',
    },
    articleTopics: [
      articleTopic('films', 'Filme', 'Films'),
      articleTopic('television', 'Fernsehen', 'Television'),
      articleTopic('entertainment', 'Unterhaltung', 'Entertainment'),
    ],
  },

  sport: {
    label: {
      de: 'Sport',
      en: 'Sport',
    },
    articleTopics: [articleTopic('sports', 'Sport', 'Sports')],
  },

  nature: {
    label: {
      de: 'Natur',
      en: 'Nature',
    },
    articleTopics: [
      articleTopic('biology', 'Biologie', 'Biology'),
      articleTopic('earth-and-environment', 'Umwelt', 'Environment'),
    ],
  },

  people: {
    label: {
      de: 'Personen',
      en: 'People',
    },
    articleTopics: [articleTopic('biography', 'Biografien', 'Biography')],
  },
} as const satisfies Record<string, Topic>;

export type TopicKey = keyof typeof topics;

export const topicEntries = Object.entries(topics) as [
  TopicKey,
  (typeof topics)[TopicKey],
][];
