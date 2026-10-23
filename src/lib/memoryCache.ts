type Entry = { expires: number; value: unknown };

const globalCache = globalThis as unknown as {
  __rajshreeMemo?: Map<string, Entry>;
  __rajshreeMemoPending?: Map<string, Promise<unknown>>;
};

function store() {
  return (globalCache.__rajshreeMemo ??= new Map());
}

function pending() {
  return (globalCache.__rajshreeMemoPending ??= new Map());
}

/** Short-lived process cache so navigation does not repeat the same reads. */
export function memoize<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const hit = store().get(key);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value as T);

  const inflight = pending().get(key);
  if (inflight) return inflight as Promise<T>;

  const promise = load()
    .then((value) => {
      store().set(key, { expires: Date.now() + ttlMs, value });
      pending().delete(key);
      return value;
    })
    .catch((error: unknown) => {
      pending().delete(key);
      throw error;
    });
  pending().set(key, promise);
  return promise;
}

export function forgetMemo(key: string) {
  store().delete(key);
  pending().delete(key);
}

export function forgetMemoPrefix(prefix: string) {
  for (const key of store().keys()) {
    if (key.startsWith(prefix)) store().delete(key);
  }
  for (const key of pending().keys()) {
    if (key.startsWith(prefix)) pending().delete(key);
  }
}
