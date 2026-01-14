"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  onGoHome?: () => void;
}

export function ErrorFallback({ error, onReset, onGoHome }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Something went wrong
        </h2>

        <p className="text-sm text-zinc-400 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {isDev && error && (
          <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-left">
            <div className="flex items-center space-x-2 mb-2">
              <Bug className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-mono">Debug Info</span>
            </div>
            <p className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-zinc-500 font-mono overflow-x-auto max-h-32">
                {error.stack.split("\n").slice(1, 5).join("\n")}
              </pre>
            )}
          </div>
        )}

        <div className="flex items-center justify-center space-x-3">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </button>
          )}

          {!onReset && !onGoHome && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
