// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path2 from "path";
import { fileURLToPath } from "url";

// server/db.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// src/data/officialReferences.ts
var OFFICIAL_LAWS = [
  {
    id: "law-66-2018",
    title: "Law N\xB0 66/2018 of 30/08/2018 Regulating Labor in Rwanda",
    titleKinyarwanda: "Itegeko N\xB0 66/2018 ryo kuwa 30/08/2018 Rigenga Umurimo mu Rwanda",
    lawNumber: "Law N\xB0 66/2018",
    officialGazetteNumber: "Special of 30/08/2018",
    effectiveDate: "2018-08-30",
    category: "Labor",
    sourceInstitution: "Parliament of Rwanda / Ministry of Public Service and Labor (MIFOTRA)",
    summaryEn: "Governs employment relations, probation contracts, dismissal procedures, leave entitlements, minimum working conditions, and occupational safety in Rwanda.",
    summaryRw: "Rigenga imibanire y'umurimo, amasezerano yo kwinjizwa mu kazi, kwirukanwa, konji ziteganywa n'amategeko, n'umutekano w'abakozi mu Rwanda.",
    keyArticles: [
      {
        articleNumber: "Article 18",
        heading: "Probationary Contract",
        description: "Probation period cannot exceed six (6) months. Termination requires fifteen (15) days notice if probation exceeds 3 months, or 7 days if less."
      },
      {
        articleNumber: "Article 26",
        heading: "Dismissal on Grounds of Misconduct",
        description: "Requires prior written warning and hearing. Gross misconduct justifies immediate dismissal under strict statutory criteria."
      },
      {
        articleNumber: "Article 31",
        heading: "Severance Allowance (Indemnit\xE9 de licenciement)",
        description: "Statutory calculation of severance pay based on years of continuous service when dismissal is not caused by gross negligence."
      },
      {
        articleNumber: "Article 56",
        heading: "Maternity Leave",
        description: "Grants twelve (12) consecutive weeks of maternity leave with remuneration under RSSB maternity fund scheme."
      }
    ],
    pdfUrl: "https://mifotra.gov.rw/laws/labor-law-66-2018.pdf",
    isCurrent: true
  },
  {
    id: "law-027-2021",
    title: "Law N\xB0 027/2021 of 10/06/2021 Governing Land in Rwanda",
    titleKinyarwanda: "Itegeko N\xB0 027/2021 ryo kuwa 10/06/2021 Rigenga Ubutaka mu Rwanda",
    lawNumber: "Law N\xB0 027/2021",
    officialGazetteNumber: "N\xB0 Special of 10/06/2021",
    effectiveDate: "2021-06-10",
    category: "Land & Property",
    sourceInstitution: "Rwanda Land Management and Use Authority (RLMUA)",
    summaryEn: "Comprehensive framework governing land tenure, leasehold rights, title registration (UPI), parcel subdivision, transfers, and expropriation in the public interest.",
    summaryRw: "Rigenga uburenganzira ku butaka, ihererekanya ry'ubutaka (UPI), igabana ry'ibibanza, no kwimura abantu ku mpamvu z'inyungu rusange.",
    keyArticles: [
      {
        articleNumber: "Article 12",
        heading: "Land Registration & Title Deeds",
        description: "All land in Rwanda must be registered and issued a Unique Parcel Identifier (UPI) through the national cadastre."
      },
      {
        articleNumber: "Article 19",
        heading: "Spousal Consent in Land Transactions",
        description: "Any transfer, mortgage, or lease of matrimonial land requires notarized mutual consent of both spouses under applicable marital property regime."
      },
      {
        articleNumber: "Article 34",
        heading: "Subdivision of Agricultural Land",
        description: "Prohibits subdivision of agricultural parcels below one (1) hectare to safeguard food security, unless specialized zoning permits."
      }
    ],
    pdfUrl: "https://environment.gov.rw/laws/land-law-2021.pdf",
    isCurrent: true
  },
  {
    id: "law-007-2021",
    title: "Law N\xB0 007/2021 of 05/02/2021 Governing Companies in Rwanda",
    titleKinyarwanda: "Itegeko N\xB0 007/2021 ryo kuwa 05/02/2021 Rigenga Amasosiyete y'Ubucuruzi",
    lawNumber: "Law N\xB0 007/2021",
    officialGazetteNumber: "N\xB0 04 bis of 08/02/2021",
    effectiveDate: "2021-02-08",
    category: "Commercial & Companies",
    sourceInstitution: "Rwanda Development Board (RDB) / Registrar General",
    summaryEn: "Governs incorporation of domestic and foreign companies, digital registration via RDB portal, corporate governance, shareholder agreements, and dissolution.",
    summaryRw: "Rigenga ishyirwaho ry'amasosiyete y'ubucuruzi, iyandikwa ryayo binyuze muri RDB, inshingano z'abayobozi n'abanyamigabane.",
    keyArticles: [
      {
        articleNumber: "Article 14",
        heading: "Online Company Incorporation",
        description: "Establishes full legal validity of electronic certificates of incorporation issued by the Registrar General at RDB."
      },
      {
        articleNumber: "Article 92",
        heading: "Duties and Liabilities of Directors",
        description: "Directors owe fiduciary duties of good faith, care, and avoidance of conflicts of interest to the company and stakeholders."
      },
      {
        articleNumber: "Article 248",
        heading: "Recognition of Foreign Corporate Documents (Apostille)",
        description: "Documents legalized via the Apostille Convention are recognized without consular re-authentication."
      }
    ],
    pdfUrl: "https://rdb.rw/laws/company-law-2021.pdf",
    isCurrent: true
  },
  {
    id: "law-058-2021",
    title: "Law N\xB0 058/2021 of 13/10/2021 Relating to the Protection of Personal Data and Privacy",
    titleKinyarwanda: "Itegeko N\xB0 058/2021 ryo kuwa 13/10/2021 Ryerekeye Kurengera Amakuru Bwite n'Ubuzima Bwite",
    lawNumber: "Law N\xB0 058/2021",
    officialGazetteNumber: "N\xB0 Special of 15/10/2021",
    effectiveDate: "2021-10-15",
    category: "Data Protection & Tech",
    sourceInstitution: "National Cyber Security Authority (NCSA)",
    summaryEn: "Establishes rights of data subjects, legal grounds for processing personal data, requirements for data protection officers, and cross-border data transfer rules.",
    summaryRw: "Rigena uburenganzira bw'umuturage ku makuru ye bwite, ibisabwa mu kubika amakuru, n'inshingano z'amasosiyete akora ku makuru.",
    keyArticles: [
      {
        articleNumber: "Article 18",
        heading: "Principles of Data Processing",
        description: "Personal data must be collected lawfully, transparently, for specified legitimate purposes, and kept accurate."
      },
      {
        articleNumber: "Article 48",
        heading: "Cross-Border Transfer Safeguards",
        description: "Personal data may not be transferred outside Rwanda unless adequate protection or authorization from NCSA is proven."
      }
    ],
    pdfUrl: "https://ncsa.gov.rw/laws/data-protection-law-2021.pdf",
    isCurrent: true
  },
  {
    id: "law-68-2018",
    title: "Law N\xB0 68/2018 of 30/08/2018 Determining Offences and Penalties in General",
    titleKinyarwanda: "Itegeko N\xB0 68/2018 ryo kuwa 30/08/2018 Riteganya Ibyaha n'Ibihano muri Rusange",
    lawNumber: "Law N\xB0 68/2018",
    officialGazetteNumber: "Special of 27/09/2018",
    effectiveDate: "2018-09-27",
    category: "Criminal",
    sourceInstitution: "Ministry of Justice (MINIJUST) / Judiciary of Rwanda",
    summaryEn: "General penal code of Rwanda outlining criminal offences, penalties, circumstances of aggravation or mitigation, and rights of defense under due process.",
    summaryRw: "Itegeko ngenga rihana ibyaha muri rusange, rigena ibihano, n'uburenganzira bw'uregwa bwo kwiregura mu rukiko.",
    keyArticles: [
      {
        articleNumber: "Article 29",
        heading: "Presumption of Innocence",
        description: "Any person charged with a criminal offence is presumed innocent until proven guilty according to law in a public hearing."
      },
      {
        articleNumber: "Article 174",
        heading: "Fraud by Deception and Misrepresentation",
        description: "Determines penal sanctions for financial fraud, forgery of public instruments, or unauthorized representation."
      }
    ],
    pdfUrl: "https://minijust.gov.rw/laws/penal-code-2018.pdf",
    isCurrent: true
  }
];
var OFFICIAL_LEGAL_AID_PROVIDERS = [
  {
    id: "aid_maj_gasabo",
    name: "Maison d'Acc\xE8s \xE0 la Justice (MAJ) - Gasabo District",
    type: "maj_bureau",
    district: "Gasabo",
    province: "Kigali City",
    address: "Gasabo District Administration Office, Remera / Kacyiru, Kigali",
    phone: "+250 788 380 441",
    email: "gasabo.maj@minijust.gov.rw",
    servicesOffered: [
      "Free legal orientation and advisory to citizens",
      "Mediation of civil and property conflicts (Abunzi support)",
      "Assistance to victims of Gender-Based Violence (GBV)",
      "Drafting court petitions for indigent individuals"
    ],
    eligibilityCriteria: [
      "All Rwandan citizens and residents residing in Gasabo District",
      "Priority to indigent persons (Ubudehe category 1 and 2), women, and persons with disabilities"
    ],
    requiredDocuments: ["National ID card", "Ubudehe certification (if seeking court representation support)"],
    operatingHours: "Mon - Fri: 07:00 - 17:00 (Walk-in advisory Tue & Thu)",
    isFreeOfCharge: true,
    officialSource: "Ministry of Justice (MINIJUST)",
    lastVerifiedDate: "October 2026"
  },
  {
    id: "aid_maj_nyarugenge",
    name: "Maison d'Acc\xE8s \xE0 la Justice (MAJ) - Nyarugenge District",
    type: "maj_bureau",
    district: "Nyarugenge",
    province: "Kigali City",
    address: "Nyarugenge District Office, Nyamirambo, Kigali",
    phone: "+250 788 380 442",
    email: "nyarugenge.maj@minijust.gov.rw",
    servicesOffered: [
      "General legal assistance and counseling",
      "Labor conflict advisory and mediation referrals",
      "Land conflict amicable resolution support",
      "Child support and custody guidance"
    ],
    eligibilityCriteria: ["Residents of Nyarugenge District; free access without discrimination"],
    requiredDocuments: ["National ID card", "Relevant letters or summons"],
    operatingHours: "Mon - Fri: 07:00 - 17:00",
    isFreeOfCharge: true,
    officialSource: "Ministry of Justice (MINIJUST)",
    lastVerifiedDate: "September 2026"
  },
  {
    id: "aid_laf_rwanda",
    name: "Legal Aid Forum (LAF) Rwanda",
    type: "ngo_clinic",
    district: "Kicukiro",
    province: "Kigali City",
    address: "Kanombe, Kicukiro, KK 31 Ave, Kigali",
    phone: "+250 788 300 234 / Toll-Free: 8435",
    email: "info@legalaidrwanda.org",
    servicesOffered: [
      "Pro bono legal representation in courts for vulnerable citizens",
      "National toll-free legal advice hotline (8435)",
      "Refugee legal aid programs",
      "Legal literacy workshops and publications"
    ],
    eligibilityCriteria: [
      "Vulnerable citizens unable to afford private advocates",
      "Refugees, displaced persons, and minors"
    ],
    requiredDocuments: ["Proof of indigence / Ubudehe level", "Court case number if pending"],
    operatingHours: "Mon - Fri: 08:00 - 17:00",
    isFreeOfCharge: true,
    officialSource: "Civil Society Coalition / LAF Secretariat",
    lastVerifiedDate: "August 2026"
  },
  {
    id: "aid_haguruka",
    name: "Haguruka NGO - Rights of Women and Children",
    type: "ngo_clinic",
    district: "Gasabo",
    province: "Kigali City",
    address: "KG 562 St, Kacyiru, Kigali",
    phone: "+250 788 300 355 / Toll-free: 3456",
    email: "info@haguruka.org.rw",
    servicesOffered: [
      "Legal defense for survivors of gender-based violence",
      "Matrimonial property division counseling",
      "Child maintenance and paternity litigation",
      "Psychosocial and legal counseling"
    ],
    eligibilityCriteria: ["Women, children, and vulnerable families in domestic disputes"],
    requiredDocuments: ["Identity card", "Marriage certificate or birth certificate if available"],
    operatingHours: "Mon - Fri: 08:00 - 17:00",
    isFreeOfCharge: true,
    officialSource: "Haguruka Association",
    lastVerifiedDate: "September 2026"
  },
  {
    id: "aid_ur_clinic",
    name: "University of Rwanda Legal Aid Clinic",
    type: "university_clinic",
    district: "Huye",
    province: "Southern Province",
    address: "UR Huye Campus, Faculty of Law, Huye",
    phone: "+250 252 530 200",
    email: "legalclinic@ur.ac.rw",
    servicesOffered: [
      "Supervised law student advisory to local community",
      "Prison outreach and pre-trial rights awareness in Southern Province",
      "Drafting amicable settlement frameworks"
    ],
    eligibilityCriteria: ["Open to low-income residents in Huye and neighboring districts"],
    requiredDocuments: ["National ID"],
    operatingHours: "Academic semesters: Mon - Fri: 09:00 - 16:00",
    isFreeOfCharge: true,
    officialSource: "University of Rwanda Faculty of Law",
    lastVerifiedDate: "July 2026"
  }
];
var FOUNDATIONAL_COMMUNITIES = [
  {
    id: "comm_land_rwanda",
    name: "Rwanda Land & Property Law Forum",
    kigaliName: "Iby'Ubutaka n'Umutungo mu Rwanda",
    slug: "land-property-rwanda",
    description: "Public legal discussion on Law N\xB0 027/2021 governing land in Rwanda, title transfers, parcel subdivision, expropriation in the public interest, and dispute prevention.",
    bannerGradient: "from-[#064E3B] via-[#047857] to-[#022C22]",
    icon: "Landmark",
    membersCount: 0,
    joinedBy: [],
    topic: "Land & Property",
    rules: [
      "Do not publish confidential land title UPI documents belonging to third parties without consent.",
      "General legal education only; does not replace private solicitor representation.",
      "Respectful civic discussion adhering to Rwandan legal standards."
    ],
    officialSource: "Rwanda Land Management and Use Authority (RLMUA)",
    moderatorId: "admin_lex_hafi"
  },
  {
    id: "comm_labor_rwanda",
    name: "Labor Rights & Workplace Fairness",
    kigaliName: "Uburenganzira bw'Abakozi n'Abakoresha",
    slug: "labor-workplace-rwanda",
    description: "Guidance and peer discussions regarding employment contracts, termination, severance pay, occupational health, and maternity leave benefits under Rwandan Labor Law.",
    bannerGradient: "from-[#1E3A8A] via-[#1D4ED8] to-[#172554]",
    icon: "Briefcase",
    membersCount: 0,
    joinedBy: [],
    topic: "Labor & Employment",
    rules: [
      "Discussions must cite relevant articles of Law N\xB0 66/2018 where applicable.",
      "Naming specific ongoing confidential labor tribunal parties is strictly prohibited."
    ],
    officialSource: "Ministry of Public Service and Labor (MIFOTRA)",
    moderatorId: "admin_lex_hafi"
  },
  {
    id: "comm_business_rwanda",
    name: "Startup & Business Compliance Rwanda",
    kigaliName: "Amategeko y'Ubucuruzi n'Isosiyete",
    slug: "business-compliance-rwanda",
    description: "Navigating RDB company registration, shareholder agreements, Rwanda Revenue Authority tax procedures, commercial lease agreements, and intellectual property.",
    bannerGradient: "from-[#312E81] via-[#4338CA] to-[#1E1B4B]",
    icon: "Building2",
    membersCount: 0,
    joinedBy: [],
    topic: "Commercial & Companies",
    rules: [
      "Share actionable insights on RDB filing, corporate governance, and contracts.",
      "No unsolicited spam or non-legal commercial advertising."
    ],
    officialSource: "Rwanda Development Board (RDB)",
    moderatorId: "admin_lex_hafi"
  },
  {
    id: "comm_family_succession",
    name: "Family, Matrimonial & Succession Law",
    kigaliName: "Amategeko y'Umuryango n'Izungura",
    slug: "family-succession-rwanda",
    description: "Understanding matrimonial regimes (community of property, limited community, separation of property) and succession rules under Law N\xB0 32/2016.",
    bannerGradient: "from-[#701A75] via-[#86198F] to-[#4A044E]",
    icon: "HeartHandshake",
    membersCount: 0,
    joinedBy: [],
    topic: "Family & Succession",
    rules: [
      "Maintain utmost confidentiality regarding family and juvenile matters.",
      "Reference relevant succession statutory guidelines in civil law."
    ],
    officialSource: "Ministry of Justice (MINIJUST)",
    moderatorId: "admin_lex_hafi"
  }
];

// server/db.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "database.json");
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
function generateInitialData() {
  const adminSalt = crypto.randomBytes(16).toString("hex");
  const adminUser = {
    id: "admin_lex_hafi",
    name: "Clarisse Uwamahoro",
    username: "clarisse_admin",
    email: "admin@lexhafi.rw",
    role: "admin",
    isVerified: true,
    verificationType: "official_institution",
    professionalTitle: "Platform Administrator & Compliance Lead",
    bio: "Platform administration, credentials verification, and community trust lead for Lex Hafi Yawe.",
    location: "Kigali, Rwanda",
    languages: ["Kinyarwanda", "English", "French"],
    joinedDate: "Jan 2026",
    followersCount: 0,
    followingCount: 0,
    followingIds: [],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 0
  };
  const credentials = [
    {
      userId: adminUser.id,
      salt: adminSalt,
      passwordHash: hashPassword("AdminPassword123!", adminSalt)
    }
  ];
  return {
    users: [adminUser],
    credentials,
    sessions: [],
    posts: [],
    replies: [],
    communities: JSON.parse(JSON.stringify(FOUNDATIONAL_COMMUNITIES)),
    legalServices: [],
    appointments: [],
    legalAidProviders: JSON.parse(JSON.stringify(OFFICIAL_LEGAL_AID_PROVIDERS)),
    laws: JSON.parse(JSON.stringify(OFFICIAL_LAWS)),
    legalNews: [],
    conversations: [],
    messages: [],
    notifications: [],
    reports: [],
    verificationApplications: [],
    auditLogs: []
  };
}
var Database = class {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        this.sanitizeDatabase();
      } catch (err) {
        console.error("Error reading existing database.json, generating initial database:", err);
        this.data = generateInitialData();
        this.persist();
      }
    } else {
      this.data = generateInitialData();
      this.persist();
    }
  }
  // Purge any residual mock/demo records from legacy runs
  sanitizeDatabase() {
    const demoUserIds = /* @__PURE__ */ new Set([
      "user_aline_advocate",
      "user_emmanuel_advocate",
      "user_minijust",
      "user_rba",
      "user_maj_gasabo",
      "user_eric_citizen"
    ]);
    this.data.users = this.data.users.filter((u) => !demoUserIds.has(u.id));
    this.data.credentials = this.data.credentials.filter((c) => !demoUserIds.has(c.userId));
    if (!this.data.users.some((u) => u.role === "admin")) {
      const adminSalt = crypto.randomBytes(16).toString("hex");
      const adminUser = {
        id: "admin_lex_hafi",
        name: "Clarisse Uwamahoro",
        username: "clarisse_admin",
        email: "admin@lexhafi.rw",
        role: "admin",
        isVerified: true,
        verificationType: "official_institution",
        professionalTitle: "Platform Administrator & Compliance Lead",
        bio: "Platform administration, credentials verification, and community trust lead for Lex Hafi Yawe.",
        location: "Kigali, Rwanda",
        languages: ["Kinyarwanda", "English", "French"],
        joinedDate: "Jan 2026",
        followersCount: 0,
        followingCount: 0,
        followingIds: [],
        mutedUserIds: [],
        blockedUserIds: [],
        postsCount: 0
      };
      this.data.users.unshift(adminUser);
      this.data.credentials.unshift({
        userId: adminUser.id,
        salt: adminSalt,
        passwordHash: hashPassword("AdminPassword123!", adminSalt)
      });
    }
    this.data.posts = this.data.posts.filter((p) => !p.id.startsWith("post_1_") && !p.id.startsWith("post_2_") && !p.id.startsWith("post_3_") && !p.id.startsWith("post_4_") && !p.id.startsWith("post_5_") && !demoUserIds.has(p.authorId));
    this.data.replies = this.data.replies.filter((r) => !r.id.startsWith("reply_") && !demoUserIds.has(r.authorId));
    this.data.legalServices = this.data.legalServices.filter((s) => !demoUserIds.has(s.providerId) && this.data.users.some((u) => u.id === s.providerId));
    this.data.legalNews = this.data.legalNews.filter((n) => !demoUserIds.has(n.publisherId) && this.data.users.some((u) => u.id === n.publisherId));
    this.data.appointments = this.data.appointments.filter(
      (a) => !demoUserIds.has(a.advocateId) && !demoUserIds.has(a.clientId) && this.data.users.some((u) => u.id === a.advocateId) && this.data.users.some((u) => u.id === a.clientId)
    );
    this.data.conversations = this.data.conversations.filter(
      (c) => !c.participantIds.some((id) => demoUserIds.has(id)) && c.participantIds.every((id) => this.data.users.some((u) => u.id === id))
    );
    const validConvIds = new Set(this.data.conversations.map((c) => c.id));
    this.data.messages = this.data.messages.filter(
      (m) => validConvIds.has(m.conversationId) && !demoUserIds.has(m.senderId) && this.data.users.some((u) => u.id === m.senderId)
    );
    this.data.notifications = this.data.notifications.filter(
      (n) => !demoUserIds.has(n.recipientId) && this.data.users.some((u) => u.id === n.recipientId)
    );
    this.data.reports = (this.data.reports || []).filter(
      (r) => !demoUserIds.has(r.reporterId) && this.data.users.some((u) => u.id === r.reporterId) && !r.id.startsWith("rep_1")
    );
    this.data.verificationApplications = (this.data.verificationApplications || []).filter(
      (v) => this.data.users.some((u) => u.id === v.userId) && !v.id.startsWith("verif_app_1")
    );
    this.data.auditLogs = (this.data.auditLogs || []).filter(
      (a) => this.data.users.some((u) => u.id === a.adminId) && !a.id.startsWith("audit_")
    );
    this.data.laws = JSON.parse(JSON.stringify(OFFICIAL_LAWS));
    this.data.legalAidProviders = JSON.parse(JSON.stringify(OFFICIAL_LEGAL_AID_PROVIDERS));
    if (!this.data.communities || this.data.communities.length === 0) {
      this.data.communities = JSON.parse(JSON.stringify(FOUNDATIONAL_COMMUNITIES));
    } else {
      this.data.communities.forEach((c) => {
        c.joinedBy = c.joinedBy.filter((id) => !demoUserIds.has(id));
        c.membersCount = c.joinedBy.length;
      });
    }
    this.data.users.forEach((u) => {
      u.followingIds = (u.followingIds || []).filter((id) => this.data.users.some((other) => other.id === id));
      u.followingCount = u.followingIds.length;
      u.followersCount = this.data.users.filter((other) => other.followingIds?.includes(u.id)).length;
      u.postsCount = this.data.posts.filter((p) => p.authorId === u.id).length;
    });
    this.persist();
  }
  persist() {
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("Failed to persist database to disk:", err);
    }
  }
  // --- Auth & Sessions ---
  createSession(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    this.data.sessions.push({
      token,
      userId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt
    });
    this.persist();
    return token;
  }
  getSession(token) {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.revokeSession(token);
      return null;
    }
    return session;
  }
  revokeSession(token) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist();
  }
  findUserByIdentifier(identifier) {
    const clean = identifier.trim().toLowerCase().replace(/^@/, "");
    return this.data.users.find(
      (u) => u.id.toLowerCase() === clean || u.username.toLowerCase() === clean || u.email && u.email.toLowerCase() === clean
    ) || null;
  }
  authenticate(identifier, password) {
    const user = this.findUserByIdentifier(identifier);
    if (!user) return null;
    const cred = this.data.credentials.find((c) => c.userId === user.id);
    if (!cred) return null;
    const testHash = hashPassword(password, cred.salt);
    if (testHash === cred.passwordHash) {
      return user;
    }
    return null;
  }
  registerUser(userData) {
    const cleanUsername = userData.username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const id = `user_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(userData.password, salt);
    const isAdvocate = userData.role === "advocate";
    const isInstitution = userData.role === "institution";
    const newUser = {
      id,
      name: userData.name.trim(),
      username: cleanUsername,
      email: userData.email.trim(),
      role: userData.role,
      isVerified: false,
      // Verification must be reviewed and approved
      verificationType: void 0,
      barRollNumber: isAdvocate ? userData.barRollNumber : void 0,
      firmName: isAdvocate ? userData.firmName || "Independent Chambers" : void 0,
      professionalTitle: isAdvocate ? "Legal Counsel (Verification Pending)" : userData.role === "legalaid" ? "Legal Aid Officer" : isInstitution ? "Institutional Entity" : "Registered Citizen Member",
      bio: isAdvocate ? `Advocate practicing in Rwanda. Areas of practice: ${userData.practiceAreas?.join(", ") || "Civil & Commercial Law"}.` : "Member of Lex Hafi Yawe Rwanda digital justice platform.",
      location: userData.location || "Kigali, Rwanda",
      languages: ["Kinyarwanda", "English"],
      joinedDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      followersCount: 0,
      followingCount: 2,
      followingIds: ["user_minijust", "user_rba"],
      mutedUserIds: [],
      blockedUserIds: [],
      postsCount: 0,
      practiceAreas: isAdvocate ? userData.practiceAreas || ["Commercial Law", "Land & Property"] : void 0,
      consultationFee: isAdvocate ? 25e3 : void 0,
      consultationFormats: isAdvocate ? ["in_person", "video", "phone"] : void 0
    };
    this.data.users.unshift(newUser);
    this.data.credentials.push({
      userId: id,
      salt,
      passwordHash
    });
    if (isAdvocate && userData.barRollNumber) {
      this.data.verificationApplications.unshift({
        id: `verif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        userId: id,
        fullName: userData.name.trim(),
        barRollNumber: userData.barRollNumber,
        lawFirmName: userData.firmName || "Chambers",
        yearsOfExperience: 3,
        practiceAreas: userData.practiceAreas || ["Commercial Law"],
        diplomaDocumentUrl: "#uploaded-diploma-certificate",
        barCertificateUrl: "#uploaded-rba-roll-cert",
        status: "pending",
        submittedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const token = this.createSession(id);
    this.persist();
    return { user: newUser, token };
  }
  requestPasswordReset(identifier) {
    const user = this.findUserByIdentifier(identifier);
    if (!user) return { success: false };
    const resetToken = crypto.randomBytes(16).toString("hex");
    const expires = Date.now() + 60 * 60 * 1e3;
    let cred = this.data.credentials.find((c) => c.userId === user.id);
    if (!cred) {
      const salt = crypto.randomBytes(16).toString("hex");
      cred = { userId: user.id, salt, passwordHash: hashPassword("Password123!", salt) };
      this.data.credentials.push(cred);
    }
    cred.resetToken = resetToken;
    cred.resetTokenExpires = expires;
    this.persist();
    return { success: true, token: resetToken, email: user.email };
  }
  resetPassword(resetToken, newPassword) {
    const cred = this.data.credentials.find(
      (c) => c.resetToken === resetToken && c.resetTokenExpires && c.resetTokenExpires > Date.now()
    );
    if (!cred) return false;
    cred.salt = crypto.randomBytes(16).toString("hex");
    cred.passwordHash = hashPassword(newPassword, cred.salt);
    cred.resetToken = void 0;
    cred.resetTokenExpires = void 0;
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== cred.userId);
    this.persist();
    return true;
  }
  // --- Users ---
  getUsers() {
    return this.data.users;
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }
  updateUserProfile(userId, updates) {
    const index = this.data.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role;
    delete safeUpdates.isVerified;
    delete safeUpdates.verificationType;
    this.data.users[index] = { ...this.data.users[index], ...safeUpdates };
    this.persist();
    return this.data.users[index];
  }
  toggleFollow(currentUserId, targetUserId) {
    const currentUser = this.getUserById(currentUserId);
    const targetUser = this.getUserById(targetUserId);
    if (!currentUser || !targetUser) throw new Error("User not found");
    if (currentUserId === targetUserId) throw new Error("Cannot follow self");
    const followingIds = currentUser.followingIds || [];
    const isFollowing = followingIds.includes(targetUserId);
    if (isFollowing) {
      currentUser.followingIds = followingIds.filter((id) => id !== targetUserId);
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    } else {
      currentUser.followingIds = [...followingIds, targetUserId];
      currentUser.followingCount += 1;
      targetUser.followersCount += 1;
      this.createNotification({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: "follow",
        message: `${currentUser.name} followed your profile.`,
        messageRw: `${currentUser.name} yatangiye kugukurikira.`
      });
    }
    this.persist();
    return { isFollowing: !isFollowing, currentUser, targetUser };
  }
  // --- Posts ---
  getPosts(filters) {
    let list = [...this.data.posts];
    if (filters?.communityId) {
      list = list.filter((p) => p.communityId === filters.communityId);
    }
    if (filters?.authorId) {
      list = list.filter((p) => p.authorId === filters.authorId);
    }
    if (filters?.topic && filters.topic !== "all") {
      list = list.filter((p) => p.legalTopic === filters.topic);
    }
    if (filters?.tag) {
      list = list.filter((p) => p.tags.includes(filters.tag));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (p) => p.content.toLowerCase().includes(q) || p.legalTopic && p.legalTopic.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getPostById(id) {
    return this.data.posts.find((p) => p.id === id) || null;
  }
  createPost(postData) {
    const author = this.getUserById(postData.authorId);
    if (!author) throw new Error("Author not found");
    let quotedPost;
    if (postData.quotedPostId) {
      quotedPost = this.getPostById(postData.quotedPostId) || void 0;
    }
    const newPost = {
      id: `post_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      authorId: postData.authorId,
      content: postData.content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      legalTopic: postData.legalTopic || void 0,
      tags: postData.tags?.length ? postData.tags : ["LegalDiscussion", "RwandaLaw"],
      audience: postData.audience || "public",
      attachments: postData.attachments?.length ? postData.attachments : void 0,
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      communityId: postData.communityId,
      quotedPostId: postData.quotedPostId,
      quotedPost,
      isOfficialAnnouncement: author.role === "institution"
    };
    this.data.posts.unshift(newPost);
    author.postsCount += 1;
    if (quotedPost && quotedPost.authorId !== postData.authorId) {
      quotedPost.quotesCount += 1;
      this.createNotification({
        recipientId: quotedPost.authorId,
        senderId: postData.authorId,
        type: "quote",
        referenceId: newPost.id,
        message: `${author.name} quoted your legal post.`,
        messageRw: `${author.name} yasubiyemo ubutumwa bwawe abutangaho igitekerezo.`
      });
    }
    this.persist();
    return newPost;
  }
  updatePost(postId, userId, content) {
    const post = this.getPostById(postId);
    if (!post) return null;
    const user = this.getUserById(userId);
    if (post.authorId !== userId && user?.role !== "admin") {
      throw new Error("Not authorized to edit this post");
    }
    post.content = content;
    post.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.persist();
    return post;
  }
  deletePost(postId, userId) {
    const post = this.getPostById(postId);
    if (!post) return false;
    const user = this.getUserById(userId);
    if (post.authorId !== userId && user?.role !== "admin") {
      throw new Error("Not authorized to delete this post");
    }
    this.data.posts = this.data.posts.filter((p) => p.id !== postId);
    const author = this.getUserById(post.authorId);
    if (author) {
      author.postsCount = Math.max(0, author.postsCount - 1);
    }
    this.persist();
    return true;
  }
  toggleLike(postId, userId) {
    const post = this.getPostById(postId);
    const user = this.getUserById(userId);
    if (!post || !user) throw new Error("Post or user not found");
    const hasLiked = post.likedBy.includes(userId);
    if (hasLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;
      if (post.authorId !== userId) {
        this.createNotification({
          recipientId: post.authorId,
          senderId: userId,
          type: "like",
          referenceId: post.id,
          message: `${user.name} reacted to your post on "${post.legalTopic || "Rwanda Law"}".`,
          messageRw: `${user.name} yakunze ubutumwa bwawe.`
        });
      }
    }
    this.persist();
    return { post, liked: !hasLiked };
  }
  toggleRepost(postId, userId) {
    const post = this.getPostById(postId);
    const user = this.getUserById(userId);
    if (!post || !user) throw new Error("Post or user not found");
    const hasReposted = post.repostedBy.includes(userId);
    if (hasReposted) {
      post.repostedBy = post.repostedBy.filter((id) => id !== userId);
      post.repostsCount = Math.max(0, post.repostsCount - 1);
    } else {
      post.repostedBy.push(userId);
      post.repostsCount += 1;
      if (post.authorId !== userId) {
        this.createNotification({
          recipientId: post.authorId,
          senderId: userId,
          type: "repost",
          referenceId: post.id,
          message: `${user.name} reposted your legal post.`,
          messageRw: `${user.name} yongeye gutangaza ubutumwa bwawe.`
        });
      }
    }
    this.persist();
    return { post, reposted: !hasReposted };
  }
  toggleBookmark(postId, userId) {
    const post = this.getPostById(postId);
    if (!post) throw new Error("Post not found");
    const hasBookmarked = post.bookmarkedBy.includes(userId);
    if (hasBookmarked) {
      post.bookmarkedBy = post.bookmarkedBy.filter((id) => id !== userId);
    } else {
      post.bookmarkedBy.push(userId);
    }
    this.persist();
    return { post, bookmarked: !hasBookmarked };
  }
  // --- Replies ---
  getReplies(postId) {
    return this.data.replies.filter((r) => r.postId === postId);
  }
  createReply(postId, authorId, content, parentReplyId) {
    const post = this.getPostById(postId);
    const author = this.getUserById(authorId);
    if (!post || !author) throw new Error("Post or author not found");
    const newReply = {
      id: `reply_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      postId,
      authorId,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      likesCount: 0,
      likedBy: [],
      parentReplyId
    };
    this.data.replies.push(newReply);
    post.repliesCount += 1;
    if (post.authorId !== authorId) {
      this.createNotification({
        recipientId: post.authorId,
        senderId: authorId,
        type: "reply",
        referenceId: postId,
        message: `${author.name} replied to your legal post.`,
        messageRw: `${author.name} yatanze igitekerezo ku butumwa bwawe.`
      });
    }
    this.persist();
    return newReply;
  }
  toggleReplyLike(replyId, userId) {
    const reply = this.data.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("Reply not found");
    const hasLiked = reply.likedBy.includes(userId);
    if (hasLiked) {
      reply.likedBy = reply.likedBy.filter((id) => id !== userId);
      reply.likesCount = Math.max(0, reply.likesCount - 1);
    } else {
      reply.likedBy.push(userId);
      reply.likesCount += 1;
    }
    this.persist();
    return { reply, liked: !hasLiked };
  }
  // --- Communities ---
  getCommunities() {
    return this.data.communities;
  }
  getCommunityById(id) {
    return this.data.communities.find((c) => c.id === id) || null;
  }
  createCommunity(userId, data) {
    const user = this.getUserById(userId);
    if (!user) throw new Error("User not found");
    const newCommunity = {
      id: `comm_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      name: data.name,
      kigaliName: data.kigaliName,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: data.description,
      bannerGradient: "from-[#0F172A] via-[#1E293B] to-[#334155]",
      icon: "Scale",
      membersCount: 1,
      joinedBy: [userId],
      topic: data.topic,
      rules: data.rules,
      officialSource: data.officialSource || "Lex Hafi Yawe Community",
      moderatorId: userId
    };
    this.data.communities.unshift(newCommunity);
    this.persist();
    return newCommunity;
  }
  toggleJoinCommunity(communityId, userId) {
    const comm = this.getCommunityById(communityId);
    if (!comm) throw new Error("Community not found");
    const isJoined = comm.joinedBy.includes(userId);
    if (isJoined) {
      comm.joinedBy = comm.joinedBy.filter((id) => id !== userId);
      comm.membersCount = Math.max(1, comm.membersCount - 1);
    } else {
      comm.joinedBy.push(userId);
      comm.membersCount += 1;
    }
    this.persist();
    return { community: comm, joined: !isJoined };
  }
  // --- Legal Services ---
  getLegalServices() {
    return this.data.legalServices;
  }
  createLegalService(providerId, data) {
    const provider = this.getUserById(providerId);
    if (!provider) throw new Error("Provider not found");
    const newService = {
      id: `serv_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      providerId,
      title: data.title,
      description: data.description,
      practiceArea: data.practiceArea,
      feeRWF: data.feeRWF,
      isFeeDisclosed: true,
      feeType: "fixed",
      formats: data.formats,
      turnaroundTime: data.turnaroundTime,
      locationProvince: data.locationProvince,
      languages: provider.languages || ["Kinyarwanda", "English"],
      requirements: data.requirements,
      rating: 5,
      reviewsCount: 1
    };
    this.data.legalServices.unshift(newService);
    this.persist();
    return newService;
  }
  // --- Appointments ---
  getAppointments(userId) {
    return this.data.appointments.filter((a) => a.clientId === userId || a.advocateId === userId);
  }
  createAppointment(clientId, data) {
    const client = this.getUserById(clientId);
    const advocate = this.getUserById(data.advocateId);
    if (!client || !advocate) throw new Error("Client or Advocate not found");
    const newAppointment = {
      id: `apt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      serviceId: data.serviceId,
      advocateId: data.advocateId,
      clientId,
      serviceTitle: data.serviceTitle,
      date: data.date,
      timeSlot: data.timeSlot,
      format: data.format,
      feeRWF: data.feeRWF,
      status: "confirmed",
      clientNotes: data.clientNotes,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      locationDetails: data.format === "in_person" ? "Chambers / Kigali Office" : "Secure Lex Hafi Video Call"
    };
    this.data.appointments.unshift(newAppointment);
    this.createNotification({
      recipientId: data.advocateId,
      senderId: clientId,
      type: "appointment",
      referenceId: newAppointment.id,
      message: `${client.name} booked a consultation: "${data.serviceTitle}" for ${data.date} at ${data.timeSlot}.`,
      messageRw: `${client.name} yasabye inama: "${data.serviceTitle}" kuwa ${data.date} saa ${data.timeSlot}.`
    });
    const conv = this.getOrCreateConversation(clientId, data.advocateId);
    this.sendMessage(conv.id, clientId, `Hello Me. ${advocate.name.replace(/^Me\.\s*/, "")}! I have booked a legal consultation: "${data.serviceTitle}" scheduled for ${data.date} (${data.timeSlot}). Note: "${data.clientNotes || "Case consultation request"}"`);
    this.persist();
    return newAppointment;
  }
  updateAppointmentStatus(appointmentId, userId, status, notes) {
    const apt = this.data.appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error("Appointment not found");
    if (apt.advocateId !== userId && apt.clientId !== userId) {
      throw new Error("Not authorized to update this appointment");
    }
    apt.status = status;
    if (notes) apt.advocateNotes = notes;
    const targetUserId = userId === apt.advocateId ? apt.clientId : apt.advocateId;
    this.createNotification({
      recipientId: targetUserId,
      senderId: userId,
      type: "appointment",
      referenceId: apt.id,
      message: `Appointment status updated to "${status.toUpperCase()}" for ${apt.serviceTitle}.`,
      messageRw: `Imiterere ya gahunda yahinduwe kuri "${status.toUpperCase()}".`
    });
    this.persist();
    return apt;
  }
  // --- Legal Aid Providers & Laws ---
  getLegalAidProviders() {
    return this.data.legalAidProviders;
  }
  getLaws(category, query) {
    let list = [...this.data.laws];
    if (category && category !== "All") {
      list = list.filter((l) => l.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) => l.title.toLowerCase().includes(q) || l.titleKinyarwanda && l.titleKinyarwanda.toLowerCase().includes(q) || l.lawNumber.toLowerCase().includes(q) || l.summaryEn.toLowerCase().includes(q)
      );
    }
    return list;
  }
  // --- Legal News ---
  getLegalNews() {
    return this.data.legalNews;
  }
  createLegalNews(publisherId, data) {
    const publisher = this.getUserById(publisherId);
    if (!publisher) throw new Error("Publisher not found");
    if (publisher.role !== "institution" && publisher.role !== "admin") {
      throw new Error("Only authorized institutional publishers and administrators can publish official legal circulars");
    }
    const newItem = {
      id: `news_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      title: data.title,
      titleRw: data.titleRw,
      publisherId,
      publisherName: publisher.name,
      publisherAvatar: publisher.avatar,
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      category: data.category,
      summary: data.summary,
      fullBody: data.fullBody,
      officialSourceUrl: data.officialSourceUrl,
      isOfficialGazetteAlert: data.isOfficialGazetteAlert,
      readTimeMinutes: data.readTimeMinutes || 3
    };
    this.data.legalNews.unshift(newItem);
    this.persist();
    return newItem;
  }
  // --- Messaging & Conversations ---
  getConversations(userId) {
    return this.data.conversations.filter((c) => c.participantIds.includes(userId)).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }
  getConversationById(id, userId) {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return null;
    if (!conv.participantIds.includes(userId)) throw new Error("Unauthorized to access this conversation");
    return conv;
  }
  getOrCreateConversation(userId1, userId2) {
    const existing = this.data.conversations.find(
      (c) => c.participantIds.includes(userId1) && c.participantIds.includes(userId2)
    );
    if (existing) return existing;
    const newConv = {
      id: `conv_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      participantIds: [userId1, userId2],
      lastMessageSnippet: "Privileged legal conversation initiated.",
      lastMessageAt: (/* @__PURE__ */ new Date()).toISOString(),
      unreadCountForUser: {
        [userId1]: 0,
        [userId2]: 0
      },
      isPrivilegedLegalNoticeAcknowledged: true
    };
    this.data.conversations.unshift(newConv);
    this.persist();
    return newConv;
  }
  getMessages(conversationId, userId) {
    const conv = this.data.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (!conv.participantIds.includes(userId)) throw new Error("Unauthorized");
    if (conv.unreadCountForUser[userId]) {
      conv.unreadCountForUser[userId] = 0;
      this.persist();
    }
    return this.data.messages.filter((m) => m.conversationId === conversationId);
  }
  sendMessage(conversationId, senderId, content, attachments) {
    const conv = this.data.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (!conv.participantIds.includes(senderId)) throw new Error("Unauthorized");
    const newMsg = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      conversationId,
      senderId,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isRead: false,
      attachments
    };
    this.data.messages.push(newMsg);
    conv.lastMessageSnippet = content.slice(0, 60);
    conv.lastMessageAt = (/* @__PURE__ */ new Date()).toISOString();
    const otherParticipant = conv.participantIds.find((id) => id !== senderId);
    if (otherParticipant) {
      conv.unreadCountForUser[otherParticipant] = (conv.unreadCountForUser[otherParticipant] || 0) + 1;
    }
    this.persist();
    return newMsg;
  }
  // --- Notifications ---
  getNotifications(userId) {
    return this.data.notifications.filter((n) => n.recipientId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  createNotification(data) {
    const newNotif = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      recipientId: data.recipientId,
      senderId: data.senderId,
      type: data.type,
      message: data.message,
      messageRw: data.messageRw,
      referenceId: data.referenceId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isRead: false
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }
  markNotificationAsRead(id, userId) {
    const notif = this.data.notifications.find((n) => n.id === id && n.recipientId === userId);
    if (!notif) return false;
    notif.isRead = true;
    this.persist();
    return true;
  }
  markAllNotificationsAsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (n.recipientId === userId) n.isRead = true;
    });
    this.persist();
  }
  deleteNotification(id, userId) {
    const before = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter((n) => !(n.id === id && n.recipientId === userId));
    const deleted = this.data.notifications.length < before;
    if (deleted) this.persist();
    return deleted;
  }
  // --- Verifications & Moderation ---
  getVerifications(userId) {
    if (userId) {
      const user = this.getUserById(userId);
      if (user?.role === "admin") return this.data.verificationApplications;
      return this.data.verificationApplications.filter((v) => v.userId === userId);
    }
    return this.data.verificationApplications;
  }
  submitVerification(userId, data) {
    const user = this.getUserById(userId);
    if (!user) throw new Error("User not found");
    const app = {
      id: `verif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      userId,
      fullName: user.name,
      barRollNumber: data.barRollNumber,
      lawFirmName: data.lawFirmName,
      yearsOfExperience: data.yearsOfExperience,
      practiceAreas: data.practiceAreas,
      diplomaDocumentUrl: data.diplomaDocumentUrl || "#verified-law-diploma",
      barCertificateUrl: data.barCertificateUrl || "#verified-rba-roll",
      status: "pending",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.verificationApplications.unshift(app);
    this.persist();
    return app;
  }
  reviewVerification(appId, adminId, decision, notes) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Admin role required");
    const app = this.data.verificationApplications.find((v) => v.id === appId);
    if (!app) throw new Error("Verification application not found");
    app.status = decision;
    app.reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
    app.moderatorNotes = notes;
    const applicant = this.getUserById(app.userId);
    if (applicant) {
      if (decision === "approved") {
        applicant.isVerified = true;
        applicant.role = "advocate";
        applicant.verificationType = "bar_member";
        applicant.barRollNumber = app.barRollNumber;
        applicant.firmName = app.lawFirmName;
        applicant.professionalTitle = "Advocate (Rwanda Bar Association)";
      }
      this.createNotification({
        recipientId: app.userId,
        senderId: adminId,
        type: "verification_update",
        referenceId: app.id,
        message: decision === "approved" ? `Congratulations! Your Rwanda Bar credentials (${app.barRollNumber}) have been verified by platform administrators.` : `Your verification application was reviewed: ${notes || "Additional documentation requested."}`
      });
    }
    this.addAuditLog(adminId, `VERIFICATION_${decision.toUpperCase()}`, `Advocate ID ${app.userId} (${app.barRollNumber})`, notes || "Administrative roll review completed.");
    this.persist();
    return app;
  }
  getReports(adminId) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Admin role required");
    return this.data.reports;
  }
  submitReport(reporterId, data) {
    const report = {
      id: `report_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      targetPreview: data.targetPreview,
      category: data.category,
      details: data.details,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    };
    this.data.reports.unshift(report);
    this.persist();
    return report;
  }
  resolveReport(reportId, adminId, actionTaken, notes) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Admin role required");
    const report = this.data.reports.find((r) => r.id === reportId);
    if (!report) throw new Error("Report not found");
    report.status = actionTaken ? "resolved_action_taken" : "resolved_dismissed";
    report.moderatorNotes = notes;
    this.addAuditLog(adminId, "REPORT_RESOLUTION", `Report ${reportId} (${report.category})`, `Action taken: ${actionTaken}. Notes: ${notes}`);
    this.persist();
    return report;
  }
  // --- Audit Logs ---
  getAuditLogs(adminId) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Admin role required");
    return this.data.auditLogs;
  }
  addAuditLog(adminId, action, target, details) {
    const log = {
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      adminId,
      action,
      target,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details
    };
    this.data.auditLogs.unshift(log);
    this.persist();
    return log;
  }
  // --- Admin Stats ---
  getAdminStats(adminId) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Admin role required");
    return {
      totalUsers: this.data.users.length,
      verifiedAdvocates: this.data.users.filter((u) => u.role === "advocate" && u.isVerified).length,
      pendingVerifications: this.data.verificationApplications.filter((v) => v.status === "pending").length,
      totalPosts: this.data.posts.length,
      pendingReports: this.data.reports.filter((r) => r.status === "pending").length,
      totalAppointments: this.data.appointments.length,
      totalCommunities: this.data.communities.length
    };
  }
  // --- Reset/Seed ---
  resetToInitial() {
    this.data = generateInitialData();
    this.persist();
  }
};
var db = new Database();

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split("Bearer ")[1].trim();
  const session = db.getSession(token);
  if (!session) {
    return next();
  }
  const user = db.getUserById(session.userId);
  if (user) {
    req.user = user;
    req.token = token;
  }
  next();
}
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permission denied for this operation" });
    }
    next();
  };
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(authMiddleware);
  const api = express.Router();
  api.post("/auth/login", (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Username and password are required" });
    }
    const user = db.authenticate(identifier, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your username/email and password." });
    }
    const token = db.createSession(user.id);
    res.json({ user, token });
  });
  api.post("/auth/switch-user", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const token = db.createSession(user.id);
    res.json({ user, token });
  });
  api.post("/auth/register", (req, res) => {
    const { name, username, email, password, role, practiceAreas, barRollNumber, firmName, location } = req.body;
    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ error: "Name, username, email, password, and role are required" });
    }
    const existingUser = db.findUserByIdentifier(username);
    if (existingUser) {
      return res.status(409).json({ error: `Username @${username} is already registered.` });
    }
    const existingEmail = db.findUserByIdentifier(email);
    if (existingEmail) {
      return res.status(409).json({ error: `An account with email ${email} already exists.` });
    }
    try {
      const result = db.registerUser({
        name,
        username,
        email,
        password,
        role,
        practiceAreas,
        barRollNumber,
        firmName,
        location
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message || "Registration failed" });
    }
  });
  api.get("/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
  api.post("/auth/logout", requireAuth, (req, res) => {
    if (req.token) {
      db.revokeSession(req.token);
    }
    res.json({ success: true });
  });
  api.post("/auth/forgot-password", (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Email or username is required" });
    }
    const result = db.requestPasswordReset(identifier);
    if (!result.success) {
      return res.status(404).json({ error: "No account found with this identifier" });
    }
    res.json({
      success: true,
      message: "Password reset token generated. In a live system, this is sent via verified email.",
      resetToken: result.token,
      email: result.email
    });
  });
  api.post("/auth/reset-password", (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const success = db.resetPassword(resetToken, newPassword);
    if (!success) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    res.json({ success: true, message: "Password has been reset successfully. You may now sign in." });
  });
  api.get("/users", (req, res) => {
    const query = req.query.q;
    let users = db.getUsers();
    if (query) {
      const q = query.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.practiceAreas && u.practiceAreas.some((p) => p.toLowerCase().includes(q)) || u.professionalTitle && u.professionalTitle.toLowerCase().includes(q)
      );
    }
    res.json(users);
  });
  api.get("/users/:id", (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
  api.patch("/users/profile", requireAuth, (req, res) => {
    try {
      const updated = db.updateUserProfile(req.user.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/users/:id/follow", requireAuth, (req, res) => {
    try {
      const result = db.toggleFollow(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/posts", (req, res) => {
    const { topic, tag, authorId, communityId, q } = req.query;
    const posts = db.getPosts({
      topic,
      tag,
      authorId,
      communityId,
      query: q
    });
    res.json(posts);
  });
  api.get("/posts/:id", (req, res) => {
    const post = db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });
  api.post("/posts", requireAuth, (req, res) => {
    const { content, legalTopic, tags, attachments, audience, communityId, quotedPostId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Post content cannot be empty" });
    }
    try {
      const post = db.createPost({
        authorId: req.user.id,
        content: content.trim(),
        legalTopic,
        tags,
        attachments,
        audience,
        communityId,
        quotedPostId
      });
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.patch("/posts/:id", requireAuth, (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content cannot be empty" });
    }
    try {
      const updated = db.updatePost(req.params.id, req.user.id, content.trim());
      if (!updated) return res.status(404).json({ error: "Post not found" });
      res.json(updated);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  });
  api.delete("/posts/:id", requireAuth, (req, res) => {
    try {
      const success = db.deletePost(req.params.id, req.user.id);
      if (!success) return res.status(404).json({ error: "Post not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  });
  api.post("/posts/:id/like", requireAuth, (req, res) => {
    try {
      const result = db.toggleLike(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.post("/posts/:id/repost", requireAuth, (req, res) => {
    try {
      const result = db.toggleRepost(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.post("/posts/:id/bookmark", requireAuth, (req, res) => {
    try {
      const result = db.toggleBookmark(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/posts/:id/replies", (req, res) => {
    const replies = db.getReplies(req.params.id);
    res.json(replies);
  });
  api.post("/posts/:id/replies", requireAuth, (req, res) => {
    const { content, parentReplyId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Reply content cannot be empty" });
    }
    try {
      const reply = db.createReply(req.params.id, req.user.id, content.trim(), parentReplyId);
      res.status(201).json(reply);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.post("/replies/:id/like", requireAuth, (req, res) => {
    try {
      const result = db.toggleReplyLike(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/communities", (req, res) => {
    res.json(db.getCommunities());
  });
  api.post("/communities", requireAuth, (req, res) => {
    const { name, kigaliName, topic, description, rules, officialSource } = req.body;
    if (!name || !topic || !description) {
      return res.status(400).json({ error: "Name, topic, and description are required" });
    }
    try {
      const comm = db.createCommunity(req.user.id, {
        name,
        kigaliName,
        topic,
        description,
        rules: rules || ["Civic respectful discussion required"],
        officialSource
      });
      res.status(201).json(comm);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/communities/:id/join", requireAuth, (req, res) => {
    try {
      const result = db.toggleJoinCommunity(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/services", (req, res) => {
    res.json(db.getLegalServices());
  });
  api.post("/services", requireAuth, (req, res) => {
    try {
      const svc = db.createLegalService(req.user.id, req.body);
      res.status(201).json(svc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/appointments", requireAuth, (req, res) => {
    res.json(db.getAppointments(req.user.id));
  });
  api.post("/appointments", requireAuth, (req, res) => {
    const { serviceId, advocateId, serviceTitle, date, timeSlot, format, feeRWF, clientNotes } = req.body;
    if (!advocateId || !serviceTitle || !date || !timeSlot || !format) {
      return res.status(400).json({ error: "Missing required appointment parameters" });
    }
    try {
      const apt = db.createAppointment(req.user.id, {
        serviceId,
        advocateId,
        serviceTitle,
        date,
        timeSlot,
        format,
        feeRWF: Number(feeRWF) || 0,
        clientNotes: clientNotes || ""
      });
      res.status(201).json(apt);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.patch("/appointments/:id/status", requireAuth, (req, res) => {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    try {
      const updated = db.updateAppointmentStatus(req.params.id, req.user.id, status, notes);
      res.json(updated);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  });
  api.get("/legalaid", (req, res) => {
    res.json(db.getLegalAidProviders());
  });
  api.get("/laws", (req, res) => {
    const { category, q } = req.query;
    res.json(db.getLaws(category, q));
  });
  api.get("/news", (req, res) => {
    res.json(db.getLegalNews());
  });
  api.post("/news", requireAuth, requireRole(["institution", "admin"]), (req, res) => {
    const { title, titleRw, category, summary, fullBody, isOfficialGazetteAlert, readTimeMinutes, officialSourceUrl } = req.body;
    if (!title || !category || !summary || !fullBody) {
      return res.status(400).json({ error: "Title, category, summary, and full body are required" });
    }
    try {
      const item = db.createLegalNews(req.user.id, {
        title,
        titleRw,
        category,
        summary,
        fullBody,
        isOfficialGazetteAlert: !!isOfficialGazetteAlert,
        readTimeMinutes,
        officialSourceUrl
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/conversations", requireAuth, (req, res) => {
    res.json(db.getConversations(req.user.id));
  });
  api.post("/conversations", requireAuth, (req, res) => {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });
    const conv = db.getOrCreateConversation(req.user.id, recipientId);
    res.json(conv);
  });
  api.get("/conversations/:id/messages", requireAuth, (req, res) => {
    try {
      const msgs = db.getMessages(req.params.id, req.user.id);
      res.json(msgs);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  });
  api.post("/conversations/:id/messages", requireAuth, (req, res) => {
    const { content, attachments } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }
    try {
      const msg = db.sendMessage(req.params.id, req.user.id, content.trim(), attachments);
      res.status(201).json(msg);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  });
  api.get("/notifications", requireAuth, (req, res) => {
    res.json(db.getNotifications(req.user.id));
  });
  api.patch("/notifications/:id/read", requireAuth, (req, res) => {
    const success = db.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ success });
  });
  api.patch("/notifications/read-all", requireAuth, (req, res) => {
    db.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  });
  api.delete("/notifications/:id", requireAuth, (req, res) => {
    const success = db.deleteNotification(req.params.id, req.user.id);
    res.json({ success });
  });
  api.get("/verifications", requireAuth, (req, res) => {
    res.json(db.getVerifications(req.user.id));
  });
  api.post("/verifications", requireAuth, (req, res) => {
    const { barRollNumber, lawFirmName, yearsOfExperience, practiceAreas, diplomaDocumentUrl, barCertificateUrl } = req.body;
    if (!barRollNumber || !lawFirmName) {
      return res.status(400).json({ error: "Bar roll number and firm name are required" });
    }
    try {
      const appRecord = db.submitVerification(req.user.id, {
        barRollNumber,
        lawFirmName,
        yearsOfExperience: Number(yearsOfExperience) || 1,
        practiceAreas: practiceAreas || ["General Practice"],
        diplomaDocumentUrl,
        barCertificateUrl
      });
      res.status(201).json(appRecord);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.patch("/verifications/:id/review", requireAuth, requireRole(["admin"]), (req, res) => {
    const { decision, notes } = req.body;
    if (decision !== "approved" && decision !== "rejected") {
      return res.status(400).json({ error: "Decision must be approved or rejected" });
    }
    try {
      const reviewed = db.reviewVerification(req.params.id, req.user.id, decision, notes);
      res.json(reviewed);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/reports", requireAuth, requireRole(["admin"]), (req, res) => {
    res.json(db.getReports(req.user.id));
  });
  api.post("/reports", requireAuth, (req, res) => {
    const { targetType, targetId, targetPreview, category, details } = req.body;
    if (!targetType || !targetId || !category || !details) {
      return res.status(400).json({ error: "Missing required report fields" });
    }
    try {
      const report = db.submitReport(req.user.id, {
        targetType,
        targetId,
        targetPreview: targetPreview || "Item preview",
        category,
        details
      });
      res.status(201).json(report);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.patch("/reports/:id/resolve", requireAuth, requireRole(["admin"]), (req, res) => {
    const { actionTaken, notes } = req.body;
    try {
      const resolved = db.resolveReport(req.params.id, req.user.id, !!actionTaken, notes || "");
      res.json(resolved);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  api.get("/admin/audit-logs", requireAuth, requireRole(["admin"]), (req, res) => {
    res.json(db.getAuditLogs(req.user.id));
  });
  api.get("/admin/stats", requireAuth, requireRole(["admin"]), (req, res) => {
    res.json(db.getAdminStats(req.user.id));
  });
  api.post("/dev/reset", requireAuth, requireRole(["admin"]), (req, res) => {
    db.resetToInitial();
    res.json({ success: true, message: "Database reset to verified initial state." });
  });
  app.use("/api", api);
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path2.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lex Hafi Yawe production-ready server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
