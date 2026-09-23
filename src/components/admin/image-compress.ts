/**
 * image-compress.ts — Client-side image compression helper for admin uploads.
 *
 * Used by:
 *   src/pages/admin/products/new.astro
 *   src/pages/admin/products/[id]/edit.astro
 *   src/pages/admin/images.astro  (future bulk upload)
 *
 * Why client-side:
 *   - No server-side deps (no sharp, no native binaries) — Vercel build stays
 *     small and reliable.
 *   - Browsers do this natively via Canvas — no polyfill needed.
 *   - Admin can see compression result before uploading.
 *
 * Strategy:
 *   - Read file via FileReader → Image (loaded into <img>).
 *   - Draw to canvas with target dimensions.
 *   - Export canvas as JPEG/PNG blob.
 *   - Skip compression if file is already small (< 200 KB) and dimensions
 *     are reasonable (< 2000 px) — to avoid unnecessary quality loss.
 *
 * Returns: { blob, filename, originalSize, compressedSize, width, height,
 *           mimeType, skipped }
 *
 * Configuration (kept conservative to keep visual fidelity for B2B buyers):
 *   - Files < 200 KB and dimensions ≤ 2000 px → uploaded as-is.
 *   - Files 200 KB - 1 MB and dimensions ≤ 2400 px → uploaded as-is.
 *   - Otherwise:
 *       - JPEG: resize to max 1600 px longest edge, quality 0.85.
 *       - PNG with alpha: resize to max 1600 px, exported as PNG (no quality loss).
 *       - PNG without alpha: convert to JPEG quality 0.85.
 */

export type CompressionResult = {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  mimeType: string;
  skipped: boolean;
  reason?: string;
  /** SHA-256 hex of the blob that will be uploaded (compressed or original).
   *  Used for dedup detection. */
  sha256: string;
};

const MAX_DIM_LARGE = 1600;       // target longest edge for resize
const SKIP_THRESHOLD_BYTES = 200_000;
const SKIP_THRESHOLD_DIM = 2000;
const JPEG_QUALITY = 0.85;

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error || new Error('FileReader failed'));
    r.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}

function shouldSkip(file: File, width: number, height: number): { skip: boolean; reason?: string } {
  if (file.size <= SKIP_THRESHOLD_BYTES && width <= SKIP_THRESHOLD_DIM && height <= SKIP_THRESHOLD_DIM) {
    return { skip: true, reason: 'Already small enough' };
  }
  return { skip: false };
}

function isProbablyTransparent(file: File): boolean {
  // Best-effort: only PNG can have alpha in common image formats.
  return file.type === 'image/png' || /\.png$/i.test(file.name);
}

async function resizeToCanvas(
  img: HTMLImageElement,
  maxDim: number,
): Promise<HTMLCanvasElement> {
  const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob returned null'))),
      mimeType,
      quality,
    );
  });
}

function renameForMime(filename: string, mimeType: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  if (mimeType === 'image/jpeg') return `${base}.jpg`;
  if (mimeType === 'image/png') return `${base}.png`;
  if (mimeType === 'image/webp') return `${base}.webp`;
  return filename;
}

/**
 * Compute SHA-256 hex of a Blob using Web Crypto API. Returns 64-char lowercase hex.
 * Browser-native (works in all modern browsers). SubtleCrypto is async-only.
 */
export async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Build a dedup-tagged filename: {hash[:8]}-{sanitized-name}.{ext}
 *
 * Including the hash in the filename lets /api/admin/images list (which doesn't
 * expose arbitrary metadata) double as a dedup index: when a new file's hash
 * prefix is already present in any existing filename, we know it's a duplicate.
 *
 * Files uploaded before this feature won't have the prefix — that's fine, they
 * just won't trigger dedup matches.
 */
export function withHashPrefix(hash: string, sanitizedBase: string, ext: string): string {
  const prefix = hash.slice(0, 8);
  return `${prefix}-${sanitizedBase}.${ext}`;
}

/**
 * Compress an image File for upload.
 *
 * - Resizes to MAX_DIM_LARGE longest edge if file > 200 KB or larger than
 *   2000 px on either side.
 * - Re-encodes as JPEG quality 0.85 by default; PNG alpha is preserved.
 * - Computes SHA-256 of the compressed blob for client-side dedup.
 * - Returns both blob (for upload) and metadata (for UI feedback).
 */
export async function compressImageForUpload(file: File): Promise<CompressionResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`Not an image: ${file.type || 'unknown'}`);
  }

  const originalSize = file.size;
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImageFromDataUrl(dataUrl);

  const { width: w0, height: h0 } = img;
  const skip = shouldSkip(file, w0, h0);
  if (skip.skip) {
    const hash = await sha256Hex(file);
    return {
      blob: file,
      filename: file.name,
      originalSize,
      compressedSize: originalSize,
      width: w0,
      height: h0,
      mimeType: file.type,
      skipped: true,
      reason: skip.reason,
      sha256: hash,
    };
  }

  const canvas = await resizeToCanvas(img, MAX_DIM_LARGE);
  const transparent = isProbablyTransparent(file);
  const outMime = transparent ? 'image/png' : 'image/jpeg';
  const quality = outMime === 'image/jpeg' ? JPEG_QUALITY : undefined;
  const blob = await canvasToBlob(canvas, outMime, quality ?? 0.92);
  const hash = await sha256Hex(blob);

  return {
    blob,
    filename: renameForMime(file.name, outMime),
    originalSize,
    compressedSize: blob.size,
    width: canvas.width,
    height: canvas.height,
    mimeType: outMime,
    skipped: false,
    sha256: hash,
  };
}

/**
 * Convert a Blob to a base64 string for JSON upload (the admin upload
 * endpoint expects JSON { filename, data }).
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, Math.min(i + chunk, bytes.length))),
    );
  }
  return btoa(binary);
}
