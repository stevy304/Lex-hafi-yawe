import {
  User,
  Post,
  Reply,
  Community,
  LegalService,
  LegalAidProvider,
  LawDocument,
  LegalNewsItem,
  Appointment,
  Notification,
  Conversation,
  Message,
  ReportItem,
  VerificationApplication,
  AdminAuditLog
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_aline_advocate',
    name: 'Me. Aline Mugabo',
    username: 'alinemugabo_esq',
    coverGradient: 'from-[#102744] via-[#1D4ED8] to-[#0F172A]',
    role: 'advocate',
    isVerified: true,
    verificationType: 'bar_member',
    barRollNumber: 'RBA/1284/2019',
    professionalTitle: 'Advocate & Commercial Arbitrator',
    firmName: 'Kigali Lex Chambers',
    officeAddress: 'Grand Pension Plaza, 7th Floor, KN 3 Ave, Kigali',
    bio: 'Senior Associate specializing in Rwandan Land Law (N° 027/2021), commercial contracts, and RDB business restructuring. Passionate about community legal literacy.',
    location: 'Kigali, Rwanda',
    languages: ['Kinyarwanda', 'English', 'French'],
    joinedDate: 'Jan 2024',
    followersCount: 4280,
    followingCount: 312,
    followingIds: ['user_minijust', 'user_rba'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 184,
    practiceAreas: ['Land & Property Conveyancing', 'Commercial Law', 'Labor Disputes', 'Contract Drafting'],
    consultationFee: 25000, // 25,000 RWF
    consultationFormats: ['in_person', 'video', 'phone'],
    email: 'aline.mugabo@kigalilex.rw',
    phone: '+250 788 412 890',
    password: 'password123'
  },
  {
    id: 'user_emmanuel_advocate',
    name: 'Me. Emmanuel Kayitare',
    username: 'emmanuel_kayitare',
    coverGradient: 'from-[#0B192C] via-[#1E3E62] to-[#000000]',
    role: 'advocate',
    isVerified: true,
    verificationType: 'bar_member',
    barRollNumber: 'RBA/0921/2014',
    professionalTitle: 'Senior Counsel & Criminal Defense Attorney',
    firmName: 'Trust & Justice Law Firm',
    officeAddress: 'Centenary House, 4th Floor, Nyarugenge, Kigali',
    bio: 'Advocate with 12+ years experience in Rwandan Courts of First Instance and Court of Appeal. Due process advocate. Member of Rwanda Bar Association.',
    location: 'Nyarugenge, Kigali',
    languages: ['Kinyarwanda', 'French', 'English'],
    joinedDate: 'Mar 2023',
    followersCount: 6150,
    followingCount: 198,
    followingIds: ['user_minijust', 'user_rba', 'user_aline_advocate'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 245,
    practiceAreas: ['Criminal Defense', 'Constitutional Law', 'Appellate Litigation', 'Human Rights'],
    consultationFee: 35000,
    consultationFormats: ['in_person', 'video'],
    email: 'e.kayitare@trustjustice.rw',
    phone: '+250 788 560 112',
    password: 'password123'
  },
  {
    id: 'user_minijust',
    name: 'Ministry of Justice (MINIJUST)',
    username: 'minijust_rwanda',
    coverGradient: 'from-[#064E3B] via-[#0F766E] to-[#134E4A]',
    role: 'institution',
    isVerified: true,
    verificationType: 'official_institution',
    institutionName: 'Ministry of Justice, Republic of Rwanda',
    professionalTitle: 'Official Government Ministry',
    bio: 'Official channel of the Ministry of Justice, Rwanda. Delivering fair justice, promoting the rule of law, and publishing official legal guidelines & gazette notices.',
    location: 'Kimihurura, Kigali, Rwanda',
    languages: ['Kinyarwanda', 'English', 'French'],
    joinedDate: 'Jan 2023',
    followersCount: 38400,
    followingCount: 42,
    followingIds: ['user_rba'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 490,
    email: 'info@minijust.gov.rw',
    phone: '+250 252 584 547',
    password: 'password123'
  },
  {
    id: 'user_rba',
    name: 'Rwanda Bar Association',
    username: 'rwanda_bar',
    coverGradient: 'from-[#1E1B4B] via-[#312E81] to-[#1E293B]',
    role: 'institution',
    isVerified: true,
    verificationType: 'official_institution',
    institutionName: 'Rwanda Bar Association (Urugaga rw\'Abavoka)',
    professionalTitle: 'Statutory Professional Body for Advocates',
    bio: 'The statutory professional body governing advocates in Rwanda. Promoting excellence in legal practice, professional ethics, and universal access to justice.',
    location: 'Kacyiru, Gasabo, Kigali',
    languages: ['Kinyarwanda', 'English', 'French'],
    joinedDate: 'Feb 2023',
    followersCount: 19800,
    followingCount: 35,
    followingIds: ['user_minijust'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 312,
    email: 'info@rwandabar.org.rw',
    phone: '+250 788 308 000',
    password: 'password123'
  },
  {
    id: 'user_maj_gasabo',
    name: 'Jean-Paul Kwizera (MAJ)',
    username: 'maj_gasabo_officer',
    coverGradient: 'from-[#065F46] via-[#047857] to-[#064E3B]',
    role: 'legalaid',
    isVerified: true,
    verificationType: 'legal_aid_bureau',
    professionalTitle: 'Coordinator, Access to Justice Bureau (MAJ)',
    firmName: 'Gasabo District MAJ Bureau',
    bio: 'Providing free legal assistance, mediation (ubwunzi referrals), and advice to citizens and vulnerable persons under the Ministry of Justice framework.',
    location: 'Gasabo District Headquarters, Kigali',
    languages: ['Kinyarwanda', 'French'],
    joinedDate: 'May 2023',
    followersCount: 3120,
    followingCount: 140,
    followingIds: ['user_minijust', 'user_aline_advocate'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 95,
    email: 'gasabo.maj@minijust.gov.rw',
    phone: '+250 788 380 441',
    password: 'password123'
  },
  {
    id: 'user_eric_citizen',
    name: 'Eric Nshimiyimana',
    username: 'eric_nshimi',
    coverGradient: 'from-[#1E293B] via-[#334155] to-[#475569]',
    role: 'citizen',
    isVerified: false,
    bio: 'Kigali-based tech founder and entrepreneur. Interested in Rwanda startup compliance, intellectual property protection, and labor law regulations.',
    location: 'Kicukiro, Kigali',
    languages: ['Kinyarwanda', 'English'],
    joinedDate: 'Sep 2023',
    followersCount: 840,
    followingCount: 215,
    followingIds: ['user_aline_advocate', 'user_minijust', 'user_maj_gasabo'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 42,
    email: 'eric@innovatekigali.rw',
    password: 'password123'
  },
  {
    id: 'user_clarisse_admin',
    name: 'Clarisse Uwamahoro',
    username: 'clarisse_admin',
    coverGradient: 'from-[#31111D] via-[#4A044E] to-[#1E1B4B]',
    role: 'admin',
    isVerified: true,
    verificationType: 'official_institution',
    professionalTitle: 'Lex Hafi Yawe Platform Director & Legal Compliance Lead',
    bio: 'Managing platform integrity, credentials validation with Rwanda Bar Association roll, and community trust. Dedicated to expanding digital justice access.',
    location: 'Kigali, Rwanda',
    languages: ['Kinyarwanda', 'English', 'French'],
    joinedDate: 'Jan 2023',
    followersCount: 1420,
    followingCount: 80,
    followingIds: ['user_minijust', 'user_rba', 'user_aline_advocate'],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 56,
    email: 'admin@lexhafi.rw',
    password: 'password123'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1_minijust_official',
    authorId: 'user_minijust',
    content: 'COMMUNIQUÉ: The Ministry of Justice reminds all citizens and legal practitioners that the revised guidelines on amicable settlement of land disputes through Abunzi (Mediators) are now fully operational across all 30 districts.\n\nCitizens are encouraged to seek local mediation before filing civil petitions in Primary Courts, saving time and resources.\n\nRead the full circular below.',
    createdAt: '2026-10-08T10:30:00Z',
    legalTopic: 'Land & Property',
    tags: ['LandDisputes', 'AbunziMediation', 'OfficialGazette', 'MINIJUST'],
    audience: 'public',
    isOfficialAnnouncement: true,
    attachments: [
      {
        type: 'document',
        url: 'https://minijust.gov.rw/circulars/abunzi-guidelines-2026.pdf',
        name: 'Official_Circular_MINIJUST_Abunzi_2026.pdf',
        fileSize: '1.4 MB',
        mimeType: 'application/pdf'
      }
    ],
    likesCount: 142,
    repliesCount: 28,
    repostsCount: 65,
    quotesCount: 14,
    likedBy: ['user_aline_advocate', 'user_eric_citizen'],
    repostedBy: ['user_aline_advocate'],
    bookmarkedBy: ['user_eric_citizen']
  },
  {
    id: 'post_2_aline_legal_insight',
    authorId: 'user_aline_advocate',
    content: 'Many clients ask me: "Can an employer terminate a probation contract immediately without written notice in Rwanda?"\n\nUnder Article 18 of Law N° 66/2018 Regulating Labor in Rwanda, either party may terminate a probationary contract at any time, but observing a notice period of at least fifteen (15) working days if the probation exceeds 3 months, or seven (7) days if less, unless agreed otherwise in writing!\n\nAlways ensure your probation terms are written down. Questions welcome in replies! ⚖️',
    createdAt: '2026-10-08T14:15:00Z',
    legalTopic: 'Labor & Employment',
    tags: ['LaborLawRwanda', 'EmploymentContracts', 'ProbationRights', 'LegalEducation'],
    audience: 'public',
    attachments: [
      {
        type: 'law_reference',
        url: '#law-66-2018',
        name: 'Law N° 66/2018 - Article 18 (Probationary Contract)',
        fileSize: 'Statutory Extract'
      }
    ],
    likesCount: 238,
    repliesCount: 46,
    repostsCount: 89,
    quotesCount: 18,
    likedBy: ['user_eric_citizen'],
    repostedBy: ['user_eric_citizen'],
    bookmarkedBy: ['user_eric_citizen']
  },
  {
    id: 'post_3_eric_question',
    authorId: 'user_eric_citizen',
    content: 'Quick question for corporate lawyers here: If we are registering a foreign branch in Kigali via the RDB e-portal, does the parent company resolution need to be notarized by the Rwandan embassy in the host country, or is an apostille certificate sufficient under the 2021 Companies Law?',
    createdAt: '2026-10-08T16:00:00Z',
    legalTopic: 'Commercial & Companies',
    tags: ['RDBRegistration', 'CompanyLaw', 'StartupsRwanda'],
    audience: 'public',
    likesCount: 19,
    repliesCount: 5,
    repostsCount: 3,
    quotesCount: 1,
    likedBy: ['user_aline_advocate'],
    repostedBy: [],
    bookmarkedBy: []
  },
  {
    id: 'post_4_emmanuel_criminal',
    authorId: 'user_emmanuel_advocate',
    content: 'Reminder on Article 29 of the Rwandan Constitution (Right to Legal Counsel):\n\nAny person arrested or detained has an inviolable constitutional right to immediate assistance of legal counsel of their choice from the moment of arrest by RIB (Rwanda Investigation Bureau).\n\nIf you or a family member cannot afford counsel in serious felony proceedings, you have the right to request court-appointed legal aid through the Rwanda Bar Association Legal Aid Committee.',
    createdAt: '2026-10-07T09:20:00Z',
    legalTopic: 'Criminal & Constitutional',
    tags: ['DueProcess', 'ConstitutionalRights', 'RwandaBar', 'LegalAid'],
    audience: 'public',
    likesCount: 310,
    repliesCount: 32,
    repostsCount: 114,
    quotesCount: 25,
    likedBy: ['user_maj_gasabo', 'user_aline_advocate'],
    repostedBy: ['user_maj_gasabo'],
    bookmarkedBy: []
  },
  {
    id: 'post_5_maj_service',
    authorId: 'user_maj_gasabo',
    content: 'Muraho neza! Gasabo District Access to Justice Bureau (MAJ) informs all residents that our legal aid clinic holds walk-in legal advisory sessions every Tuesday and Thursday at the district office.\n\nServices are 100% FREE OF CHARGE. We assist in succession issues, land boundary mediation, labor grievances, and child maintenance orders.\n\nDial 3922 (toll-free) for urgent inquiries.',
    createdAt: '2026-10-06T08:00:00Z',
    legalTopic: 'Legal Aid & Human Rights',
    tags: ['MAJGasabo', 'FreeLegalAid', 'AccessToJustice', 'Kigali'],
    audience: 'public',
    isOfficialAnnouncement: true,
    likesCount: 185,
    repliesCount: 19,
    repostsCount: 78,
    quotesCount: 8,
    likedBy: ['user_eric_citizen'],
    repostedBy: ['user_eric_citizen'],
    bookmarkedBy: ['user_eric_citizen']
  }
];

export const INITIAL_REPLIES: Reply[] = [
  {
    id: 'reply_1',
    postId: 'post_3_eric_question',
    authorId: 'user_aline_advocate',
    content: 'Hello Eric! Under Law N° 007/2021 governing companies, Rwanda is a signatory to the Apostille Convention. If the parent company originates from a Hague Apostille convention country, apostillization is recognized without requiring bilateral consular legalization. However, certified English/French translation is mandatory if the original document is in another language.',
    createdAt: '2026-10-08T16:30:00Z',
    likesCount: 14,
    likedBy: ['user_eric_citizen']
  },
  {
    id: 'reply_2',
    postId: 'post_3_eric_question',
    authorId: 'user_eric_citizen',
    content: 'Me. Aline, thank you very much for this clear clarification! Very helpful for our cross-border compliance.',
    createdAt: '2026-10-08T16:45:00Z',
    likesCount: 3,
    likedBy: ['user_aline_advocate'],
    parentReplyId: 'reply_1'
  },
  {
    id: 'reply_3',
    postId: 'post_2_aline_legal_insight',
    authorId: 'user_eric_citizen',
    content: 'What happens if the employer does not give the 15-day notice? Can the employee claim notice indemnity?',
    createdAt: '2026-10-08T14:40:00Z',
    likesCount: 8,
    likedBy: []
  },
  {
    id: 'reply_4',
    postId: 'post_2_aline_legal_insight',
    authorId: 'user_aline_advocate',
    content: 'Yes! The terminating party must pay compensation equivalent to the remuneration the employee would have received during the notice period (notice indemnity under labor code).',
    createdAt: '2026-10-08T14:55:00Z',
    likesCount: 19,
    likedBy: ['user_eric_citizen']
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm_land_rwanda',
    name: 'Rwanda Land & Property Law Forum',
    kigaliName: 'Iby\'Ubutaka n\'Umutungo mu Rwanda',
    slug: 'land-property-rwanda',
    description: 'Public legal discussion on Law N° 027/2021 governing land in Rwanda, title transfers, parcel subdivision, expropriation in the public interest, and dispute prevention.',
    bannerGradient: 'from-[#064E3B] via-[#047857] to-[#022C22]',
    icon: 'Landmark',
    membersCount: 8940,
    joinedBy: ['user_aline_advocate', 'user_eric_citizen', 'user_maj_gasabo'],
    topic: 'Land & Property',
    rules: [
      'Do not publish confidential land title UPI documents belonging to third parties without consent.',
      'General legal education only; this does not constitute private solicitor representation.',
      'Respectful civic discussion adhering to Rwandan legal standards.'
    ],
    officialSource: 'Rwanda Land Management and Use Authority (RLMUA)',
    moderatorId: 'user_aline_advocate'
  },
  {
    id: 'comm_labor_rwanda',
    name: 'Labor Rights & Workplace Fairness',
    kigaliName: 'Uburenganzira bw\'Abakozi n\'Abakoresha',
    slug: 'labor-workplace-rwanda',
    description: 'Guidance and peer discussions regarding employment contracts, termination, severance pay, occupational health, and maternity leave benefits under Rwandan Labor Law.',
    bannerGradient: 'from-[#1E3A8A] via-[#1D4ED8] to-[#172554]',
    icon: 'Briefcase',
    membersCount: 6510,
    joinedBy: ['user_aline_advocate', 'user_eric_citizen'],
    topic: 'Labor & Employment',
    rules: [
      'Discussions must quote relevant articles of Law N° 66/2018 where applicable.',
      'Defamation or naming specific ongoing confidential labor tribunal parties is strictly prohibited.'
    ],
    officialSource: 'Ministry of Public Service and Labor (MIFOTRA)',
    moderatorId: 'user_aline_advocate'
  },
  {
    id: 'comm_business_rwanda',
    name: 'Startup & Business Compliance Rwanda',
    kigaliName: 'Amategeko y\'Ubucuruzi n\'Isosiyete',
    slug: 'business-compliance-rwanda',
    description: 'Navigating RDB company registration, shareholder agreements, Rwanda Revenue Authority tax procedures, commercial lease agreements, and intellectual property.',
    bannerGradient: 'from-[#312E81] via-[#4338CA] to-[#1E1B4B]',
    icon: 'Building2',
    membersCount: 5120,
    joinedBy: ['user_eric_citizen', 'user_aline_advocate'],
    topic: 'Commercial & Companies',
    rules: [
      'Share actionable insights on RDB filing, corporate governance, and contracts.',
      'No unsolicited spam or non-legal commercial advertising.'
    ],
    officialSource: 'Rwanda Development Board (RDB)',
    moderatorId: 'user_aline_advocate'
  },
  {
    id: 'comm_family_succession',
    name: 'Family, Matrimonial & Succession Law',
    kigaliName: 'Amategeko y\'Umuryango n\'Izungura',
    slug: 'family-succession-rwanda',
    description: 'Understanding matrimonial regimes (community of property, limited community, separation of property) and succession rules under Law N° 32/2016.',
    bannerGradient: 'from-[#701A75] via-[#86198F] to-[#4A044E]',
    icon: 'HeartHandshake',
    membersCount: 7240,
    joinedBy: ['user_maj_gasabo'],
    topic: 'Family & Succession',
    rules: [
      'Protect minors and vulnerable family members; no sharing of domestic dispute identities.',
      'Promote peaceful mediation and lawful inheritance resolution.'
    ],
    officialSource: 'Ministry of Justice (MINIJUST)',
    moderatorId: 'user_maj_gasabo'
  }
];

export const INITIAL_LEGAL_SERVICES: LegalService[] = [
  {
    id: 'serv_1_land_conveyance',
    providerId: 'user_aline_advocate',
    title: 'Land Title Due Diligence & Contract Review',
    description: 'Comprehensive title deed investigation at the Rwanda Land Authority registry (RLMUA/UPI check), encumbrance search, draft or review of authentic bilateral sale agreements, and guidance through the notary transfer process.',
    practiceArea: 'Land & Property Conveyancing',
    formats: ['in_person', 'video'],
    feeRWF: 50000,
    isFeeDisclosed: true,
    feeType: 'fixed',
    turnaroundTime: '2 - 3 business days',
    locationProvince: 'Kigali City',
    languages: ['Kinyarwanda', 'English', 'French'],
    requirements: ['Copy of Land Title (UPI certificate)', 'Seller and Buyer National ID copies', 'Proposed draft contract if available'],
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'serv_2_labor_review',
    providerId: 'user_aline_advocate',
    title: 'Executive Employment Contract Review & Dispute Advisory',
    description: 'Legal vetting of employment contracts, non-compete clauses, probation terms, severance calculation under Law N° 66/2018, and pre-litigation amicable settlement counseling.',
    practiceArea: 'Labor Disputes',
    formats: ['video', 'phone'],
    feeRWF: 30000,
    isFeeDisclosed: true,
    feeType: 'fixed',
    turnaroundTime: '24 hours',
    locationProvince: 'Nationwide',
    languages: ['Kinyarwanda', 'English'],
    requirements: ['Copy of employment contract', 'Termination letter or notice letter (if applicable)'],
    rating: 4.8,
    reviewsCount: 24
  },
  {
    id: 'serv_3_criminal_consultation',
    providerId: 'user_emmanuel_advocate',
    title: 'Pre-Trial Criminal Defense Legal Advisory',
    description: 'Immediate confidential consultation for individuals facing RIB investigations, detention hearings, or summons. Assessment of constitutional safeguards, bail applications, and defense strategy.',
    practiceArea: 'Criminal Defense',
    formats: ['in_person', 'video'],
    feeRWF: 40000,
    isFeeDisclosed: true,
    feeType: 'fixed',
    turnaroundTime: 'Urgent / Same Day',
    locationProvince: 'Kigali City',
    languages: ['Kinyarwanda', 'French', 'English'],
    requirements: ['Summons letter or detention station details', 'National ID of client or family representative'],
    rating: 5.0,
    reviewsCount: 42
  },
  {
    id: 'serv_4_business_incorporation',
    providerId: 'user_aline_advocate',
    title: 'RDB Corporate Structuring & Shareholder Agreement',
    description: 'Tailored drafting of company articles of association, founders agreements, vesting schedules, and RDB regulatory compliance filings.',
    practiceArea: 'Commercial Law',
    formats: ['in_person', 'video'],
    feeRWF: 75000,
    isFeeDisclosed: true,
    feeType: 'fixed',
    turnaroundTime: '3 - 5 business days',
    locationProvince: 'Kigali City',
    languages: ['English', 'Kinyarwanda'],
    requirements: ['Shareholding percentage breakdown', 'Company name ideas', 'Passports/IDs of all shareholders'],
    rating: 4.9,
    reviewsCount: 19
  }
];

export const INITIAL_LEGAL_AID_PROVIDERS: LegalAidProvider[] = [
  {
    id: 'aid_maj_gasabo',
    name: 'Maison d\'Accès à la Justice (MAJ) - Gasabo District',
    type: 'maj_bureau',
    district: 'Gasabo',
    province: 'Kigali City',
    address: 'Gasabo District Administration Office, Remera / Kacyiru, Kigali',
    phone: '+250 788 380 441',
    email: 'gasabo.maj@minijust.gov.rw',
    servicesOffered: [
      'Free legal orientation and advisory to all citizens',
      'Mediation of civil and property conflicts (Abunzi support)',
      'Assistance to victims of Gender-Based Violence (GBV)',
      'Drafting court petitions for indigent individuals'
    ],
    eligibilityCriteria: [
      'All Rwandan citizens and residents residing in Gasabo District',
      'Priority to indigent persons (Ubudehe category 1 and 2), women, children, and persons with disabilities'
    ],
    requiredDocuments: ['National ID card', 'Ubudehe certification (if seeking court representation support)'],
    operatingHours: 'Mon - Fri: 07:00 - 17:00 (Walk-in advisory Tue & Thu)',
    isFreeOfCharge: true,
    officialSource: 'Ministry of Justice (MINIJUST)',
    lastVerifiedDate: 'October 2026'
  },
  {
    id: 'aid_maj_nyarugenge',
    name: 'Maison d\'Accès à la Justice (MAJ) - Nyarugenge District',
    type: 'maj_bureau',
    district: 'Nyarugenge',
    province: 'Kigali City',
    address: 'Nyarugenge District Office, Nyamirambo, Kigali',
    phone: '+250 788 380 442',
    email: 'nyarugenge.maj@minijust.gov.rw',
    servicesOffered: [
      'General legal assistance and counseling',
      'Labor conflict advisory and mediation referrals',
      'Land conflict amicable resolution support',
      'Child support and custody guidance'
    ],
    eligibilityCriteria: ['Residents of Nyarugenge District; free access without discrimination'],
    requiredDocuments: ['National ID card', 'Relevant letters or summons'],
    operatingHours: 'Mon - Fri: 07:00 - 17:00',
    isFreeOfCharge: true,
    officialSource: 'Ministry of Justice (MINIJUST)',
    lastVerifiedDate: 'September 2026'
  },
  {
    id: 'aid_laf_rwanda',
    name: 'Legal Aid Forum (LAF) Rwanda',
    type: 'ngo_clinic',
    district: 'Kicukiro',
    province: 'Kigali City',
    address: 'Kanombe, Kicukiro, KK 31 Ave, Kigali',
    phone: '+250 788 300 234 / Toll-Free: 8435',
    email: 'info@legalaidrwanda.org',
    servicesOffered: [
      'Pro bono legal representation in courts for vulnerable citizens',
      'National toll-free legal advice hotline (8435)',
      'Refugee legal aid programs across camps',
      'Legal literacy workshops and publications'
    ],
    eligibilityCriteria: [
      'Vulnerable citizens unable to afford private advocates',
      'Refugees, displaced persons, and minors'
    ],
    requiredDocuments: ['Proof of indigence / Ubudehe level', 'Court case number if pending'],
    operatingHours: 'Mon - Fri: 08:00 - 17:00',
    isFreeOfCharge: true,
    officialSource: 'Civil Society Coalition / LAF Secretariat',
    lastVerifiedDate: 'August 2026'
  },
  {
    id: 'aid_haguruka',
    name: 'Haguruka NGO - Rights of Women and Children',
    type: 'ngo_clinic',
    district: 'Gasabo',
    province: 'Kigali City',
    address: 'KG 562 St, Kacyiru, Kigali',
    phone: '+250 788 300 355 / Toll-free: 3456',
    email: 'info@haguruka.org.rw',
    servicesOffered: [
      'Legal defense for survivors of gender-based violence',
      'Matrimonial property division counseling',
      'Child maintenance and paternity litigation',
      'Psychosocial and legal counseling'
    ],
    eligibilityCriteria: ['Women, children, and vulnerable families in domestic disputes'],
    requiredDocuments: ['Identity card', 'Marriage certificate or birth certificate if available'],
    operatingHours: 'Mon - Fri: 08:00 - 17:00',
    isFreeOfCharge: true,
    officialSource: 'Haguruka Association',
    lastVerifiedDate: 'September 2026'
  },
  {
    id: 'aid_ur_clinic',
    name: 'University of Rwanda Legal Aid Clinic',
    type: 'university_clinic',
    district: 'Huye',
    province: 'Southern Province',
    address: 'UR Huye Campus, Faculty of Law, Huye',
    phone: '+250 252 530 200',
    email: 'legalclinic@ur.ac.rw',
    servicesOffered: [
      'Supervised law student advisory to local community',
      'Prison outreach and pre-trial rights awareness in Southern Province',
      'Drafting amicable settlement frameworks'
    ],
    eligibilityCriteria: ['Open to low-income residents in Huye and neighboring districts'],
    requiredDocuments: ['National ID'],
    operatingHours: 'Academic semesters: Mon - Fri: 09:00 - 16:00',
    isFreeOfCharge: true,
    officialSource: 'University of Rwanda Faculty of Law',
    lastVerifiedDate: 'July 2026'
  }
];

export const INITIAL_LAWS: LawDocument[] = [
  {
    id: 'law_66_2018_labor',
    title: 'Law N° 66/2018 of 30/08/2018 Regulating Labor in Rwanda',
    titleKinyarwanda: 'Itegeko N° 66/2018 ryo ku wa 30/08/2018 rigenga umurimo mu Rwanda',
    lawNumber: 'Law N° 66/2018',
    officialGazetteNumber: 'Official Gazette Special of 30/08/2018',
    effectiveDate: '30 August 2018',
    category: 'Labor',
    sourceInstitution: 'Parliament of Rwanda & MIFOTRA',
    summaryEn: 'Governs the rights and obligations of employers and workers in the private sector. Covers probation period, maximum working hours (45h/week), annual leave, maternity leave, dismissal procedures, and severance indemnity.',
    summaryRw: 'Rigenga uburenganzira n\'inshingano by\'abakozi n\'abakoresha mu nzego z\'abikorera. Ririmo ibyerekeye igeragezwa, amasaha y\'akazi (45h mu cyumweru), ikiruhuko cy\'umwaka, ikiruhuko cyo kubyara, n\'indishyi yo kwirukanwa.',
    keyArticles: [
      {
        articleNumber: 'Article 17 & 18',
        heading: 'Probationary Contract (Amasezerano y\'igeragezwa)',
        description: 'Probation period cannot exceed six (6) months. Termination during probation requires notice (15 days if over 3 months, 7 days if under 3 months) unless otherwise agreed.'
      },
      {
        articleNumber: 'Article 51',
        heading: 'Weekly Working Hours',
        description: 'Normal working duration shall not exceed forty-five (45) hours per week. Overtime requires extra compensation or compensatory rest.'
      },
      {
        articleNumber: 'Article 31 & 32',
        heading: 'Dismissal and Notice Period',
        description: 'Notice period depends on length of service: 15 days if employed less than 1 year; 30 days if employed 1 to 5 years; 60 days if employed more than 5 years.'
      }
    ],
    isCurrent: true
  },
  {
    id: 'law_027_2021_land',
    title: 'Law N° 027/2021 of 10/06/2021 Governing Land in Rwanda',
    titleKinyarwanda: 'Itegeko N° 027/2021 ryo ku wa 10/06/2021 rigenga ubutaka mu Rwanda',
    lawNumber: 'Law N° 027/2021',
    officialGazetteNumber: 'Official Gazette N° Special of 10/06/2021',
    effectiveDate: '10 June 2021',
    category: 'Land & Property',
    sourceInstitution: 'Parliament of Rwanda & RLMUA',
    summaryEn: 'Defines property rights, state domain, leasehold and freehold tenures, parcel subdivision rules, expropriation safeguards, and mandatory registration through the Land Administration Information System (LAIS).',
    summaryRw: 'Risobanura uburenganzira ku mutungo w\'ubutaka, ubutaka bwa leta, ubukode burambye, kwandikisha ubutaka binyuze muri sisitemu ya LAIS, no kwimura abantu ku nyungu rusange.',
    keyArticles: [
      {
        articleNumber: 'Article 5',
        heading: 'Equality of Rights to Land',
        description: 'All Rwandans have equal rights to land without discrimination based on sex, origin, or socio-economic background.'
      },
      {
        articleNumber: 'Article 24',
        heading: 'Mandatory Land Registration',
        description: 'Every parcel of land in Rwanda must be registered and issued a Unique Parcel Identifier (UPI) with an authentic title deed certificate.'
      },
      {
        articleNumber: 'Article 36',
        heading: 'Subdivision of Agricultural Land',
        description: 'Prohibits parcel subdivision below one hectare (1 ha) for agricultural plots without ministerial waiver to protect agricultural viability.'
      }
    ],
    isCurrent: true
  },
  {
    id: 'law_058_2021_data_privacy',
    title: 'Law N° 058/2021 Relating to the Protection of Personal Data and Privacy',
    titleKinyarwanda: 'Itegeko N° 058/2021 ryerekeye kurengera amakuru bwite n\'ubuzima bwite',
    lawNumber: 'Law N° 058/2021',
    officialGazetteNumber: 'Official Gazette N° 35 bis of 15/10/2021',
    effectiveDate: '15 October 2021',
    category: 'Data Protection & Tech',
    sourceInstitution: 'Parliament of Rwanda & NCSA',
    summaryEn: 'Comprehensive framework governing the collection, processing, storage, and cross-border transfer of personal data in Rwanda. Enforced by the National Cyber Security Authority (NCSA) through the Data Protection Office (DPO).',
    summaryRw: 'Amategeko arengera amakuru bwite y\'abantu, uburenganzira bw\'umuturage ku makuru ye, no gukumira gukoresha amakuru y\'abantu mu buryo butemewe n\'amategeko.',
    keyArticles: [
      {
        articleNumber: 'Article 7',
        heading: 'Consent of the Data Subject',
        description: 'Processing is lawful only if the data subject has given explicit, informed, and unambiguous consent, or for legal compliance.'
      },
      {
        articleNumber: 'Article 26',
        heading: 'Right to Rectification and Erasure',
        description: 'Citizens have the right to inspect, correct, and request deletion of their personal information held by public or private entities.'
      }
    ],
    isCurrent: true
  },
  {
    id: 'law_007_2021_companies',
    title: 'Law N° 007/2021 of 05/02/2021 Governing Companies',
    titleKinyarwanda: 'Itegeko N° 007/2021 ryo ku wa 05/02/2021 rigenga amasosiyete y\'ubucuruzi',
    lawNumber: 'Law N° 007/2021',
    officialGazetteNumber: 'Official Gazette N° 04 of 08/02/2021',
    effectiveDate: '08 February 2021',
    category: 'Commercial & Companies',
    sourceInstitution: 'Parliament of Rwanda & RDB',
    summaryEn: 'Modernized corporate law facilitating one-stop electronic incorporation, single-member companies, virtual general meetings, corporate reorganization, and protection of minority shareholders.',
    summaryRw: 'Itegeko rivuguruye ry\'amasosiyete y\'ubucuruzi ryoroheje kwandikisha isosiyete muri RDB, inama z\'abanyamigabane kuri murandasi, no kurinda abanyamigabane bato.',
    keyArticles: [
      {
        articleNumber: 'Article 12',
        heading: 'Single-Member Company (Isosiyete y\'umuntu umwe)',
        description: 'A private company can be incorporated and owned by a single individual or corporate entity with limited liability.'
      },
      {
        articleNumber: 'Article 88',
        heading: 'Virtual Shareholder Meetings',
        description: 'General assemblies and board meetings may be held electronically without requiring physical presence if statutory notice is provided.'
      }
    ],
    isCurrent: true
  }
];

export const INITIAL_LEGAL_NEWS: LegalNewsItem[] = [
  {
    id: 'news_1_judiciary_iecms',
    title: 'Judiciary of Rwanda Expands Electronic Case Management System (IECMS 3.0)',
    titleRw: 'Urwego rw\'Ubucamanza rwatangije uburyo buvuguruye bwo kuburana kuri murandasi (IECMS 3.0)',
    publisherId: 'user_minijust',
    publisherName: 'Judiciary & Ministry of Justice',
    publishedAt: '2026-10-07T08:00:00Z',
    category: 'Judiciary Circular',
    summary: 'The Supreme Court of Rwanda announces upgraded digital filing, SMS notifications for hearings, and electronic evidence submission across all Intermediate and High Courts.',
    fullBody: 'Under the leadership of the Chief Justice, the Judiciary of Rwanda has officially rolled out version 3.0 of the Integrated Electronic Case Management System (IECMS). The updated system incorporates automated scheduling, real-time summons delivery to parties via verified telephone numbers, and seamless integration with the Rwanda Bar Association advocates registry to verify counsel representation instantly. Advocates and self-represented litigants can access their electronic court dockets 24/7.',
    isOfficialGazetteAlert: false,
    readTimeMinutes: 3
  },
  {
    id: 'news_2_bar_pro_bono',
    title: 'Rwanda Bar Association Commences 2026 Pro Bono Justice Week',
    titleRw: 'Urugaga rw\'Abavoka rwatangije icyumweru cy\'ubufasha mu by\'amategeko ku buntu',
    publisherId: 'user_rba',
    publisherName: 'Rwanda Bar Association',
    publishedAt: '2026-10-05T11:00:00Z',
    category: 'Bar Association',
    summary: 'Over 800 certified advocates will provide free legal advisory and trial representation across all districts in Rwanda from October 12 to October 17, 2026.',
    fullBody: 'The President of the Rwanda Bar Association (Bâtonnier) announced today the commencement of the Annual Pro Bono Justice Week. Working in close collaboration with the Ministry of Justice, advocate teams will be deployed at prisons, district transit centers, and rural community markets to assist detainees who lack legal representation and citizens with unresolved civil disputes.',
    isOfficialGazetteAlert: false,
    readTimeMinutes: 4
  },
  {
    id: 'news_3_gazette_tax',
    title: 'Official Gazette Alert: Publication of New Ministerial Order on Small Claims Conciliation',
    titleRw: 'Igazeti ya Leta: Iteka rya Minisitiri rishya ryerekeye ubwunzi mu manza ziciriritse',
    publisherId: 'user_minijust',
    publisherName: 'MINIJUST / Official Gazette',
    publishedAt: '2026-10-02T14:30:00Z',
    category: 'Regulatory Update',
    summary: 'Ministerial Order N° 004/MO/2026 sets compulsory 30-day amicable conciliation phase for civil disputes under 3,000,000 RWF before filing in Primary Court.',
    fullBody: 'Published in Official Gazette N° 40 of 28/09/2026, this Ministerial Order aims to relieve court congestion and empower community-level dispute resolution. Commercial debts, tenancy arrears, and small contract disputes under 3 million RWF must now undergo formal conciliation with certified mediators before judicial filing.',
    isOfficialGazetteAlert: true,
    readTimeMinutes: 2
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1_eric_aline',
    serviceId: 'serv_1_land_conveyance',
    advocateId: 'user_aline_advocate',
    clientId: 'user_eric_citizen',
    serviceTitle: 'Land Title Due Diligence & Contract Review',
    date: '2026-10-14',
    timeSlot: '10:00 AM - 11:00 AM',
    format: 'in_person',
    feeRWF: 50000,
    status: 'confirmed',
    clientNotes: 'Reviewing a purchase agreement for a commercial plot in Kicukiro Niboye. Seller has provided UPI number.',
    advocateNotes: 'Meeting at Grand Pension Plaza, 7th Floor. Please bring physical copy of the title document if available.',
    locationDetails: 'Grand Pension Plaza, 7th Floor, Office 704, Kigali',
    createdAt: '2026-10-08T09:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    recipientId: 'user_eric_citizen',
    senderId: 'user_aline_advocate',
    type: 'reply',
    referenceId: 'post_3_eric_question',
    message: 'Me. Aline Mugabo replied to your question about RDB foreign branch registration.',
    messageRw: 'Me. Aline Mugabo yashubije ikibazo cyawe ku kwandikisha ishami ry\'isosiyete muri RDB.',
    createdAt: '2026-10-08T16:30:00Z',
    isRead: false
  },
  {
    id: 'notif_2',
    recipientId: 'user_eric_citizen',
    senderId: 'user_aline_advocate',
    type: 'appointment',
    referenceId: 'apt_1_eric_aline',
    message: 'Your consultation with Me. Aline Mugabo has been confirmed for Oct 14, 2026 at 10:00 AM.',
    messageRw: 'Gahunda yawe yo kubonana na Me. Aline Mugabo yemejwe kuwa 14 Ukwakira 2026 saa 10:00 za mugitondo.',
    createdAt: '2026-10-08T11:00:00Z',
    isRead: true
  },
  {
    id: 'notif_3',
    recipientId: 'user_eric_citizen',
    senderId: 'user_minijust',
    type: 'official_update',
    referenceId: 'post_1_minijust_official',
    message: 'Ministry of Justice published a new official communique on Abunzi mediation guidelines.',
    messageRw: 'Minisiteri y\'Ubutabera yatangaje amabwiriza mashya ku bunzi.',
    createdAt: '2026-10-08T10:30:00Z',
    isRead: true
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_eric_aline',
    participantIds: ['user_eric_citizen', 'user_aline_advocate'],
    lastMessageSnippet: 'Thank you Me. Aline, I will bring the draft sale deed on Tuesday.',
    lastMessageAt: '2026-10-08T17:15:00Z',
    unreadCountForUser: {
      'user_eric_citizen': 0,
      'user_aline_advocate': 1
    },
    isPrivilegedLegalNoticeAcknowledged: true
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_eric_aline',
    senderId: 'user_eric_citizen',
    content: 'Good afternoon Me. Aline, I booked an appointment regarding the Kicukiro land plot. Is it fine if I send the draft sale agreement beforehand?',
    createdAt: '2026-10-08T16:50:00Z',
    isRead: true
  },
  {
    id: 'msg_2',
    conversationId: 'conv_eric_aline',
    senderId: 'user_aline_advocate',
    content: 'Good afternoon Eric! Yes, absolutely. Please attach the draft agreement and the parcel UPI number here. As a reminder, our communications are confidential under Bar Association ethics rules.',
    createdAt: '2026-10-08T17:02:00Z',
    isRead: true
  },
  {
    id: 'msg_3',
    conversationId: 'conv_eric_aline',
    senderId: 'user_eric_citizen',
    content: 'Thank you Me. Aline, I will bring the draft sale deed on Tuesday. Looking forward to our consultation!',
    createdAt: '2026-10-08T17:15:00Z',
    isRead: true
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep_1',
    reporterId: 'user_eric_citizen',
    targetType: 'post',
    targetId: 'post_fake_notary',
    targetPreview: 'Guaranteed fake passport and quick land titles without notary attendance in Kigali...',
    category: 'fraud_impersonation',
    details: 'User claiming to issue notarized deeds without going through RLMUA registry. Suspected fraud.',
    createdAt: '2026-10-07T14:00:00Z',
    status: 'pending'
  }
];

export const INITIAL_VERIFICATIONS: VerificationApplication[] = [
  {
    id: 'verif_app_1',
    userId: 'user_applicant_1',
    fullName: 'Me. Patrick Habimana',
    barRollNumber: 'RBA/1890/2023',
    lawFirmName: 'Apex Law Chambers Rwanda',
    yearsOfExperience: 5,
    practiceAreas: ['Commercial Litigation', 'Intellectual Property'],
    diplomaDocumentUrl: 'https://example.com/docs/habimana-llb-degree.pdf',
    barCertificateUrl: 'https://example.com/docs/habimana-rba-certificate.pdf',
    status: 'pending',
    submittedAt: '2026-10-06T11:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit_1',
    adminId: 'user_clarisse_admin',
    action: 'VERIFICATION_APPROVED',
    target: 'Me. Emmanuel Kayitare (RBA/0921/2014)',
    timestamp: '2026-09-15T09:30:00Z',
    details: 'Verified against Rwanda Bar Association official roll. Granted Advocate status.'
  },
  {
    id: 'audit_2',
    adminId: 'user_clarisse_admin',
    action: 'CONTENT_REMOVED',
    target: 'Post #9914 (Spam loan scam)',
    timestamp: '2026-09-28T14:15:00Z',
    details: 'Reported by 4 users. Violated financial fraud policy.'
  }
];
