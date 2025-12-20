// Helper for resolving background media overlays from URL sources.
//
// This module lives in the background domain layer and MUST contain
// all URL classification / resolution logic for background media
// overlays. UI components (including modals) may call this helper
// but must not inspect URL structure or media types directly.

import type { BackgroundMediaOverlayConfig, UrlMediaConfig } from './media-overlay.types';
import { mediaOverlayContract } from './media-overlay.contract';

export type BackgroundMediaUrlKind = 'direct' | 'youtube' | 'pinterest' | 'unknown';

export type ResolveErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_URL'
  | 'PINTEREST_FETCH_FAILED'
  | 'PINTEREST_MEDIA_NOT_FOUND'
  | 'PINTEREST_MEDIA_INVALID';

export class ResolveError extends Error {
  public readonly code: ResolveErrorCode;

  constructor(code: ResolveErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'ResolveError';
    this.code = code;
  }
}

// Known generic placeholder asset that must never be used as pin media.
const PINTEREST_MEDIA_URL_BLACKLIST_KEYS: readonly string[] = [
  'i.pinimg.com/originals/d5/3b/01/d53b014d86a6b6761bf649a0ed813c2b.png',
];

function normalizePinterestUrlKey(url: string): string {
  const base = url.split('?')[0];
  try {
    const normalizedUrl = base.startsWith('//') ? `https:${base}` : base;
    const parsed = new URL(normalizedUrl);
    return `${parsed.hostname.toLowerCase()}${parsed.pathname}`;
  } catch {
    const withoutProtocol = base.replace(/^https?:\/\//i, '');
    return withoutProtocol.toLowerCase();
  }
}

function isBlacklistedPinterestUrl(url: string): boolean {
  const key = normalizePinterestUrlKey(url);
  return PINTEREST_MEDIA_URL_BLACKLIST_KEYS.includes(key);
}

/**
 * Classifies a raw media URL into a coarse category.
 *
 * UI code may use this helper to decide which UX path to take
 * (e.g. Pinterest URLs require explicit resolve), but MUST NOT
 * re-implement any URL parsing logic on its own.
 */
export function classifyBackgroundMediaUrl(url: string): BackgroundMediaUrlKind {
  const trimmed = url.trim();

  if (!trimmed) {
    return 'unknown';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    // If URL constructor fails, fall back to simple extension-based detection.
    const lower = trimmed.toLowerCase().split(/[?#]/)[0];
    if (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.bmp') ||
      lower.endsWith('.apng') ||
      lower.endsWith('.mp4')
    ) {
      return 'direct';
    }
    return 'unknown';
  }

  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  // Short Pinterest URLs (pin.it).
  if (host === 'pin.it') {
    return 'pinterest';
  }

  // Standard Pinterest pin URLs: https://{locale}.pinterest.com/pin/{PIN_ID}/
  if (host.endsWith('pinterest.com')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'pin' && segments[1]) {
      return 'pinterest';
    }
  }

  // YouTube URLs.
  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    return 'youtube';
  }

  // Direct media file extensions (image / video).
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const lowerSegment = lastSegment.toLowerCase();
  if (
    lowerSegment.endsWith('.jpg') ||
    lowerSegment.endsWith('.jpeg') ||
    lowerSegment.endsWith('.png') ||
    lowerSegment.endsWith('.gif') ||
    lowerSegment.endsWith('.webp') ||
    lowerSegment.endsWith('.bmp') ||
    lowerSegment.endsWith('.apng') ||
    lowerSegment.endsWith('.mp4')
  ) {
    return 'direct';
  }

  return 'unknown';
}

/**
 * Performs a fetch with a timeout, throwing on abort or network failure.
 */
async function fetchWithTimeout(
  resource: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

const FETCH_TIMEOUT_MS = 4500;

async function fetchTextDirect(url: string): Promise<string> {
  const response = await fetchWithTimeout(
    url,
    {
      redirect: 'follow',
    },
    FETCH_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
}

/**
 * Fetches text from a URL using a sequence of CORS-safe fallbacks.
 *
 * Order:
 * 1) Direct fetch
 * 2) allorigins.win JSON wrapper
 * 3) corsproxy.io
 * 4) api.codetabs.com proxy
 */
async function fetchTextWithFallback(url: string): Promise<string> {
  // 1) Direct fetch
  try {
    return await fetchTextDirect(url);
  } catch {
    // ignore and try next
  }

  // 2) allorigins.win JSON wrapper
  try {
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(apiUrl, {}, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as { contents?: string };
    if (typeof data.contents === 'string' && data.contents.length > 0) {
      return data.contents;
    }
  } catch {
    // ignore and try next
  }

  // 3) corsproxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(proxyUrl, {}, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch {
    // ignore and try next
  }

  // 4) api.codetabs.com
  try {
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(proxyUrl, {}, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch {
    // ignore
  }

  throw new ResolveError('PINTEREST_FETCH_FAILED');
}

/**
 * Extracts Pinterest PIN_ID from a pin URL or resolved content.
 */
async function extractPinterestPinId(rawUrl: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ResolveError('UNSUPPORTED_URL');
  }

  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // Direct pinterest.com pin URL
  if (host.endsWith('pinterest.com')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'pin' && segments[1] && /^\d+$/.test(segments[1])) {
      return segments[1];
    }
  }

  // Short pin.it URL: resolve via proxy pipeline and scan for /pin/<digits>/
  if (host === 'pin.it') {
    const text = await fetchTextWithFallback(rawUrl);
    const match = text.match(/\/pin\/(\d{6,})\//);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new ResolveError('UNSUPPORTED_URL');
}

/**
 * Global scoring system for Pinterest media URLs.
 *
 * Priority (base scores):
 * - mp4/webm: highest (always beats everything)
 * - gif: second
 * - image: last
 *
 * Bonuses:
 * - v1.pinimg.com/videos: +200
 * - /videos/: +150
 * - _720w / 720p / 1080p: +100
 * - /originals/: +80
 */
function scorePinterestMediaUrl(url: string): number {
  const lower = url.toLowerCase();
  const ext = lower.split('.').pop() || '';
  
  // Base scores by type
  let baseScore = 0;
  if (ext === 'mp4' || ext === 'webm') {
    baseScore = 100000; // Video always wins
  } else if (ext === 'gif') {
    baseScore = 50000; // GIF second
  } else {
    baseScore = 10000; // Images last
  }

  // Host bonus
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('pinimg.com')) {
      baseScore += 1000;
    }
    if (parsed.hostname === 'v1.pinimg.com' && parsed.pathname.includes('/videos/')) {
      baseScore += 200;
    }
  } catch {
    // Ignore URL parse failures
  }

  // Path bonuses
  const pathname = lower;
  if (pathname.includes('/videos/')) {
    baseScore += 150;
  }
  if (pathname.includes('/originals/')) {
    baseScore += 80;
  }

  // Resolution bonuses
  const widthMatch = pathname.match(/_(\d+)w\./);
  const qualityMatch = pathname.match(/(\d+)p\./);
  let resolution = 0;
  if (widthMatch && widthMatch[1]) {
    resolution = parseInt(widthMatch[1], 10);
  } else if (qualityMatch && qualityMatch[1]) {
    resolution = parseInt(qualityMatch[1], 10);
  }
  if (Number.isFinite(resolution)) {
    if (resolution >= 1080) {
      baseScore += 100;
    } else if (resolution >= 720) {
      baseScore += 100;
    } else {
      baseScore += resolution;
    }
  }

  return baseScore;
}

/**
 * Collects all Pinterest media candidate URLs from raw page text.
 */
function collectPinterestMediaFromText(
  text: string,
  videoOut: string[],
  imageOut: string[]
): void {
  // 1) Pinterest JSON state (initial-state / window.__initialData__)
  const videoFromJson: string[] = [];
  const imageFromJson: string[] = [];
  extractPinterestMediaFromInitialState(text, videoFromJson, imageFromJson);
  extractPinterestMediaFromWindowInitialData(text, videoFromJson, imageFromJson);
  videoOut.push(...videoFromJson);
  imageOut.push(...imageFromJson);

  // 2) Open Graph / Twitter meta tags
  const videoFromMeta: string[] = [];
  const imageFromMeta: string[] = [];
  extractPinterestMediaFromMetaTags(text, videoFromMeta, imageFromMeta);
  videoOut.push(...videoFromMeta);
  imageOut.push(...imageFromMeta);

  // 3) JSON-LD (application/ld+json)
  const videoFromJsonLd: string[] = [];
  const imageFromJsonLd: string[] = [];
  extractPinterestMediaFromJsonLd(text, videoFromJsonLd, imageFromJsonLd);
  videoOut.push(...videoFromJsonLd);
  imageOut.push(...imageFromJsonLd);

  // 4) Broad regex scanning
  const videoRegex = /https?:\/\/[^\s"'<>]*pinimg\.com[^\s"'<>]*\.(?:mp4|webm)\b/gi;
  const imageRegex =
    /https?:\/\/[^\s"'<>]*pinimg\.com[^\s"'<>]*\.(?:jpg|jpeg|png|gif|webp|bmp|apng)\b/gi;

  let match: RegExpExecArray | null;
  while ((match = videoRegex.exec(text)) !== null) {
    const url = match[0];
    if (!videoOut.includes(url)) {
      videoOut.push(url);
    }
  }

  while ((match = imageRegex.exec(text)) !== null) {
    const url = match[0];
    if (!imageOut.includes(url)) {
      imageOut.push(url);
    }
  }
}

/**
 * Collects Pinterest media from <script id="initial-state"> JSON.
 */
function extractPinterestMediaFromInitialState(
  text: string,
  videoOut: string[],
  imageOut: string[]
): void {
  const scriptRegex =
    /<script[^>]+id=["']initial-state["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(text)) !== null) {
    const jsonText = match[1];
    if (!jsonText) {
      continue;
    }

    try {
      const data = JSON.parse(jsonText);
      collectMediaFromJson(data, videoOut, imageOut);
    } catch {
      // Ignore malformed JSON
    }
  }
}

/**
 * Collects Pinterest media from window.__initialData__ / window.__PWS_DATA__ assignment.
 */
function extractPinterestMediaFromWindowInitialData(
  text: string,
  videoOut: string[],
  imageOut: string[]
): void {
  const winRegex = /window\.__(?:initialData|PWS_DATA)__\s*=\s*(\{[\s\S]*?\});/gi;

  let match: RegExpExecArray | null;
  while ((match = winRegex.exec(text)) !== null) {
    const jsonText = match[1];
    if (!jsonText) {
      continue;
    }

    try {
      const data = JSON.parse(jsonText);
      collectMediaFromJson(data, videoOut, imageOut);
    } catch {
      // Ignore malformed JSON
    }
  }
}

/**
 * Collects Pinterest media from Open Graph / Twitter meta tags.
 */
function extractPinterestMediaFromMetaTags(
  text: string,
  videoOut: string[],
  imageOut: string[]
): void {
  const metaTagRegex = /<meta[^>]+>/gi;
  const videoKeys = new Set([
    'og:video',
    'og:video:url',
    'og:video:secure_url',
    'twitter:player',
  ]);
  const imageKeys = new Set([
    'og:image',
    'og:image:url',
    'og:image:secure_url',
    'twitter:image',
  ]);

  let match: RegExpExecArray | null;
  while ((match = metaTagRegex.exec(text)) !== null) {
    const tag = match[0];
    const propertyMatch = tag.match(/property=["']([^"']+)["']/i);
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const key = (propertyMatch?.[1] ?? nameMatch?.[1]) || '';

    if (!key) {
      continue;
    }

    const keyLower = key.toLowerCase();
    const isVideoKey = videoKeys.has(keyLower);
    const isImageKey = imageKeys.has(keyLower);
    if (!isVideoKey && !isImageKey) {
      continue;
    }

    const contentMatch = tag.match(/content=["']([^"']+)["']/i);
    const url = contentMatch?.[1] ?? '';
    if (!url || !url.startsWith('http')) {
      continue;
    }

    // Only consider pinimg URLs
    if (!url.includes('pinimg.com')) {
      continue;
    }

    const lowerUrl = url.toLowerCase();
    const isVideoExt = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm');
    const isImageExt =
      lowerUrl.endsWith('.jpg') ||
      lowerUrl.endsWith('.jpeg') ||
      lowerUrl.endsWith('.png') ||
      lowerUrl.endsWith('.gif') ||
      lowerUrl.endsWith('.webp') ||
      lowerUrl.endsWith('.bmp') ||
      lowerUrl.endsWith('.apng');

    if (isVideoKey && isVideoExt && !videoOut.includes(url)) {
      videoOut.push(url);
    } else if (isImageKey && isImageExt && !imageOut.includes(url)) {
      imageOut.push(url);
    }
  }
}

/**
 * Collects Pinterest media from JSON-LD (application/ld+json) blocks.
 */
function extractPinterestMediaFromJsonLd(
  text: string,
  videoOut: string[],
  imageOut: string[]
): void {
  const scriptRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(text)) !== null) {
    const jsonText = match[1];
    if (!jsonText) {
      continue;
    }

    try {
      const data = JSON.parse(jsonText);
      collectPinterestMediaFromJsonLdNode(data, videoOut, imageOut);
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }
}

function collectPinterestMediaFromJsonLdNode(
  node: unknown,
  videoOut: string[],
  imageOut: string[]
): void {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectPinterestMediaFromJsonLdNode(item, videoOut, imageOut);
    }
    return;
  }

  const record = node as Record<string, unknown>;

  const maybeUrlKeys = ['contentUrl', 'url', 'thumbnailUrl'];
  for (const key of maybeUrlKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.includes('pinimg.com') && !isBlacklistedPinterestUrl(value)) {
      const lower = value.toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
        if (!videoOut.includes(value)) {
          videoOut.push(value);
        }
      } else if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.bmp') ||
        lower.endsWith('.apng')
      ) {
        if (!imageOut.includes(value)) {
          imageOut.push(value);
        }
      }
    }
  }

  for (const child of Object.values(record)) {
    collectPinterestMediaFromJsonLdNode(child, videoOut, imageOut);
  }
}

/**
 * Collects all media URLs from a Pinterest JSON state object.
 * Returns arrays of video and image candidates.
 */
function collectMediaFromJson(
  root: unknown,
  videoOut: string[],
  imageOut: string[]
): void {
  collectJsonMediaUrls(root, 0, videoOut, imageOut);
}

function collectJsonMediaUrls(
  node: unknown,
  depth: number,
  videoOut: string[],
  imageOut: string[]
): void {
  if (depth > 8 || !node || typeof node !== 'object') {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectJsonMediaUrls(item, depth + 1, videoOut, imageOut);
    }
    return;
  }

  const record = node as Record<string, unknown>;

  // Pinterest-specific: video_list blocks
  const videoList = record.video_list;
  if (videoList && typeof videoList === 'object') {
    const entries = Object.values(videoList as Record<string, unknown>);
    for (const entry of entries) {
      if (entry && typeof entry === 'object') {
        const url = (entry as any).url;
        if (typeof url === 'string' && url.includes('pinimg.com') && !isBlacklistedPinterestUrl(url)) {
          const lower = url.toLowerCase();
          if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
            if (!videoOut.includes(url)) {
              videoOut.push(url);
            }
          }
        }
      }
    }
  }

  // Pinterest-specific: images map (orig / 736x / 564x etc.)
  const images = record.images;
  if (images && typeof images === 'object') {
    const imageVariants = images as Record<string, unknown>;
    const keys = Object.keys(imageVariants);
    for (const key of keys) {
      const variant = imageVariants[key];
      if (variant && typeof variant === 'object') {
        const url = (variant as any).url;
        if (typeof url === 'string' && url.includes('pinimg.com') && !isBlacklistedPinterestUrl(url)) {
          const lower = url.toLowerCase();
          if (
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png') ||
            lower.endsWith('.gif') ||
            lower.endsWith('.webp') ||
            lower.endsWith('.bmp') ||
            lower.endsWith('.apng')
          ) {
            if (!imageOut.includes(url)) {
              imageOut.push(url);
            }
          }
        }
      }
    }
  }

  // Generic url/src fields
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && value.includes('pinimg.com') && !isBlacklistedPinterestUrl(value)) {
      const lower = value.toLowerCase();
      if (key === 'url' || key === 'src') {
        if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
          if (!videoOut.includes(value)) {
            videoOut.push(value);
          }
        } else if (
          lower.endsWith('.jpg') ||
          lower.endsWith('.jpeg') ||
          lower.endsWith('.png') ||
          lower.endsWith('.gif') ||
          lower.endsWith('.webp') ||
          lower.endsWith('.bmp') ||
          lower.endsWith('.apng')
        ) {
          if (!imageOut.includes(value)) {
            imageOut.push(value);
          }
        }
      }
    }
  }

  for (const child of Object.values(record)) {
    collectJsonMediaUrls(child, depth + 1, videoOut, imageOut);
  }
}

/**
 * Resolves a Pinterest pin URL into a primitive media description.
 *
 * Throws ResolveError on any failure.
 */
export async function resolvePinterestMediaFromUrl(
  pinUrl: string
): Promise<{ primitive: 'image' | 'video'; src: string }> {
  const pinId = await extractPinterestPinId(pinUrl);
  const canonicalUrl = `https://www.pinterest.com/pin/${pinId}/`;

  // Collect candidates from all sources
  const videoCandidates: string[] = [];
  const imageCandidates: string[] = [];

  // 1) Try PinResource JSON API (priority source)
  const { isVideoPin, jsonText } = await collectPinterestMediaFromApi(
    pinId,
    videoCandidates,
    imageCandidates,
    pinUrl
  );

  // Early-exit: If we have a valid candidate from JSON API, return immediately
  let media = selectBestPinterestMedia(videoCandidates, imageCandidates);
  if (media) {
    // Debug logging (temporary)
    console.log('[Pinterest Resolver]', {
      pinId,
      candidateCount: videoCandidates.length + imageCandidates.length,
      chosenUrl: media.src,
      chosenType: media.primitive,
    });
    return media;
  }

  // 2) Video-first short-circuit: If likely a video pin but no mp4 found, try CDN scan
  if (isVideoPin && jsonText) {
    const cdnMp4Urls = scanCdnMp4Urls(jsonText);
    for (const url of cdnMp4Urls) {
      if (!videoCandidates.includes(url)) {
        videoCandidates.push(url);
      }
    }

    // Select best mp4 from CDN scan
    media = selectBestPinterestMedia(videoCandidates, imageCandidates);
    if (media && media.primitive === 'video') {
      // Debug logging (temporary)
      console.log('[Pinterest Resolver]', {
        pinId,
        candidateCount: videoCandidates.length + imageCandidates.length,
        chosenUrl: media.src,
        chosenType: media.primitive,
      });
      return media;
    }

    // Video pin but no mp4 found: fail fast without HTML fallback
    throw new ResolveError('PINTEREST_MEDIA_NOT_FOUND');
  }

  // 3) Fallback for image/gif pins: Try HTML from canonical and original URLs
  for (const candidateUrl of [canonicalUrl, pinUrl]) {
    try {
      const text = await fetchTextWithFallback(candidateUrl);
      collectPinterestMediaFromText(text, videoCandidates, imageCandidates);
      // If we got HTML successfully, break (don't try other URLs)
      break;
    } catch {
      // Continue to next URL
    }
  }

  // 4) Select best candidate based on global priority rules
  media = selectBestPinterestMedia(videoCandidates, imageCandidates);
  
  if (!media) {
    // Debug logging (temporary)
    console.log('[Pinterest Resolver]', {
      pinId,
      candidateCount: videoCandidates.length + imageCandidates.length,
      videoCount: videoCandidates.length,
      imageCount: imageCandidates.length,
    });
    throw new ResolveError('PINTEREST_MEDIA_NOT_FOUND');
  }

  // Debug logging (temporary)
  console.log('[Pinterest Resolver]', {
    pinId,
    candidateCount: videoCandidates.length + imageCandidates.length,
    chosenUrl: media.src,
    chosenType: media.primitive,
  });

  return media;
}

/**
 * Selects the best media candidate based on global priority rules:
 * - If ANY mp4/webm exists → pick best video, IGNORE images
 * - Else if ANY gif exists → pick best gif, IGNORE jpg
 * - Else → pick best image
 */
function selectBestPinterestMedia(
  videoCandidates: string[],
  imageCandidates: string[]
): { primitive: 'image' | 'video'; src: string } | null {
  // Normalize URLs (strip query params, protocol-insensitive) and filter blacklist
  const normalizeUrl = (url: string): string => {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.toLowerCase();
    } catch {
      return url.split('?')[0].toLowerCase();
    }
  };

  const filteredVideos: string[] = [];
  const filteredImages: string[] = [];
  const seen = new Set<string>();

  for (const url of videoCandidates) {
    const normalized = normalizeUrl(url);
    if (!seen.has(normalized) && !isBlacklistedPinterestUrl(url)) {
      seen.add(normalized);
      filteredVideos.push(url);
    }
  }

  for (const url of imageCandidates) {
    const normalized = normalizeUrl(url);
    if (!seen.has(normalized) && !isBlacklistedPinterestUrl(url)) {
      seen.add(normalized);
      filteredImages.push(url);
    }
  }

  // Selection logic: mp4/webm > gif > images
  if (filteredVideos.length > 0) {
    let bestVideo = filteredVideos[0];
    let bestScore = scorePinterestMediaUrl(bestVideo);
    for (let i = 1; i < filteredVideos.length; i++) {
      const candidate = filteredVideos[i];
      const score = scorePinterestMediaUrl(candidate);
      if (score > bestScore) {
        bestScore = score;
        bestVideo = candidate;
      }
    }
    return { primitive: 'video', src: bestVideo };
  }

  // Check for GIFs separately (they're in imageCandidates but get priority)
  const gifs = filteredImages.filter((url) => url.toLowerCase().endsWith('.gif'));
  if (gifs.length > 0) {
    let bestGif = gifs[0];
    let bestScore = scorePinterestMediaUrl(bestGif);
    for (let i = 1; i < gifs.length; i++) {
      const candidate = gifs[i];
      const score = scorePinterestMediaUrl(candidate);
      if (score > bestScore) {
        bestScore = score;
        bestGif = candidate;
      }
    }
    return { primitive: 'image', src: bestGif };
  }

  // Fall back to best image
  if (filteredImages.length > 0) {
    let bestImage = filteredImages[0];
    let bestScore = scorePinterestMediaUrl(bestImage);
    for (let i = 1; i < filteredImages.length; i++) {
      const candidate = filteredImages[i];
      const score = scorePinterestMediaUrl(candidate);
      if (score > bestScore) {
        bestScore = score;
        bestImage = candidate;
      }
    }
    return { primitive: 'image', src: bestImage };
  }

  return null;
}

/**
 * Detects if a pin is likely a video pin based on JSON structure or URL patterns.
 */
function detectVideoPin(jsonText: string, pinUrl: string): boolean {
  const lowerText = jsonText.toLowerCase();
  const lowerUrl = pinUrl.toLowerCase();

  // Check JSON structure for video indicators
  if (
    lowerText.includes('"videos"') ||
    lowerText.includes('"video_list"') ||
    lowerText.includes('"story_pin_data"')
  ) {
    return true;
  }

  // Check URL patterns for video indicators
  if (
    lowerUrl.includes('videos') ||
    lowerUrl.includes('expmp4') ||
    lowerUrl.includes('/mc/') ||
    lowerUrl.includes('.mp4')
  ) {
    return true;
  }

  return false;
}

/**
 * Scans JSON text for CDN mp4 URLs (v1.pinimg.com/videos/ or i.pinimg.com/videos/).
 */
function scanCdnMp4Urls(jsonText: string): string[] {
  const mp4Regex = /https?:\/\/(?:v1|i)\.pinimg\.com\/videos\/[^\s"'<>]*\.mp4/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = mp4Regex.exec(jsonText)) !== null) {
    const url = match[0];
    if (!matches.includes(url)) {
      matches.push(url);
    }
  }
  
  return matches;
}

/**
 * Attempts to collect Pinterest media candidates via PinResource JSON endpoint.
 * Returns an object with collected candidates and video pin detection info.
 */
async function collectPinterestMediaFromApi(
  pinId: string,
  videoOut: string[],
  imageOut: string[],
  pinUrl: string
): Promise<{ isVideoPin: boolean; jsonText: string | null }> {
  const payload = {
    options: {
      field_set_key: 'detailed',
      id: pinId,
      no_fetch_context_on_resource: false,
    },
    context: {},
  };

  const dataParam = encodeURIComponent(JSON.stringify(payload));
  const apiUrl = `https://www.pinterest.com/resource/PinResource/get/?data=${dataParam}&source_url=/pin/${pinId}/`;

  let text: string | null = null;
  try {
    text = await fetchTextWithFallback(apiUrl);
  } catch {
    return { isVideoPin: false, jsonText: null };
  }

  const isVideoPin = detectVideoPin(text, pinUrl);

  try {
    const json = JSON.parse(text) as any;

    // Pin object resolution: different deployments may nest data differently
    const resource = json?.resource_response?.data ?? json?.resource_response ?? json;
    const pin =
      resource?.data?.pin ??
      resource?.data ??
      resource?.pin ??
      resource;

    if (!pin || typeof pin !== 'object') {
      return { isVideoPin, jsonText: text };
    }

    collectMediaFromJson(pin, videoOut, imageOut);
  } catch {
    // Silent failure
  }

  return { isVideoPin, jsonText: text };
}

/**
 * Resolves a background media overlay from a raw URL string.
 *
 * On success, returns a fully-normalized BackgroundMediaOverlayConfig.
 * On failure, throws ResolveError with a specific code.
 */
export async function resolveBackgroundMediaFromUrl(
  url: string
): Promise<BackgroundMediaOverlayConfig> {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new ResolveError('INVALID_URL');
  }

  const kind = classifyBackgroundMediaUrl(trimmed);

  // Pinterest pins: resolve via HTML Open Graph metadata.
  if (kind === 'pinterest') {
    const { src } = await resolvePinterestMediaFromUrl(trimmed);

    const media: UrlMediaConfig = {
      type: 'url',
      url: src,
    };

    try {
      const normalized = mediaOverlayContract.normalize({
        source: 'url',
        media,
      } as Partial<BackgroundMediaOverlayConfig>);

      if (!mediaOverlayContract.validate(normalized)) {
        throw new ResolveError('PINTEREST_MEDIA_INVALID');
      }

      return normalized;
    } catch (error) {
      if (error instanceof ResolveError) {
        throw error;
      }
      throw new ResolveError('PINTEREST_MEDIA_INVALID');
    }
  }

  // YouTube URLs remain unsupported for FAZ-3C.
  if (kind === 'youtube') {
    throw new ResolveError('UNSUPPORTED_URL');
  }

  // Direct media URLs and generic URLs: use base URL as-is.
  const media: UrlMediaConfig = {
    type: 'url',
    url: trimmed,
  };

  try {
    const normalized = mediaOverlayContract.normalize({
      source: 'url',
      media,
    } as Partial<BackgroundMediaOverlayConfig>);

    if (!mediaOverlayContract.validate(normalized)) {
      throw new ResolveError('UNSUPPORTED_URL');
    }

    return normalized;
  } catch (error) {
    if (error instanceof ResolveError) {
      throw error;
    }
    throw new ResolveError('INVALID_URL');
  }
}
