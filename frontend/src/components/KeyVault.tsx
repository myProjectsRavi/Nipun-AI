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
        description: 'Stock data & technicals',
        url: 'https://finnhub.io/register',
        placeholder: 'Your Finnhub API key',
        icon: '📈',
        required: true,
    },
    {
        id: 'groq' as const,
        name: 'Groq',
        description: 'Sentiment analysis',
        url: 'https://console.groq.com',
        placeholder: 'Your Groq API key',
        icon: '⚡',
        required: true,
    },
    {
        id: 'gemini' as const,
        name: 'Google Gemini',
        description: 'Risk extraction & synthesis',
        url: 'https://aistudio.google.com',
        placeholder: 'Your Gemini API key',
        icon: '🧠',
        required: true,
    },
    {
        id: 'cohere' as const,
        name: 'Cohere',
        description: 'Fact auditing',
        url: 'https://dashboard.cohere.com',
        placeholder: 'Your Cohere API key',
        icon: '🔍',
        required: true,
    },
    {
        id: 'cerebras' as const,
        name: 'Cerebras',
        description: 'AI consensus (optional)',
        url: 'https://cloud.cerebras.ai',
        placeholder: 'Your Cerebras API key (optional)',
        icon: '🤖',
        required: false,
    },
];

export default function KeyVault() {
    const { setKeys, setDemoMode, setView, demoMode } = useStore();
    const [step, setStep] = useState<'choose' | 'enter-keys' | 'passphrase' | 'unlock' | 'view-keys'>('choose');
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
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

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
                setLocalKeys(decrypted);
                setKeys(decrypted);
                setDemoMode(false);
                // Go to view-keys so user can see, copy, edit
                setStep('view-keys');
            } else {
                setError('Incorrect passphrase');
            }
        } catch {
            setError('Failed to decrypt keys');
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleUpdateKeys = async () => {
        if (!passphrase || passphrase.length < 6) {
            setError('Enter your passphrase to save changes');
            return;
        }
        try {
            await encryptKeys(keys, passphrase);
            setKeys(keys);
            setError('');
            setCopySuccess('keys-saved');
            setTimeout(() => setCopySuccess(null), 2000);
        } catch {
            setError('Failed to save updated keys');
        }
    };

    const handleClearKeys = () => {
        clearStoredKeys();
        setStep('choose');
        setError('');
        setPassphrase('');
    };

    const handleCopyKey = (id: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopySuccess(id);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const toggleShowKey = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const maskKey = (key: string) => {
        if (!key) return '(not set)';
        if (key.length <= 8) return '••••••••';
        return key.slice(0, 4) + '••••••••' + key.slice(-4);
    };

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">
                    🔐
                </div>
                <h2 className="mb-2 font-display text-2xl font-bold text-white">Key Vault</h2>
                <p className="text-sm text-white/40">
                    Your API keys are encrypted with AES-256-GCM and never leave your browser.
                </p>
            </div>

            {/* Step: Choose Mode */}
            {step === 'choose' && (
                <div className="space-y-4 animate-slide-up">
                    <button
                        onClick={handleDemoMode}
                        className="card group w-full cursor-pointer p-6 text-left"
                        id="demo-mode-btn"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-xl transition-transform group-hover:scale-110">
                                🎮
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-white">Try Demo Mode</h3>
                                <p className="text-sm text-white/40">
                                    Explore with realistic mock data — no API keys needed
                                </p>
                            </div>
                            <svg className="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => setStep('enter-keys')}
                        className="card group w-full cursor-pointer p-6 text-left"
                        id="enter-keys-btn"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-xl transition-transform group-hover:scale-110">
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
                <div className="space-y-3 animate-slide-up">
                    {KEY_PROVIDERS.map((provider) => (
                        <div key={provider.id} className="card p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{provider.icon}</span>
                                    <span className="font-semibold text-white">{provider.name}</span>
                                    <span className="text-[11px] text-white/40">— {provider.description}</span>
                                    {!provider.required && <span className="text-[9px] text-accent/60 bg-accent/10 px-1.5 py-0.5 rounded">optional</span>}
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
                                value={keys[provider.id] || ''}
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
                    <div className="card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">🔒</span>
                            <h3 className="font-display font-semibold text-white">Set Encryption Passphrase</h3>
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
                            <p className="mt-3 text-sm text-rose">{error}</p>
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
                    <div className="card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">🔓</span>
                            <h3 className="font-display font-semibold text-white">Unlock Key Vault</h3>
                        </div>
                        <p className="mb-4 text-sm text-white/40">
                            Your encrypted API keys were found. Enter your passphrase to decrypt, view, and edit them.
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
                            <p className="mt-3 text-sm text-rose">{error}</p>
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
                                '🔓 Unlock & View'
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleClearKeys}
                        className="w-full text-center text-xs text-white/20 hover:text-rose transition-colors"
                    >
                        Clear stored keys and start over
                    </button>
                </div>
            )}

            {/* Step: View / Edit Keys (NEW) */}
            {step === 'view-keys' && (
                <div className="space-y-3 animate-slide-up">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-display font-semibold text-white text-lg">Your API Keys</h3>
                        <div className="flex items-center gap-2">
                            {copySuccess === 'keys-saved' && (
                                <span className="badge-success text-[10px] animate-fade-in">✓ Saved</span>
                            )}
                        </div>
                    </div>

                    {KEY_PROVIDERS.map((provider) => {
                        const keyValue = keys[provider.id] || '';
                        const isShown = showKeys[provider.id];
                        return (
                            <div key={provider.id} className="card p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{provider.icon}</span>
                                        <span className="font-semibold text-white text-sm">{provider.name}</span>
                                        {keyValue ? (
                                            <span className="badge-success text-[9px]">Set</span>
                                        ) : (
                                            <span className="text-[9px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">Not set</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {/* Toggle visibility */}
                                        <button
                                            onClick={() => toggleShowKey(provider.id)}
                                            className="rounded-lg px-2 py-1 text-[10px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                            title={isShown ? 'Hide' : 'Show'}
                                        >
                                            {isShown ? '🙈 Hide' : '👁️ Show'}
                                        </button>
                                        {/* Copy */}
                                        {keyValue && (
                                            <button
                                                onClick={() => handleCopyKey(provider.id, keyValue)}
                                                className="rounded-lg px-2 py-1 text-[10px] text-white/40 hover:text-accent hover:bg-accent/5 transition-all"
                                            >
                                                {copySuccess === provider.id ? '✓ Copied' : '📋 Copy'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isShown ? (
                                    <input
                                        type="text"
                                        className="input-field font-mono text-sm"
                                        value={keyValue}
                                        onChange={(e) =>
                                            setLocalKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                                        }
                                        placeholder={provider.placeholder}
                                    />
                                ) : (
                                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 font-mono text-sm text-white/40">
                                        {maskKey(keyValue)}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {error && (
                        <p className="text-sm text-rose text-center">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={handleUpdateKeys} className="btn-secondary flex-1">
                            💾 Save Changes
                        </button>
                        <button
                            onClick={() => {
                                setKeys(keys);
                                setDemoMode(false);
                                setView('analysis');
                            }}
                            className="btn-primary flex-1"
                        >
                            ⚡ Start Analyzing
                        </button>
                    </div>

                    <button
                        onClick={handleClearKeys}
                        className="w-full text-center text-xs text-white/20 hover:text-rose transition-colors mt-2"
                    >
                        Clear all keys and start over
                    </button>
                </div>
            )}
        </div>
    );
}
