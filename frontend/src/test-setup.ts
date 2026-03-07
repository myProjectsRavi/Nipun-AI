/**
 * Test setup — polyfill Web Crypto and localStorage for jsdom/vitest.
 *
 * Node 22+ ships an experimental `globalThis.localStorage` that lacks the
 * full Storage interface (no setItem/getItem/removeItem/clear functions).
 * We replace it with a spec-compliant in-memory implementation so crypto.ts
 * and store.ts work correctly in tests.
 */
import { webcrypto } from 'node:crypto';

// ── Crypto polyfill ────────────────────────────────────────────────
if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        writable: true,
    });
}

// ── localStorage polyfill ──────────────────────────────────────────
// Replace Node 22's broken experimental localStorage with a proper Storage impl
class InMemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length(): number { return this.store.size; }
    clear(): void { this.store.clear(); }
    getItem(key: string): string | null { return this.store.get(key) ?? null; }
    key(index: number): string | null { return [...this.store.keys()][index] ?? null; }
    removeItem(key: string): void { this.store.delete(key); }
    setItem(key: string, value: string): void { this.store.set(key, String(value)); }
    [Symbol.iterator](): IterableIterator<string> { return this.store.keys(); }
    [key: string]: unknown;
}

Object.defineProperty(globalThis, 'localStorage', {
    value: new InMemoryStorage(),
    writable: true,
    configurable: true,
});
