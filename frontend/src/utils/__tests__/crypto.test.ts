/**
 * ─── Crypto Module Tests ──────────────────────────────────────────
 * Roundtrip encryption/decryption tests for BYOK API key storage
 * and analysis cache encryption.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    encryptKeys,
    decryptKeys,
    hasStoredKeys,
    clearStoredKeys,
    encryptCache,
    decryptCache,
    migrateLegacyKeys,
} from '../crypto';
import type { APIKeys } from '../crypto';

describe('crypto – API Key Encryption', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const testKeys: APIKeys = {
        finnhub: 'fk_test123',
        groq: 'gk_test456',
        gemini: 'gem_test789',
        cohere: 'co_testabc',
    };

    it('encrypts and decrypts API keys roundtrip', async () => {
        await encryptKeys(testKeys, 'mypassphrase');
        expect(hasStoredKeys()).toBe(true);

        const decrypted = await decryptKeys('mypassphrase');
        expect(decrypted).toEqual(testKeys);
    });

    it('returns null for wrong passphrase', async () => {
        await encryptKeys(testKeys, 'correctpassphrase');
        const decrypted = await decryptKeys('wrongpassphrase');
        expect(decrypted).toBeNull();
    });

    it('handles optional cerebras key', async () => {
        const keysWithCerebras: APIKeys = { ...testKeys, cerebras: 'cb_testxyz' };
        await encryptKeys(keysWithCerebras, 'phrase');

        const decrypted = await decryptKeys('phrase');
        expect(decrypted).toEqual(keysWithCerebras);
        expect(decrypted?.cerebras).toBe('cb_testxyz');
    });

    it('clearStoredKeys removes all stored data', async () => {
        await encryptKeys(testKeys, 'phrase');
        expect(hasStoredKeys()).toBe(true);

        clearStoredKeys();
        expect(hasStoredKeys()).toBe(false);
    });

    it('hasStoredKeys returns false when nothing stored', () => {
        expect(hasStoredKeys()).toBe(false);
    });
});

describe('crypto – Cache Encryption', () => {
    it('encrypts and decrypts cache data roundtrip', async () => {
        const data = JSON.stringify({ ticker: 'AAPL', price: 178.72, timestamp: '2025-01-01' });
        const encrypted = await encryptCache(data);

        expect(typeof encrypted).toBe('string');
        expect(encrypted).not.toBe(data); // Should be different (encrypted)

        const decrypted = await decryptCache(encrypted);
        expect(decrypted).toBe(data);
    });

    it('decryptCache returns null for corrupted data', async () => {
        const decrypted = await decryptCache('not-valid-json');
        expect(decrypted).toBeNull();
    });

    it('decryptCache returns null for tampered ciphertext', async () => {
        const data = 'some secret data';
        const encrypted = await encryptCache(data);

        // Tamper with the encrypted payload
        const parsed = JSON.parse(encrypted);
        parsed.d = parsed.d.slice(0, -4) + 'XXXX'; // corrupt last 4 chars
        const tampered = JSON.stringify(parsed);

        const decrypted = await decryptCache(tampered);
        expect(decrypted).toBeNull();
    });
});

describe('crypto – Legacy Migration', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('migrates af_ keys to nipun_ prefix', () => {
        localStorage.setItem('af_encrypted_keys', 'legacy-data');
        localStorage.setItem('af_salt', 'legacy-salt');

        migrateLegacyKeys();

        expect(localStorage.getItem('nipun_encrypted_keys')).toBe('legacy-data');
        expect(localStorage.getItem('nipun_salt')).toBe('legacy-salt');
        expect(localStorage.getItem('af_encrypted_keys')).toBeNull();
        expect(localStorage.getItem('af_salt')).toBeNull();
    });

    it('does not overwrite existing nipun_ keys', () => {
        localStorage.setItem('nipun_encrypted_keys', 'new-data');
        localStorage.setItem('af_encrypted_keys', 'old-data');

        migrateLegacyKeys();

        expect(localStorage.getItem('nipun_encrypted_keys')).toBe('new-data');
    });

    it('is idempotent — safe to call multiple times', () => {
        localStorage.setItem('af_encrypted_keys', 'legacy-data');
        migrateLegacyKeys();
        migrateLegacyKeys(); // second call should be no-op

        expect(localStorage.getItem('nipun_encrypted_keys')).toBe('legacy-data');
    });
});
