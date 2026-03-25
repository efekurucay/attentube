#!/usr/bin/env node
/**
 * Attentube — Config Generator
 *
 * Reads YOUTUBE_API_KEY from .env (or process.env) and writes
 * a gitignored config.js that injects the key at runtime.
 *
 * Usage:
 *   node scripts/generate-config.js
 *
 * Requires: .env file with YOUTUBE_API_KEY=<your_key>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env if it exists
const envPath = resolve(ROOT, '.env');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey || apiKey === 'your_youtube_data_api_v3_key_here') {
  console.error('❌  YOUTUBE_API_KEY not set in .env');
  console.error('    Copy .env.example to .env and fill in your key.');
  process.exit(1);
}

const output = `/**
 * Attentube — Runtime Configuration (auto-generated, gitignored)
 * Generated: ${new Date().toISOString()}
 * DO NOT COMMIT THIS FILE.
 */
window.ATTENTUBE_CONFIG = {
  apiKey: ${JSON.stringify(apiKey)},
};
`;

const outPath = resolve(ROOT, 'config.js');
writeFileSync(outPath, output, 'utf8');
console.log('✅  config.js generated successfully.');
