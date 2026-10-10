import React, { useState } from 'react';
import { z } from 'zod';
import { authService } from '../../auth';

const LegalVersionsSchema = z.object({
  terms: z.string(),
  privacy: z.string(),
  minAge: z.number().min(16),
});

const HandleAvailableSchema = z.object({
  available: z.boolean(),
  suggestions: z.array(z.string()).optional(),
});

const OnboardingStateSchema = z.object({
  step: z.enum(['profile', 'consent', 'interests', 'follow', 'done']),
  completed: z.boolean(),
  data: z.any().optional(),
});

const SessionsListSchema = z.array(
  z.object({
    id: z.string(),
    device: z.string(),
    browser: z.string(),
    ipMasked: z.string(),
    lastActive: z.string(),
    isCurrent: z.boolean(),
  })
);

export const DebugPage: React.FC = () => {
  const [results, setResults] = useState<Array<{ name: string; status: 'pending' | 'pass' | 'fail'; message?: string }>>([]);

  const runContractChecks = async () => {
    const list: Array<{ name: string; status: 'pending' | 'pass' | 'fail'; message?: string }> = [];

    // 1. Legal Versions Contract
    try {
      const lv = await authService.getLegalVersions();
      LegalVersionsSchema.parse(lv);
      list.push({ name: 'GET /legal/versions (Zod schema)', status: 'pass' });
    } catch (err: any) {
      list.push({ name: 'GET /legal/versions (Zod schema)', status: 'fail', message: err.message });
    }

    // 2. Handle Availability Contract
    try {
      const ha = await authService.checkHandleAvailable('testuser');
      HandleAvailableSchema.parse(ha);
      list.push({ name: 'GET /auth/handle-available (Zod schema)', status: 'pass' });
    } catch (err: any) {
      list.push({ name: 'GET /auth/handle-available (Zod schema)', status: 'fail', message: err.message });
    }

    // 3. Onboarding State Contract
    try {
      const os = await authService.getOnboardingState();
      OnboardingStateSchema.parse(os);
      list.push({ name: 'GET /onboarding (Zod schema)', status: 'pass' });
    } catch (err: any) {
      list.push({ name: 'GET /onboarding (Zod schema)', status: 'fail', message: err.message });
    }

    // 4. Sessions List Contract
    try {
      const sess = await authService.getSessions();
      SessionsListSchema.parse(sess);
      list.push({ name: 'GET /auth/sessions (Zod schema)', status: 'pass' });
    } catch (err: any) {
      list.push({ name: 'GET /auth/sessions (Zod schema)', status: 'fail', message: err.message });
    }

    setResults(list);
  };

  return (
    <div style={{ padding: '32px 20px', maxWidth: '720px', margin: '0 auto', fontFamily: 'monospace', color: 'var(--text)' }}>
      <h1>Lex Hafi Yawe • API Contract Debugger</h1>
      <p style={{ color: 'var(--muted)' }}>
        Validates backend responses and mock adapter outputs against Zod schemas.
      </p>

      <button type="button" className="go" onClick={runContractChecks} style={{ marginBottom: '20px' }}>
        Run Zod Contract Tests
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${r.status === 'pass' ? '#22c55e' : '#ef4444'}`,
              background: r.status === 'pass' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            }}
          >
            <b>{r.status === 'pass' ? 'PASS' : 'FAIL'}:</b> {r.name}
            {r.message && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{r.message}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
