import { Component, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-page text-gray-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold text-red-200 mb-3">App Runtime Error</h1>
            <p className="text-sm text-red-100">{this.state.message}</p>
            <p className="text-xs text-red-200/80 mt-4">
              Check the browser console for details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
