import fs from 'node:fs/promises';
import { config } from './config.js';

let instructionsPromise;

function getInstructions() {
  instructionsPromise ||= fs.readFile(config.instructionsPath, 'utf8');
  return instructionsPromise;
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text.trim();
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
      else if (typeof content.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

export function normalizePrompt(text) {
  let result = text.trim();
  const fenced = result.match(/^```(?:text)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) result = fenced[1].trim();
  return result;
}

export function validatePrompt(prompt) {
  const required = [
    'For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.',
    'integrated_multimodal_description:',
    'overall_soundscape:',
    'non_diegetic_music: N/A',
  ];
  return required.filter((needle) => !prompt.includes(needle));
}

export async function createVideoPrompt(file) {
  const instructions = await getInstructions();
  const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.xaiApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.xaiModel,
      store: false,
      reasoning: { effort: config.xaiReasoningEffort },
      instructions,
      input: [{
        role: 'user',
        content: [
          { type: 'input_image', image_url: imageUrl, detail: 'high' },
          {
            type: 'input_text',
            text: 'Analyze this uploaded image as the exact first frame. Follow the system instructions exactly and return one finished MiniMax H3 I2VA prompt. Return only the prompt, without analysis, alternatives, or a duration note.',
          },
        ],
      }],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `xAI request failed (${response.status})`;
    throw new Error(message);
  }
  const prompt = normalizePrompt(extractOutputText(payload));
  if (!prompt) throw new Error('Grok returned an empty response.');
  const missing = validatePrompt(prompt);
  if (missing.length) {
    throw new Error(`Grok response failed validation: missing ${missing.join(', ')}`);
  }
  return { prompt, responseId: payload.id || null, model: payload.model || config.xaiModel };
}
