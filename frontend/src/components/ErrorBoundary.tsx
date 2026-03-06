import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[Nipun AI] Caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="mx-auto max-w-lg p-8 text-center animate-fade-in">
                    <div className="card-premium p-8">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="font-display text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-white/50 mb-4 leading-relaxed">
                            {this.state.error?.message || 'An unexpected error occurred while rendering the report.'}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="btn-primary text-sm"
                        >
                            🔄 Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
