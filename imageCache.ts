const IMAGE_CACHE_MAX_BYTES =
  Number(process.env.IMAGE_CACHE_MAX_BYTES) || 100 * 1024 * 1024;

const imageCache = new Map<string, Buffer>();
let imageCacheBytes = 0;

export type CoverImageSize = "large" | "thumbnail";

export function coverImageCacheKey(
  workingDirectory: string,
  uuidHash: string,
  size: CoverImageSize
): string {
  return `${workingDirectory}:${size}:${uuidHash}`;
}

export function getCachedImage(key: string): Buffer | undefined {
  const value = imageCache.get(key);
  if (!value) return undefined;
  imageCache.delete(key);
  imageCache.set(key, value);
  return value;
}

export function setCachedImage(key: string, value: Buffer): void {
  const existing = imageCache.get(key);
  if (existing) {
    imageCacheBytes -= existing.length;
    imageCache.delete(key);
  }

  while (
    imageCache.size > 0 &&
    imageCacheBytes + value.length > IMAGE_CACHE_MAX_BYTES
  ) {
    const oldest = imageCache.keys().next().value as string;
    imageCacheBytes -= imageCache.get(oldest)!.length;
    imageCache.delete(oldest);
  }

  imageCache.set(key, value);
  imageCacheBytes += value.length;
}

export function clearImageCache(): void {
  imageCache.clear();
  imageCacheBytes = 0;
}
