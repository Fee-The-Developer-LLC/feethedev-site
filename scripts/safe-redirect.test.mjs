import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeReturnPath } from '../lib/safe-redirect.ts';

test('keeps internal paths with query and hash', () => {
  assert.equal(safeReturnPath('/dashboard'), '/dashboard');
  assert.equal(
    safeReturnPath('/checkout/site-build?plan=deposit#pay'),
    '/checkout/site-build?plan=deposit#pay',
  );
  assert.equal(safeReturnPath('/dashboard/admin'), '/dashboard/admin');
});

test('rejects external, protocol-relative and malformed destinations', () => {
  for (const bad of [
    'https://evil.example/',
    'http://evil.example',
    '//evil.example',
    '/\\evil.example',
    '\\\\evil.example',
    'javascript:alert(1)',
    'data:text/html,hi',
    'dashboard',
    '',
    '   ',
    '/da\tshboard',
    '/da\nshboard',
    `/${'a'.repeat(3000)}`,
  ]) {
    assert.equal(safeReturnPath(bad), '/dashboard', bad);
  }
});

test('rejects non-strings', () => {
  for (const bad of [undefined, null, 42, ['/dashboard'], {}]) {
    assert.equal(safeReturnPath(bad), '/dashboard');
  }
});

test('auth routes fall back to prevent redirect loops', () => {
  for (const loop of [
    '/sign-in',
    '/sign-in/factor-one',
    '/sign-up?redirect_url=/x',
    '/SIGN-IN',
    '/./sign-in',
    '/x/../sign-up',
  ]) {
    assert.equal(safeReturnPath(loop), '/dashboard', loop);
  }
  assert.equal(safeReturnPath('/sign-in-help'), '/sign-in-help');
});

test('honours a custom fallback', () => {
  assert.equal(safeReturnPath('//evil.example', '/'), '/');
});
