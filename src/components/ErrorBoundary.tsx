import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface-900 text-white p-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">⚠️ Erro na Aplicação</h1>
            <p className="text-surface-400 mb-4">{this.state.error?.message}</p>
            <details className="text-left bg-surface-800 p-4 rounded-lg overflow-auto max-h-64">
              <summary className="cursor-pointer font-semibold mb-2">Stack Trace</summary>
              <pre className="text-xs text-surface-300 whitespace-pre-wrap break-words">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
