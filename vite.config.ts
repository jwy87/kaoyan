import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // On Vercel, environment variables are provided via process.env at build time.
    // loadEnv() only reads .env files, so we must merge the two.
    const read = (key: string) => process.env[key] ?? env[key] ?? '';

    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
