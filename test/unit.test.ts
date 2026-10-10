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
