type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type PublicCacheOptions = {
  ttlMs?: number;
  allowStaleOnError?: boolean;
};

const DEFAULT_TTL_MS = 60 * 1000;
const STORAGE_PREFIX = "public-cache:";

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function now(): number {
  return Date.now();
}

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string): CacheEntry<T> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, entry: CacheEntry<T>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // Ignorar errores de cuota o modo privado.
  }
}

function getFreshCache<T>(key: string): CacheEntry<T> | null {
  const fromMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (fromMemory && fromMemory.expiresAt > now()) {
    return fromMemory;
  }

  const fromStorage = readStorage<T>(key);
  if (fromStorage && fromStorage.expiresAt > now()) {
    memoryCache.set(key, fromStorage);
    return fromStorage;
  }

  return null;
}

function getAnyCache<T>(key: string): CacheEntry<T> | null {
  const fromMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (fromMemory) return fromMemory;

  const fromStorage = readStorage<T>(key);
  if (fromStorage) {
    memoryCache.set(key, fromStorage);
    return fromStorage;
  }

  return null;
}

export async function getPublicCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: PublicCacheOptions,
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const allowStaleOnError = options?.allowStaleOnError ?? true;

  const fresh = getFreshCache<T>(key);
  if (fresh) {
    return fresh.value;
  }

  const existingRequest = inflight.get(key) as Promise<T> | undefined;
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    try {
      const value = await fetcher();
      const entry: CacheEntry<T> = {
        value,
        expiresAt: now() + ttlMs,
      };
      memoryCache.set(key, entry);
      writeStorage(key, entry);
      return value;
    } catch (error) {
      if (allowStaleOnError) {
        const stale = getAnyCache<T>(key);
        if (stale) {
          return stale.value;
        }
      }
      throw error;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

export function invalidatePublicCache(keys: string[]): void {
  for (const key of keys) {
    memoryCache.delete(key);
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(storageKey(key));
      } catch {
        // noop
      }
    }
  }
}
