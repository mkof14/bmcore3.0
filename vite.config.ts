import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Mock builds tree-shake @supabase/supabase-js — skip that manual chunk to avoid an empty file.
  const splitSupabase = env.VITE_MOCK_MODE !== '1';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      hmr: {
        host: '127.0.0.1',
        port: 5173,
        overlay: true
      },
      // Dev HMR may need looser CSP; production headers live in vercel.json.
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=(self)'
      }
    },
    preview: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      // Align with vercel.json so `vite preview` exercises production-like headers.
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "form-action 'self' https://checkout.stripe.com https://hooks.stripe.com",
          "script-src 'self' https://js.stripe.com https://www.googletagmanager.com https://connect.facebook.net",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://m.stripe.network https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
          "media-src 'self' blob: data: https:",
          "worker-src 'self' blob:",
          'upgrade-insecure-requests'
        ].join('; '),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=(self)',
        'X-DNS-Prefetch-Control': 'on',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger']
      },
      // Surface oversized entry chunks instead of masking them.
      chunkSizeWarningLimit: 600,
      reportCompressedSize: true,
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // One async chunk per language (base JSON + page packs).
            const localeMatch = id.match(/[/\\]locales[/\\]([a-z]{2})(?:[/\\]|\.json)/);
            if (localeMatch) {
              return `locale-${localeMatch[1]}`;
            }

            if (!id.includes('node_modules')) return;

            if (splitSupabase && id.includes('@supabase')) return 'vendor-supabase';
            // Matches i18next and react-i18next
            if (id.includes('i18next')) return 'vendor-i18n';
            if (
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules\\react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules\\react\\') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules\\scheduler')
            ) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  };
});
