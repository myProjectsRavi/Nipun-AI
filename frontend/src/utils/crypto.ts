/**
 * AES-256-GCM encryption/decryption for BYOK API key storage.
 * Uses the Web Crypto API — available in all modern browsers at zero cost.
 */

const STORAGE_KEY = 'af_encrypted_keys';
const SALT_KEY = 'af_salt';

export interface APIKeys {
    finnhub: string;
    groq: string;
    gemini: string;
    cohere: string;
    cerebras?: string;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as unknown as BufferSource,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptKeys(keys: APIKeys, passphrase: string): Promise<void> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(JSON.stringify(keys))
    );

    // Store salt, iv, and ciphertext as base64
    const payload = {
        salt: arrayToBase64(salt),
        iv: arrayToBase64(iv),
        data: arrayToBase64(new Uint8Array(encrypted)),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(SALT_KEY, payload.salt);
}

export async function decryptKeys(passphrase: string): Promise<APIKeys | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        const payload = JSON.parse(stored) as { salt: string; iv: string; data: string };
        const salt = base64ToArray(payload.salt);
        const iv = base64ToArray(payload.iv);
        const data = base64ToArray(payload.data);
        const key = await deriveKey(passphrase, salt);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv as unknown as BufferSource },
            key,
            data as unknown as BufferSource
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted)) as APIKeys;
    } catch {
        return null;
    }
}

export function hasStoredKeys(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearStoredKeys(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
}

// ─── Base64 Helpers ────────────────────────────────────────────────
function arrayToBase64(arr: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
}

function base64ToArray(b64: string): Uint8Array {
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        arr[i] = binary.charCodeAt(i);
    }
    return arr;
}
