import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrompt, validatePrompt } from '../src/grok.js';

const valid = `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical smartphone footage. The shot begins from <Picture 1>.

overall_soundscape: Quiet room tone.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.`;

test('normalizePrompt removes a single plain-text fence', () => {
  assert.equal(normalizePrompt(`\`\`\`text\n${valid}\n\`\`\``), valid);
});

test('validatePrompt accepts the required H3 fields', () => {
  assert.deepEqual(validatePrompt(valid), []);
});

test('validatePrompt also accepts N/A for non-diegetic music', () => {
  assert.deepEqual(validatePrompt(valid.replace(
    'non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.',
    'non_diegetic_music: N/A',
  )), []);
});

test('validatePrompt reports missing fields', () => {
  assert.deepEqual(validatePrompt('hello'), [
    'For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.',
    'integrated_multimodal_description:',
    'overall_soundscape:',
    'non_diegetic_music:',
  ]);
});
