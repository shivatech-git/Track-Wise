// Local sentence embeddings with Transformers.js — no API key, no rate limits,
// resume text never leaves the server. Model: all-MiniLM-L6-v2 (384 dims).
//
// The model (~90MB) downloads once on first use and is cached to disk, then the
// pipeline is held as a module singleton so later calls are fast.

import { pipeline } from "@xenova/transformers";

let extractorPromise = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractorPromise;
}

/**
 * Turn text into a 384-dim normalized embedding.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embed(text) {
  const extractor = await getExtractor();
  // Mean-pool token vectors and L2-normalize -> a single sentence vector.
  const output = await extractor(text.slice(0, 8000), {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data);
}

/**
 * Cosine similarity. Inputs are already normalized, so this is just a dot
 * product, but we guard the general case. Returns a value in [-1, 1].
 */
export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Map cosine similarity (~0.0–0.8 in practice) to a friendly 0–100 fit score. */
export function toFitScore(similarity) {
  // Resume/JD pairs rarely exceed ~0.7 cosine, so we scale for a usable spread.
  const scaled = Math.round((similarity / 0.75) * 100);
  return Math.max(0, Math.min(100, scaled));
}
