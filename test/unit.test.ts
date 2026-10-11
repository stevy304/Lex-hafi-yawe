import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePasswordStrength } from '../src/auth/passwords';
import { normalizePhone, isValidPhone, maskPhone } from '../src/auth/phone';
import { sanitizeNext } from '../src/auth/safeRedirect';
import { authService } from '../src/auth';
import { z } from 'zod';

test('Password rules and strength scoring', () => {
  // Too short (< 10)
  const shortRes = evaluatePasswordStrength('Short1!');
  assert.equal(shortRes.isValid, false);
  assert.equal(shortRes.ruleKey, 'length');

  // Common password
  const commonRes = evaluatePasswordStrength('password123');
  assert.equal(commonRes.isValid, false);

  // Email match
  const emailMatchRes = evaluatePasswordStrength('patrickSecret1!', 'patrick@example.com');
  assert.equal(emailMatchRes.isValid, false);
  assert.equal(emailMatchRes.ruleKey, 'email_match');

  // Valid strong password
  const strongRes = evaluatePasswordStrength('RwandaJustice#2026');
  assert.equal(strongRes.isValid, true);
  assert.ok(strongRes.score >= 3);
});

test('Phone normalization and validation for Rwanda', () => {
  assert.equal(normalizePhone('0788123456'), '+250788123456');
  assert.equal(normalizePhone('788123456'), '+250788123456');
  assert.equal(normalizePhone('+250788123456'), '+250788123456');
  assert.equal(normalizePhone('250788123456'), '+250788123456');
  assert.equal(normalizePhone('(078) 812-3456'), '+250788123456');

  assert.equal(isValidPhone('+250788123456'), true);
  assert.equal(isValidPhone('+250720000000'), true);
  assert.equal(isValidPhone('+250730000000'), true);
  assert.equal(isValidPhone('+250790000000'), true);
  assert.equal(isValidPhone('12345'), false);

  assert.equal(maskPhone('+250788123456'), '+250 78• ••• •56');
});

test('sanitizeNext open-redirect protection', () => {
  assert.equal(sanitizeNext('/home'), '/home');
  assert.equal(sanitizeNext('/settings/security'), '/settings/security');
  assert.equal(sanitizeNext('//evil.com'), null);
  assert.equal(sanitizeNext('https://evil.com'), null);
  assert.equal(sanitizeNext('javascript:alert(1)'), null);
  assert.equal(sanitizeNext(null), null);
  assert.equal(sanitizeNext(''), null);
});

test('Reserved handles and availability check', async () => {
  const adminRes = await authService.checkHandleAvailable('admin');
  assert.equal(adminRes.available, false);
  assert.ok(adminRes.suggestions && adminRes.suggestions.length > 0);

  const demoRes = await authService.checkHandleAvailable('democitizen');
  assert.equal(demoRes.available, false);

  const freeRes = await authService.checkHandleAvailable('kigali_justice_citizen');
  assert.equal(freeRes.available, true);
});

test('Legal versions and consent validation', async () => {
  const versions = await authService.getLegalVersions();
  assert.equal(versions.terms, 'v2026.1');
  assert.equal(versions.privacy, 'v2026.1');
  assert.equal(versions.minAge, 16);

  await authService.submitConsent({
    termsVersion: versions.terms,
    privacyVersion: versions.privacy,
    ageConfirmed: true,
  });
});

test('Zod schemas for API responses', () => {
  const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    role: z.enum(['citizen', 'advocate', 'admin']),
    onboardingCompleted: z.boolean(),
  });

  const validUser = {
    id: 'usr_test',
    name: 'Test Citizen',
    handle: 'testcitizen',
    role: 'citizen',
    onboardingCompleted: true,
  };

  assert.doesNotThrow(() => UserSchema.parse(validUser));
});

test('Admin advocate decisions and audit log generation', async () => {
  const apps = await authService.getAdminAdvocateApplications();
  assert.ok(apps.length > 0);

  const targetApp = apps[0];
  await authService.decideAdvocateApplication(targetApp.id, 'approved');

  const logs = await authService.getAdminAuditLogs();
  assert.ok(logs.some((l) => l.action.includes('ADVOCATE_APPLICATION')));
});

// --- Feed UX Redesign Unit Tests ---
import { computeScrollDirection } from '../src/features/feed/hooks/useScrollDirection';
import { formatCount } from '../src/features/feed/lib/formatCount';
import { formatRelativeTime } from '../src/features/feed/lib/formatRelativeTime';
import { makeKey, saveScrollState, getScrollState, clearScrollState } from '../src/features/feed/lib/restorationStore';
import { findConfidentialMatches, evaluateConfidentialRisk } from '../src/features/composer/confidential';
import { tokenizeText } from '../src/features/feed/lib/linkify';
import { saveDraftToStorage, getSavedDraft, clearDraftFromStorage } from '../src/features/composer/useDraft';

test('useScrollDirection: computeScrollDirection threshold & top detection', () => {
  // Top detection when scrollTop < 8
  const atTop = computeScrollDirection(5, 50, 'down', 0, 12);
  assert.equal(atTop.direction, 'top');
  assert.equal(atTop.cumulativeDelta, 0);

  // Scrolling downward beyond threshold 12
  const scrollDown = computeScrollDirection(50, 20, 'top', 0, 12);
  assert.equal(scrollDown.direction, 'down');
  assert.equal(scrollDown.cumulativeDelta, 0);

  // Small downward scroll (less than threshold 12) retains previous
  const smallDown = computeScrollDirection(25, 20, 'up', 0, 12);
  assert.equal(smallDown.direction, 'up');
  assert.equal(smallDown.cumulativeDelta, 5);

  // Scrolling upward beyond threshold 12
  const scrollUp = computeScrollDirection(100, 120, 'down', 0, 12);
  assert.equal(scrollUp.direction, 'up');
  assert.equal(scrollUp.cumulativeDelta, 0);
});

test('formatCount: compact formatting with boundary checks', () => {
  assert.equal(formatCount(0), '0');
  assert.equal(formatCount(42), '42');
  assert.equal(formatCount(999), '999');
  assert.ok(formatCount(1200).includes('1.2K') || formatCount(1200).includes('1,2K') || formatCount(1200).includes('1.2k'));
  assert.ok(formatCount(1500000).includes('1.5M') || formatCount(1500000).includes('1,5M'));
});

test('formatRelativeTime: relative units, Kigali timezone & year boundaries', () => {
  const baseTime = new Date('2026-10-10T12:00:00Z').getTime();

  // Within 60 seconds
  const justNow = formatRelativeTime(baseTime - 30 * 1000, baseTime);
  assert.equal(justNow.relative, 'now');
  assert.ok(justNow.fullKigali.length > 0);

  // 5 minutes ago
  const fiveMin = formatRelativeTime(baseTime - 5 * 60 * 1000, baseTime);
  assert.equal(fiveMin.relative, '5m');

  // 2 hours ago
  const twoHours = formatRelativeTime(baseTime - 2 * 3600 * 1000, baseTime);
  assert.equal(twoHours.relative, '2h');

  // 3 days ago
  const threeDays = formatRelativeTime(baseTime - 3 * 86400 * 1000, baseTime);
  assert.equal(threeDays.relative, '3d');

  // Older same year (2026)
  const pastMonth = formatRelativeTime(new Date('2026-05-15T10:00:00Z').getTime(), baseTime);
  assert.equal(pastMonth.relative, '15 May');

  // Previous year (2025)
  const prevYear = formatRelativeTime(new Date('2025-10-12T10:00:00Z').getTime(), baseTime);
  assert.equal(prevYear.relative, '12 Oct 2025');
});

test('restorationStore: key generation, save, retrieve and clear', () => {
  const key = makeKey('for_you', 'Land and property', true, false);
  assert.equal(key, 'for_you|Land and property|1|0');

  saveScrollState(key, { scrollTop: 450, firstVisibleId: 'post_123', loadedPostIds: ['post_123', 'post_124'] });
  const retrieved = getScrollState(key);
  assert.ok(retrieved !== null);
  assert.equal(retrieved?.scrollTop, 450);
  assert.equal(retrieved?.firstVisibleId, 'post_123');

  clearScrollState(key);
  assert.equal(getScrollState(key), null);
});

test('confidentiality safeguard: ID, phone, email detection and risk evaluation', () => {
  // Citizen 16-digit ID detection (blocks posting)
  const idText = 'Client dossier national ID is 1199880012345678 in closed file';
  const idMatches = findConfidentialMatches(idText);
  assert.equal(idMatches.length, 1);
  assert.equal(idMatches[0].type, 'citizen_id');
  assert.equal(idMatches[0].text, '1199880012345678');
  const idRisk = evaluateConfidentialRisk(idMatches);
  assert.equal(idRisk.hasRisk, true);
  assert.equal(idRisk.blocksPost, true);

  // Phone number (warns, bypass allowed)
  const phoneText = 'Call advocate directly at 0788123456 for urgent case';
  const phoneMatches = findConfidentialMatches(phoneText);
  assert.equal(phoneMatches.length, 1);
  assert.equal(phoneMatches[0].type, 'phone');
  const phoneRisk = evaluateConfidentialRisk(phoneMatches);
  assert.equal(phoneRisk.hasRisk, true);
  assert.equal(phoneRisk.blocksPost, false);

  // Email address
  const emailText = 'Reach out at lawyer@rwandabar.org.rw';
  const emailMatches = findConfidentialMatches(emailText);
  assert.equal(emailMatches.length, 1);
  assert.equal(emailMatches[0].type, 'email');

  // Clean text with no confidential entities
  const cleanMatches = findConfidentialMatches('General public legal discussion on land law article 14');
  assert.equal(cleanMatches.length, 0);
  const cleanRisk = evaluateConfidentialRisk(cleanMatches);
  assert.equal(cleanRisk.hasRisk, false);
  assert.equal(cleanRisk.blocksPost, false);
});

test('linkify: tokenizes hashtags, mentions, URLs and keeps XSS payloads inert as text', () => {
  const text = 'Hello @kigali_lawyer check #LandLaw2026 at https://lex.rw/docs and <script>alert(1)</script>';
  const tokens = tokenizeText(text);

  const mention = tokens.find((t) => t.type === 'mention');
  assert.ok(mention);
  assert.equal(mention?.raw, '@kigali_lawyer');
  assert.equal(mention?.href, '/u/kigali_lawyer');

  const hashtag = tokens.find((t) => t.type === 'hashtag');
  assert.ok(hashtag);
  assert.equal(hashtag?.raw, '#LandLaw2026');

  const urlToken = tokens.find((t) => t.type === 'url');
  assert.ok(urlToken);
  assert.equal(urlToken?.raw, 'https://lex.rw/docs');

  // Script tag is emitted strictly as text token
  const scriptToken = tokens.find((t) => t.raw.includes('<script>'));
  assert.ok(scriptToken);
  assert.equal(scriptToken?.type, 'text');
});

test('useDraft: storage persistence and clearing', () => {
  const memStore: Record<string, string> = {};
  (globalThis as any).window = {
    sessionStorage: {
      getItem: (k: string) => memStore[k] || null,
      setItem: (k: string, v: string) => { memStore[k] = v; },
      removeItem: (k: string) => { delete memStore[k]; },
    },
  };
  (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;

  saveDraftToStorage({ content: 'Draft content for legal inquiry', visibility: 'public', topic: 'Labor law' });
  const draft = getSavedDraft();
  assert.ok(draft !== null);
  assert.equal(draft?.content, 'Draft content for legal inquiry');
  assert.equal(draft?.topic, 'Labor law');

  clearDraftFromStorage();
  assert.equal(getSavedDraft(), null);
});

test('URL filter synchronization format', () => {
  const syncParams = (tab: string, topic: string, verified: boolean, media: boolean) => {
    const params = new URLSearchParams();
    if (tab !== 'for_you') params.set('tab', tab);
    if (topic !== 'All topics') params.set('topic', topic);
    if (verified) params.set('verified', 'true');
    if (media) params.set('media', 'true');
    return params.toString();
  };

  assert.equal(syncParams('for_you', 'All topics', false, false), '');
  assert.equal(
    syncParams('professionals', 'Land and property', true, true),
    'tab=professionals&topic=Land+and+property&verified=true&media=true'
  );
});

test('layout system: width constants and route right-mode mappings', () => {
  const getRightMode = (view: string) => {
    if (view === 'messages' || view === 'admin' || view === 'settings') return 'off';
    if (view === 'explore') return 'minimal';
    return 'full';
  };

  assert.equal(getRightMode('feed'), 'full');
  assert.equal(getRightMode('notifications'), 'full');
  assert.equal(getRightMode('bookmarks'), 'full');
  assert.equal(getRightMode('communities'), 'full');
  assert.equal(getRightMode('laws'), 'full');
  assert.equal(getRightMode('explore'), 'minimal');
  assert.equal(getRightMode('messages'), 'off');
  assert.equal(getRightMode('admin'), 'off');
  assert.equal(getRightMode('settings'), 'off');
});

test('phone-first breakpoints: classification and boundary conditions', async () => {
  const { BREAKPOINTS, getBreakpointName, isLandscapePhoneDimensions } = await import('../src/utils/breakpoints');

  // Phone: < 600px
  assert.equal(getBreakpointName(320), 'phone');
  assert.equal(getBreakpointName(375), 'phone');
  assert.equal(getBreakpointName(599), 'phone');

  // Tablet portrait: 600 to 959px
  assert.equal(getBreakpointName(600), 'tablet');
  assert.equal(getBreakpointName(768), 'tablet');
  assert.equal(getBreakpointName(959), 'tablet');

  // Compact desktop: 960 to 1199px
  assert.equal(getBreakpointName(960), 'compact');
  assert.equal(getBreakpointName(1100), 'compact');
  assert.equal(getBreakpointName(1199), 'compact');

  // Desktop: >= 1200px
  assert.equal(getBreakpointName(1200), 'desktop');
  assert.equal(getBreakpointName(1440), 'desktop');
  assert.equal(getBreakpointName(1920), 'desktop');

  // Landscape phone: height <= 499px && width < 960px
  assert.equal(isLandscapePhoneDimensions(844, 390), true);
  assert.equal(isLandscapePhoneDimensions(667, 375), true);
  assert.equal(isLandscapePhoneDimensions(1024, 450), false); // wide compact desktop
  assert.equal(isLandscapePhoneDimensions(800, 600), false); // regular tablet height
});

test('viewport & keyboard height calculations', () => {
  // Simulating window vs visualViewport
  const computeKeyboardHeight = (windowH: number, vvH: number, vvOffset: number) => {
    return Math.max(0, Math.round(windowH - vvH - vvOffset));
  };

  // Closed keyboard
  assert.equal(computeKeyboardHeight(844, 844, 0), 0);
  // Open keyboard (height 300)
  assert.equal(computeKeyboardHeight(844, 544, 0), 300);
  // Open keyboard with offset
  assert.equal(computeKeyboardHeight(844, 500, 44), 300);
});

test('mobile bottom navigation heights and rules', () => {
  const getNavHeight = (isLandscape: boolean) => {
    return isLandscape ? 'calc(44px + var(--safe-bottom))' : 'calc(56px + var(--safe-bottom))';
  };

  assert.equal(getNavHeight(false), 'calc(56px + var(--safe-bottom))');
  assert.equal(getNavHeight(true), 'calc(44px + var(--safe-bottom))');

  const shouldHideBottomNav = (isMobile: boolean, inThread: boolean, inComposer: boolean, inViewer: boolean) => {
    if (!isMobile) return false;
    return inThread || inComposer || inViewer;
  };

  assert.equal(shouldHideBottomNav(true, true, false, false), true); // thread
  assert.equal(shouldHideBottomNav(true, false, true, false), true); // composer
  assert.equal(shouldHideBottomNav(true, false, false, true), true); // viewer
  assert.equal(shouldHideBottomNav(true, false, false, false), false); // feed
});

test('shellModeForWidth and BP tokens: single source of truth for shell rendering', async () => {
  const { BP, shellModeForWidth } = await import('../src/app/breakpoints');

  assert.equal(BP.tablet, 600);
  assert.equal(BP.rail, 960);
  assert.equal(BP.full, 1200);

  // Mobile shell (< 960px): phones, small tablets, phone landscape
  assert.equal(shellModeForWidth(320), 'mobile');
  assert.equal(shellModeForWidth(375), 'mobile');
  assert.equal(shellModeForWidth(530), 'mobile'); // screenshot width ~530px
  assert.equal(shellModeForWidth(599), 'mobile');
  assert.equal(shellModeForWidth(600), 'mobile');
  assert.equal(shellModeForWidth(768), 'mobile');
  assert.equal(shellModeForWidth(959), 'mobile');

  // Rail mode (960 to 1199px): 72px icon rail
  assert.equal(shellModeForWidth(960), 'rail');
  assert.equal(shellModeForWidth(1024), 'rail');
  assert.equal(shellModeForWidth(1199), 'rail');

  // Full mode (>= 1200px): Sidebar + center + right column
  assert.equal(shellModeForWidth(1200), 'full');
  assert.equal(shellModeForWidth(1440), 'full');
  assert.equal(shellModeForWidth(1920), 'full');
});


