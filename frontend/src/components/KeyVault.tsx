import { useState, useEffect } from 'react';
import { useStore } from '../store';
import {
    encryptKeys,
    decryptKeys,
    hasStoredKeys,
    clearStoredKeys,
    type APIKeys,
} from '../utils/crypto';

const KEY_PROVIDERS = [
    {
        id: 'finnhub' as const,
        name: 'Finnhub',
        description: 'Real-time stock quotes & financial metrics',
        url: 'https://finnhub.io/register',
        placeholder: 'Your Finnhub API key',
        icon: '📈',
    },
    {
        id: 'groq' as const,
        name: 'Groq',
        description: 'Lightning-fast sentiment analysis via LPU',
        url: 'https://console.groq.com',
        placeholder: 'Your Groq API key',
        icon: '⚡',
    },
    {
        id: 'gemini' as const,
        name: 'Google Gemini',
        description: 'Risk extraction & report synthesis',
        url: 'https://aistudio.google.com',
        placeholder: 'Your Gemini API key',
        icon: '🧠',
    },
    {
        id: 'cohere' as const,
        name: 'Cohere',
        description: 'RAG-powered fact auditing',
        url: 'https://dashboard.cohere.com',
        placeholder: 'Your Cohere API key',
        icon: '🔍',
    },
    {
        id: 'cerebras' as const,
        name: 'Cerebras',
        description: 'AI consensus (optional, free, no CC)',
        url: 'https://cloud.cerebras.ai',
        placeholder: 'Your Cerebras API key (optional)',
        icon: '🤖',
    },
];

export default function KeyVault() {
    const { setKeys, setDemoMode, setView, demoMode } = useStore();
    const [step, setStep] = useState<'choose' | 'enter-keys' | 'passphrase' | 'unlock'>('choose');
    const [keys, setLocalKeys] = useState<APIKeys>({
        finnhub: '',
        groq: '',
        gemini: '',
        cohere: '',
        cerebras: '',
    });
    const [passphrase, setPassphrase] = useState('');
    const [confirmPassphrase, setConfirmPassphrase] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        if (hasStoredKeys()) {
            setStep('unlock');
        }
    }, []);

    const handleDemoMode = () => {
        setDemoMode(true);
        setKeys(null);
        setView('analysis');
    };

    const handleSaveKeys = async () => {
        if (passphrase.length < 6) {
            setError('Passphrase must be at least 6 characters');
            return;
        }
        if (passphrase !== confirmPassphrase) {
            setError('Passphrases do not match');
            return;
        }

        try {
            await encryptKeys(keys, passphrase);
            setKeys(keys);
            setDemoMode(false);
            setView('analysis');
        } catch {
            setError('Failed to encrypt keys');
        }
    };

    const handleUnlock = async () => {
        setIsUnlocking(true);
        setError('');
        try {
            const decrypted = await decryptKeys(passphrase);
            if (decrypted) {
                setKeys(decrypted);
                setDemoMode(false);
                setView('analysis');
            } else {
                setError('Incorrect passphrase');
            }
        } catch {
            setError('Failed to decrypt keys');
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleClearKeys = () => {
        clearStoredKeys();
        setStep('choose');
        setError('');
    };

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">
                    🔐
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Key Vault</h2>
                <p className="text-sm text-white/50">
                    Your API keys are encrypted with AES-256-GCM and never leave your browser.
                </p>
            </div>

            {/* Step: Choose Mode */}
            {step === 'choose' && (
                <div className="space-y-4 animate-slide-up">
                    <button
                        onClick={handleDemoMode}
                        className="glass-card-hover group w-full cursor-pointer p-6 text-left"
                        id="demo-mode-btn"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-xl transition-transform group-hover:scale-110">
                                🎮
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-white">Use Demo Mode (Mock Data)</h3>
                                <p className="text-sm text-white/40">
                                    Explore Nipun AI with realistic mock data — no API keys needed
                                </p>
                            </div>
                            <svg className="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => setStep('enter-keys')}
                        className="glass-card-hover group w-full cursor-pointer p-6 text-left"
                        id="enter-keys-btn"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-xl transition-transform group-hover:scale-110">
                                🔑
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-white">Enter API Keys</h3>
                                <p className="text-sm text-white/40">
                                    Connect your own free-tier API keys for live analysis
                                </p>
                            </div>
                            <svg className="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {demoMode && (
                        <p className="text-center text-xs text-accent/60">
                            Currently in demo mode
                        </p>
                    )}
                </div>
            )}

            {/* Step: Enter Keys */}
            {step === 'enter-keys' && (
                <div className="space-y-4 animate-slide-up">
                    {KEY_PROVIDERS.map((provider) => (
                        <div key={provider.id} className="glass-card p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{provider.icon}</span>
                                    <span className="font-medium text-white">{provider.name}</span>
                                    <span className="text-xs text-white/30">— {provider.description}</span>
                                </div>
                                <a
                                    href={provider.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-accent hover:text-accent-light transition-colors"
                                >
                                    Get free key →
                                </a>
                            </div>
                            <input
                                type="password"
                                className="input-field font-mono text-sm"
                                placeholder={provider.placeholder}
                                value={keys[provider.id]}
                                onChange={(e) =>
                                    setLocalKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                                }
                            />
                        </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setStep('choose')} className="btn-secondary flex-1">
                            ← Back
                        </button>
                        <button
                            onClick={() => setStep('passphrase')}
                            disabled={!keys.finnhub && !keys.groq && !keys.gemini && !keys.cohere}
                            className="btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Set Passphrase →
                        </button>
                    </div>
                </div>
            )}

            {/* Step: Passphrase */}
            {step === 'passphrase' && (
                <div className="space-y-4 animate-slide-up">
                    <div className="glass-card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">🔒</span>
                            <h3 className="font-semibold text-white">Set Encryption Passphrase</h3>
                        </div>
                        <p className="mb-4 text-sm text-white/40">
                            This passphrase encrypts your keys with AES-256-GCM. We never store it — if you forget it, you'll need to re-enter your keys.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Enter passphrase (min 6 characters)"
                                value={passphrase}
                                onChange={(e) => { setPassphrase(e.target.value); setError(''); }}
                            />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Confirm passphrase"
                                value={confirmPassphrase}
                                onChange={(e) => { setConfirmPassphrase(e.target.value); setError(''); }}
                            />
                        </div>
                        {error && (
                            <p className="mt-3 text-sm text-danger">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep('enter-keys')} className="btn-secondary flex-1">
                            ← Back
                        </button>
                        <button onClick={handleSaveKeys} className="btn-primary flex-1">
                            🔐 Encrypt & Save
                        </button>
                    </div>
                </div>
            )}

            {/* Step: Unlock */}
            {step === 'unlock' && (
                <div className="space-y-4 animate-slide-up">
                    <div className="glass-card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">🔓</span>
                            <h3 className="font-semibold text-white">Unlock Key Vault</h3>
                        </div>
                        <p className="mb-4 text-sm text-white/40">
                            Your encrypted API keys were found. Enter your passphrase to decrypt them.
                        </p>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your passphrase"
                            value={passphrase}
                            onChange={(e) => { setPassphrase(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        />
                        {error && (
                            <p className="mt-3 text-sm text-danger">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleDemoMode} className="btn-secondary flex-1">
                            🎮 Demo Mode
                        </button>
                        <button
                            onClick={handleUnlock}
                            disabled={isUnlocking || !passphrase}
                            className="btn-primary flex-1 disabled:opacity-30"
                        >
                            {isUnlocking ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Decrypting...
                                </span>
                            ) : (
                                '🔓 Unlock'
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleClearKeys}
                        className="w-full text-center text-xs text-white/20 hover:text-danger transition-colors"
                    >
                        Clear stored keys and start over
                    </button>
                </div>
            )}
        </div>
    );
}
