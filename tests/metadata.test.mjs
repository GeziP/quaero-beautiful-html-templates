import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMetadata } from '../scripts/lib/metadata.mjs';
test('invalid metadata cannot enter the index', () => {
  const errors = validateMetadata({ slug: 'wrong', mood: [], scheme: 'sepia', slide_count: 0 }, 'demo');
  assert.ok(errors.some(error => error.includes('slug does not match')));
  assert.ok(errors.some(error => error.includes('mood must')));
  assert.ok(errors.some(error => error.includes('invalid scheme')));
  assert.ok(errors.some(error => error.includes('invalid slide_count')));
});
