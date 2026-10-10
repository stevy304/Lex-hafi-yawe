export interface LegalTopic {
  slug: string;
  en: string;
  rw: string;
  fr: string;
  icon: string;
}

export const LEGAL_TOPICS: LegalTopic[] = [
  { slug: 'constitutional', en: 'Constitutional Law', rw: 'Itegeko Nshinga', fr: 'Droit constitutionnel', icon: '🏛️' },
  { slug: 'criminal', en: 'Criminal Justice', rw: 'Ubutabera Mpanabyaha', fr: 'Justice pénale', icon: '⚖️' },
  { slug: 'civil', en: 'Civil Law & Contracts', rw: 'Amategeko y\'Ubwenegihugu n\'Amasezerano', fr: 'Droit civil et contrats', icon: '📝' },
  { slug: 'family', en: 'Family & Succession', rw: 'Umuryango n\'Izungura', fr: 'Famille et successions', icon: '👨‍👩‍👧‍👦' },
  { slug: 'land', en: 'Land & Property', rw: 'Ubutaka n\'Imitungo', fr: 'Foncier et propriété', icon: '🏡' },
  { slug: 'labor', en: 'Labor & Employment', rw: 'Umurimo n\'Abakozi', fr: 'Travail et emploi', icon: '💼' },
  { slug: 'commercial', en: 'Commercial & Business', rw: 'Ubucuruzi n\'Ibigo', fr: 'Droit commercial et affaires', icon: '🏢' },
  { slug: 'tax', en: 'Tax & Customs', rw: 'Imisoro n\'Amahoro', fr: 'Fiscalité et douanes', icon: '📊' },
  { slug: 'human_rights', en: 'Human Rights & Legal Aid', rw: 'Uburenganzira bwa Muntu n\'Ubufasha', fr: 'Droits humains et aide légale', icon: '🕊️' },
];
