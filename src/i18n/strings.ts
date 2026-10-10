export type Lang = 'en' | 'rw' | 'fr';

export interface Translations {
  tag: string;
  h1a: string;
  h1b: string;
  sub: string;
  phone: string;
  google: string;
  or: string;
  label: string;
  cont: string;
  l1: string;
  terms: string;
  l2: string;
  privacy: string;
  newh: string;
  create: string;
  adv: string;
  about: string;
  help: string;
  terms2: string;
  privacy2: string;
  c1: string;
  c2: string;
  c3: string;
  qr: string;
  // Auth & error strings
  back: string;
  password: string;
  signin: string;
  forgot: string;
  showPw: string;
  hidePw: string;
  phoneLabel: string;
  sendCode: string;
  codeSent: string;
  codeLabel: string;
  verify: string;
  resend: string;
  resendIn: string;
  errCreds: string;
  errRate: string;
  errCode: string;
  errNet: string;
  errPhone: string;
  errGoogle: string;
  errGoogleCfg: string;
  errGeneric: string;
  logout: string;
  welcome: string;
  // Signup & Onboarding strings
  stepOf: string;
  alreadyHaveAccount: string;
  continueEmail: string;
  emailPlaceholder: string;
  confirmPassword: string;
  passwordsDoNotMatch: string;
  checkEmailCode: string;
  useDifferentEmail: string;
  fullName: string;
  handle: string;
  handleTaken: string;
  handleReserved: string;
  handleAvailable: string;
  suggestions: string;
  district: string;
  selectDistrict: string;
  accountType: string;
  typeCitizen: string;
  typeAdvocate: string;
  typeInstitution: string;
  typeInstitutionNote: string;
  uploadAvatar: string;
  agreeTerms: string;
  confirmAge: string;
  updatesOptIn: string;
  digestOptIn: string;
  skipForNow: string;
  selectThreeTopics: string;
  suggestedAdvocates: string;
  suggestedCommunities: string;
  follow: string;
  following: string;
  join: string;
  joined: string;
  allSet: string;
  allSetSummary: string;
  goToFeed: string;
  applyAsAdvocate: string;
  // Settings strings
  settings: string;
  profile: string;
  security: string;
  notifications: string;
  privacySection: string;
  languageAppearance: string;
  yourData: string;
  saveChanges: string;
  changesSaved: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  twoStepVerification: string;
  activeSessions: string;
  thisDevice: string;
  revoke: string;
  revokeOthers: string;
  downloadData: string;
  deleteAccount: string;
  deleteConfirmNote: string;
  cancelDeletion: string;
  // Advocate application & admin
  barRollNumber: string;
  practiceAreas: string;
  districtsOfPractice: string;
  yearsOfPractice: string;
  uploadDocuments: string;
  declarationAccurate: string;
  submitApplication: string;
  applicationStatus: string;
  pending: string;
  approved: string;
  rejected: string;
  adminQueue: string;
  reports: string;
  auditLogs: string;
  dismiss: string;
  hidePost: string;
  suspendUser: string;
  draftBanner: string;
  contactSupport: string;
  sendMessage: string;
  messageSent: string;
  tourStep1: string;
  tourStep2: string;
  tourStep3: string;
  gotIt: string;
}

export const STRINGS: Record<Lang, Translations> = {
  en: {
    tag: "Rwanda digital justice",
    h1a: "Know your",
    h1b: "rights.",
    sub: "Verified advocates, official updates, and free legal aid, in Kinyarwanda, English, and French.",
    phone: "Continue with phone",
    google: "Continue with Google",
    or: "or",
    label: "Email or username",
    cont: "Continue",
    l1: "By continuing, you agree to our",
    terms: "Terms of Service",
    l2: "and",
    privacy: "Privacy Policy",
    newh: "New to Lex Hafi Yawe?",
    create: "Create account",
    adv: "Apply as a verified advocate",
    about: "About",
    help: "Help centre",
    terms2: "Terms",
    privacy2: "Privacy",
    c1: "Verified advocates",
    c2: "Free legal aid · dial 3922",
    c3: "Official gazette updates",
    qr: "Scan to get the app",
    back: "Back",
    password: "Password",
    signin: "Sign in",
    forgot: "Forgot password?",
    showPw: "Show password",
    hidePw: "Hide password",
    phoneLabel: "Phone number",
    sendCode: "Send code",
    codeSent: "We sent a 6-digit code to {phone}",
    codeLabel: "6-digit code",
    verify: "Verify",
    resend: "Resend code",
    resendIn: "Resend in {s}s",
    errCreds: "Incorrect email, username, or password.",
    errRate: "Too many attempts. Try again in a few minutes.",
    errCode: "That code is incorrect or expired.",
    errNet: "Can't reach the server. Check your connection and try again.",
    errPhone: "Enter a valid phone number.",
    errGoogle: "Google sign-in was cancelled or failed. Try again.",
    errGoogleCfg: "Google sign-in is not configured.",
    errGeneric: "Something went wrong. Try again.",
    logout: "Log out",
    welcome: "Welcome, {name}",
    stepOf: "Step {current} of {total}",
    alreadyHaveAccount: "Already have an account? Sign in",
    continueEmail: "Continue with email",
    emailPlaceholder: "Enter your email",
    confirmPassword: "Confirm password",
    passwordsDoNotMatch: "Passwords do not match",
    checkEmailCode: "We sent a 6-digit code to {email}",
    useDifferentEmail: "Use a different email",
    fullName: "Full name",
    handle: "Username / handle",
    handleTaken: "This handle is already taken",
    handleReserved: "This handle is reserved",
    handleAvailable: "Handle is available",
    suggestions: "Suggestions",
    district: "District",
    selectDistrict: "Select your district",
    accountType: "Account type",
    typeCitizen: "Citizen: I want legal information and support",
    typeAdvocate: "Legal professional: I'm an advocate or work in law",
    typeInstitution: "Official institution",
    typeInstitutionNote: "Official accounts are created after a manual check",
    uploadAvatar: "Upload photo",
    agreeTerms: "I agree to the Terms of Service and the Privacy Policy",
    confirmAge: "I confirm I am at least {minAge} years old",
    updatesOptIn: "Send me product updates",
    digestOptIn: "Send me monthly legal-awareness digests",
    skipForNow: "Skip for now",
    selectThreeTopics: "Pick at least 3 topics to personalize your legal feed",
    suggestedAdvocates: "Suggested verified advocates",
    suggestedCommunities: "Suggested legal communities",
    follow: "Follow",
    following: "Following",
    join: "Join",
    joined: "Joined",
    allSet: "You're all set, {name}",
    allSetSummary: "Welcome to Lex Hafi Yawe Rwanda. Your digital legal platform is ready.",
    goToFeed: "Go to your feed",
    applyAsAdvocate: "Apply as a verified advocate",
    settings: "Settings",
    profile: "Profile",
    security: "Security",
    notifications: "Notifications",
    privacySection: "Privacy",
    languageAppearance: "Language & appearance",
    yourData: "Your data",
    saveChanges: "Save changes",
    changesSaved: "Changes saved",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    twoStepVerification: "Two-step verification",
    activeSessions: "Active sessions",
    thisDevice: "This device",
    revoke: "Revoke",
    revokeOthers: "Log out of all other devices",
    downloadData: "Download my data",
    deleteAccount: "Delete my account",
    deleteConfirmNote: "Type your handle ({handle}) to confirm deletion. Scheduled for {date}.",
    cancelDeletion: "Cancel deletion",
    barRollNumber: "Bar Roll Number",
    practiceAreas: "Practice areas",
    districtsOfPractice: "Districts of practice",
    yearsOfPractice: "Years of practice",
    uploadDocuments: "Upload bar diploma & certificates",
    declarationAccurate: "I certify that the information and credentials provided are accurate and authentic.",
    submitApplication: "Submit application",
    applicationStatus: "Application status",
    pending: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    adminQueue: "Admin review queue",
    reports: "Reports",
    auditLogs: "Audit logs",
    dismiss: "Dismiss",
    hidePost: "Hide post",
    suspendUser: "Suspend user",
    draftBanner: "Draft: replace with legal-approved text",
    contactSupport: "Contact legal support",
    sendMessage: "Send message",
    messageSent: "Your message has been received. Our team will contact you shortly.",
    tourStep1: "Tap here to publish legal inquiries or updates",
    tourStep2: "Switch between verified advocates and official updates",
    tourStep3: "Search laws, legal aid, and advocates anytime",
    gotIt: "Got it"
  },
  // Kinyarwanda strings (needs native-speaker review)
  rw: {
    tag: "Ubutabera bwa digitale mu Rwanda",
    h1a: "Menya",
    h1b: "uburenganzira bwawe.",
    sub: "Abavoka bemejwe, amakuru ya Leta, n'ubufasha mu by'amategeko bwa buntu, mu Kinyarwanda, Icyongereza n'Igifaransa.",
    phone: "Komeza ukoresheje telefoni",
    google: "Komeza ukoresheje Google",
    or: "cyangwa",
    label: "Imeyili cyangwa izina ukoresha",
    cont: "Komeza",
    l1: "Ukomeje, uba wemeye",
    terms: "Amabwiriza y'imikoreshereze",
    l2: "n'",
    privacy: "Politiki y'ibanga",
    newh: "Uri mushya kuri Lex Hafi Yawe?",
    create: "Fungura konti",
    adv: "Saba kuba umuvoka wemejwe",
    about: "Abo turi bo",
    help: "Ubufasha",
    terms2: "Amabwiriza",
    privacy2: "Ibanga",
    c1: "Abavoka bemejwe",
    c2: "Ubufasha bwa buntu · hamagara 3922",
    c3: "Amakuru y'Igazeti ya Leta",
    qr: "Sikana wakire porogaramu",
    back: "Subira inyuma",
    password: "Ijambobanga",
    signin: "Injira",
    forgot: "Wibagiwe ijambobanga?",
    showPw: "Erekana ijambobanga",
    hidePw: "Hisha ijambobanga",
    phoneLabel: "Numero ya telefoni",
    sendCode: "Ohereza kode",
    codeSent: "Twohereje kode y'imibare 6 kuri {phone}",
    codeLabel: "Kode y'imibare 6",
    verify: "Emeza",
    resend: "Ohereza kode nanone",
    resendIn: "Ongera wohereze nyuma ya {s}s",
    errCreds: "Imeyili, izina cyangwa ijambobanga si byo.",
    errRate: "Wagerageje inshuro nyinshi. Ongera ugerageze nyuma y'iminota mike.",
    errCode: "Iyo kode si yo cyangwa yararangiye.",
    errNet: "Seriveri ntibonetse. Genzura interineti wongere ugerageze.",
    errPhone: "Andika numero ya telefoni yemewe.",
    errGoogle: "Kwinjira na Google ntibyakunze. Ongera ugerageze.",
    errGoogleCfg: "Kwinjira na Google ntibirashyirwaho.",
    errGeneric: "Hari ikitagenze neza. Ongera ugerageze.",
    logout: "Sohoka",
    welcome: "Murakaza neza, {name}",
    stepOf: "Intambwe ya {current} kuri {total}",
    alreadyHaveAccount: "Usanzwe ufite konti? Injira",
    continueEmail: "Komeza ukoresheje imeyili",
    emailPlaceholder: "Injiza imeyili yawe",
    confirmPassword: "Emeza ijambobanga",
    passwordsDoNotMatch: "Amagambo y'ibanga ntabwo ahuye",
    checkEmailCode: "Twohereje kode y'imibare 6 kuri {email}",
    useDifferentEmail: "Koresha indi meyili",
    fullName: "Amazina yose",
    handle: "Izina ry'ikoranabuhanga / handle",
    handleTaken: "Iri zina ryamaze gukoreshwa",
    handleReserved: "Iri zina ryabikiwe urubuga",
    handleAvailable: "Izina riraboneka",
    suggestions: "Ibyifuzo",
    district: "Akarere",
    selectDistrict: "Hitamo akarere kawe",
    accountType: "Ubwoko bwa konti",
    typeCitizen: "Umuturage: Nkeneye amakuru n'ubufasha mu by'amategeko",
    typeAdvocate: "Umwuga w'amategeko: Ndi umuvoka wemewe",
    typeInstitution: "Urwego rwa Leta / Ikigo",
    typeInstitutionNote: "Konti z'inzego zikorerwa isuzuma ry'ubuyobozi mbere yo kwemezwa",
    uploadAvatar: "Shyiraho ifoto",
    agreeTerms: "Nemeye Amabwiriza y'imikoreshereze na Politiki y'ibanga",
    confirmAge: "Ndemeza ko mfite nibura imyaka {minAge}",
    updatesOptIn: "Munjye mwohereza amakuru mashya y'urubuga",
    digestOptIn: "Munjye mwohereza inyigisho z'amategeko buri kwezi",
    skipForNow: "Reka ibi ubu",
    selectThreeTopics: "Hitamo nibura ingingo 3 z'amategeko zikunogeye",
    suggestedAdvocates: "Abavoka bemejwe bagiriwe inama",
    suggestedCommunities: "Imiryango y'amategeko yagiriwe inama",
    follow: "Kurikira",
    following: "Urakurikira",
    join: "Yinjiremo",
    joined: "Wamaze kwinjiramo",
    allSet: "Byose biratunganijwe, {name}",
    allSetSummary: "Murakaza neza kuri Lex Hafi Yawe Rwanda. Urubuga rwawe ruriteguye.",
    goToFeed: "Komeza ku rukuta nyamukuru",
    applyAsAdvocate: "Saba kuba umuvoka wemejwe",
    settings: "Igenamiterere",
    profile: "Umwirondoro",
    security: "Umutekano",
    notifications: "Imenyesha",
    privacySection: "Ibanga",
    languageAppearance: "Ururimi n'ishusho",
    yourData: "Amakuru yawe",
    saveChanges: "Bika impinduka",
    changesSaved: "Impinduka zabitswe",
    changePassword: "Hindura ijambobanga",
    currentPassword: "Ijambobanga ry'ubu",
    newPassword: "Ijambobanga rishya",
    twoStepVerification: "Umutekano w'intambwe ebyiri",
    activeSessions: "Aho konti yawe ifunguye",
    thisDevice: "Iki gikoresho",
    revoke: "Funga",
    revokeOthers: "Sohoka ku bindi bikoresho byose",
    downloadData: "Kura amakuru yanjye hano",
    deleteAccount: "Siba konti yanjye",
    deleteConfirmNote: "Andika izina ryawe ({handle}) kugira ngo wemeze isibwa. Riteganyijwe ku wa {date}.",
    cancelDeletion: "Hagarika isibwa",
    barRollNumber: "Numero mu Rugaga rw'Abavoka",
    practiceAreas: "Amashami y'amategeko ukoramo",
    districtsOfPractice: "Uturere ukoreramo",
    yearsOfPractice: "Imyaka umaze mu mwuga",
    uploadDocuments: "Shyiraho impamyabushobozi n'icyemezo cy'Urugaga",
    declarationAccurate: "Ndemeza ko amakuru n'inyandiko natanze ari ukuri kandi byizewe.",
    submitApplication: "Ohereza ubusabe",
    applicationStatus: "Imiterere y'ubusabe",
    pending: "Buri gusuzumwa",
    approved: "Byemejwe",
    rejected: "Byanzwe",
    adminQueue: "Urutonde rw'isuzuma ry'ubuyobozi",
    reports: "Raporo z'abakoresha",
    auditLogs: "Inyandiko z'ubugenzuzi",
    dismiss: "Komeza nta gihindutse",
    hidePost: "Hisha ubu butumwa",
    suspendUser: "Hagarika uyu mukoresha",
    draftBanner: "Inyandiko y'igerageza: Izamusimbuzwa n'amategeko yemewe n'abanyamategeko",
    contactSupport: "Vugana n'ubufasha mu by'amategeko",
    sendMessage: "Ohereza ubutumwa",
    messageSent: "Ubutumwa bwawe bwakiriwe. Itsinda ryacu rirakuvugisha vuba.",
    tourStep1: "Kanda hano wandike ikibazo cyangwa amakuru y'amategeko",
    tourStep2: "Hinduranya hagati y'abavoka bemejwe n'amategeko ya Leta",
    tourStep3: "Shakisha amategeko n'ubufasha igihe cyose",
    gotIt: "Nabyumvise"
  },
  fr: {
    tag: "Justice numérique du Rwanda",
    h1a: "Connaissez",
    h1b: "vos droits.",
    sub: "Avocats vérifiés, actualités officielles et aide juridique gratuite, en kinyarwanda, en anglais et en français.",
    phone: "Continuer avec le téléphone",
    google: "Continuer avec Google",
    or: "ou",
    label: "E-mail ou nom d'utilisateur",
    cont: "Continuer",
    l1: "En continuant, vous acceptez nos",
    terms: "Conditions d'utilisation",
    l2: "et notre",
    privacy: "Politique de confidentialité",
    newh: "Nouveau sur Lex Hafi Yawe ?",
    create: "Créer un compte",
    adv: "Devenir avocat vérifié",
    about: "À propos",
    help: "Centre d'aide",
    terms2: "Conditions",
    privacy2: "Confidentialité",
    c1: "Avocats vérifiés",
    c2: "Aide juridique gratuite · composez le 3922",
    c3: "Journal officiel en direct",
    qr: "Scannez pour obtenir l'app",
    back: "Retour",
    password: "Mot de passe",
    signin: "Se connecter",
    forgot: "Mot de passe oublié ?",
    showPw: "Afficher le mot de passe",
    hidePw: "Masquer le mot de passe",
    phoneLabel: "Numéro de téléphone",
    sendCode: "Envoyer le code",
    codeSent: "Nous avons envoyé un code à 6 chiffres au {phone}",
    codeLabel: "Code à 6 chiffres",
    verify: "Vérifier",
    resend: "Renvoyer le code",
    resendIn: "Renvoyer dans {s} s",
    errCreds: "E-mail, nom d'utilisateur ou mot de passe incorrect.",
    errRate: "Trop de tentatives. Réessayez dans quelques minutes.",
    errCode: "Ce code est incorrect ou expiré.",
    errNet: "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
    errPhone: "Saisissez un numéro de téléphone valide.",
    errGoogle: "La connexion Google a échoué ou a été annulée. Réessayez.",
    errGoogleCfg: "La connexion Google n'est pas configurée.",
    errGeneric: "Une erreur s'est produite. Réessayez.",
    logout: "Se déconnecter",
    welcome: "Bienvenue, {name}",
    stepOf: "Étape {current} sur {total}",
    alreadyHaveAccount: "Vous avez déjà un compte ? Se connecter",
    continueEmail: "Continuer avec l'e-mail",
    emailPlaceholder: "Entrez votre e-mail",
    confirmPassword: "Confirmer le mot de passe",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    checkEmailCode: "Nous avons envoyé un code à 6 chiffres à {email}",
    useDifferentEmail: "Utiliser un autre e-mail",
    fullName: "Nom complet",
    handle: "Nom d'utilisateur / identifiant",
    handleTaken: "Cet identifiant est déjà pris",
    handleReserved: "Cet identifiant est réservé",
    handleAvailable: "Identifiant disponible",
    suggestions: "Suggestions",
    district: "District",
    selectDistrict: "Sélectionnez votre district",
    accountType: "Type de compte",
    typeCitizen: "Citoyen : Je souhaite des informations et de l'aide juridique",
    typeAdvocate: "Professionnel du droit : Je suis avocat ou juriste",
    typeInstitution: "Institution officielle",
    typeInstitutionNote: "Les comptes institutionnels sont validés après vérification manuelle",
    uploadAvatar: "Téléverser une photo",
    agreeTerms: "J'accepte les Conditions d'utilisation et la Politique de confidentialité",
    confirmAge: "Je confirme avoir au moins {minAge} ans",
    updatesOptIn: "Recevoir les actualités du produit",
    digestOptIn: "Recevoir la lettre d'information juridique mensuelle",
    skipForNow: "Passer pour l'instant",
    selectThreeTopics: "Choisissez au moins 3 thèmes juridiques d'intérêt",
    suggestedAdvocates: "Avocats vérifiés recommandés",
    suggestedCommunities: "Communautés juridiques recommandées",
    follow: "Suivre",
    following: "Abonné",
    join: "Rejoindre",
    joined: "Membre",
    allSet: "Tout est prêt, {name}",
    allSetSummary: "Bienvenue sur Lex Hafi Yawe Rwanda. Votre plateforme juridique est prête.",
    goToFeed: "Accéder à votre fil d'actualité",
    applyAsAdvocate: "Devenir avocat vérifié",
    settings: "Paramètres",
    profile: "Profil",
    security: "Sécurité",
    notifications: "Notifications",
    privacySection: "Confidentialité",
    languageAppearance: "Langue et apparence",
    yourData: "Vos données",
    saveChanges: "Enregistrer",
    changesSaved: "Modifications enregistrées",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    twoStepVerification: "Vérification en deux étapes",
    activeSessions: "Sessions actives",
    thisDevice: "Cet appareil",
    revoke: "Révoquer",
    revokeOthers: "Déconnecter tous les autres appareils",
    downloadData: "Télécharger mes données",
    deleteAccount: "Supprimer mon compte",
    deleteConfirmNote: "Tapez votre identifiant ({handle}) pour confirmer. Suppression prévue le {date}.",
    cancelDeletion: "Annuler la suppression",
    barRollNumber: "Numéro de tableau de l'Ordre",
    practiceAreas: "Domaines d'expertise",
    districtsOfPractice: "Districts d'exercice",
    yearsOfPractice: "Années d'exercice",
    uploadDocuments: "Téléverser le diplôme et certificat d'inscription",
    declarationAccurate: "Je certifie sur l'honneur l'exactitude des informations et titres fournis.",
    submitApplication: "Soumettre la candidature",
    applicationStatus: "Statut de la demande",
    pending: "En attente de révision",
    approved: "Approuvé",
    rejected: "Rejeté",
    adminQueue: "File d'attente d'administration",
    reports: "Signalements",
    auditLogs: "Journal d'audit",
    dismiss: "Ignorer",
    hidePost: "Masquer la publication",
    suspendUser: "Suspendre l'utilisateur",
    draftBanner: "Projet préliminaire : à remplacer par le texte validé juridiquement",
    contactSupport: "Contacter le support juridique",
    sendMessage: "Envoyer le message",
    messageSent: "Votre message a été transmis. Notre équipe vous répondra sous peu.",
    tourStep1: "Appuyez ici pour publier une question ou une information juridique",
    tourStep2: "Naviguez entre les avocats vérifiés et les textes officiels",
    tourStep3: "Recherchez les lois, l'aide juridique et les avocats à tout moment",
    gotIt: "Compris"
  }
};
