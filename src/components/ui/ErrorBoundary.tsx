'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="w-full max-w-md text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-500)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-calm-500)' }}>
              We're sorry, but something unexpected happened. Your conversation data is safe.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button
                onClick={this.handleRefresh}
                className="btn-secondary w-full"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                className="mt-6 p-4 rounded-lg text-left text-xs overflow-auto max-h-40"
                style={{ backgroundColor: 'var(--color-calm-100)', color: 'var(--color-calm-600)' }}
              >
                <p className="font-mono">{this.state.error.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
