import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initI18n } from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { validateEnv } from './lib/envValidator';
import AppErrorBoundary from './components/AppErrorBoundary';

let envError: string | null = null;
try {
  validateEnv();
} catch (err) {
  envError = err instanceof Error ? err.message : 'Environment validation failed';
}

async function bootstrap() {
  // Load active locale (+ en fallback) before mounting so UI strings don't flash English.
  await initI18n();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <AppErrorBoundary>
          {envError ? (
            <div className="min-h-screen bg-page text-gray-100 flex items-center justify-center p-6">
              <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <h1 className="text-xl font-semibold text-red-200 mb-3">App Startup Error</h1>
                <p className="text-sm text-red-100">{envError}</p>
                <p className="text-xs text-red-200/80 mt-4">
                  Check your `.env` file or enable `VITE_MOCK_MODE=1`.
                </p>
              </div>
            </div>
          ) : (
            <App />
          )}
        </AppErrorBoundary>
      </ThemeProvider>
    </StrictMode>
  );
}

void bootstrap();
