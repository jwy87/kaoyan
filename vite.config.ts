import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // On Vercel, environment variables are provided via process.env at build time.
    // loadEnv() only reads .env files, so we must merge the two.
    const read = (key: string) => env[key] ?? process.env[key] ?? '';

    return {
      plugins: [react()],
      define: {
        'process.env.OPENAI_API_KEY': JSON.stringify(read('OPENAI_API_KEY')),
        'process.env.OPENAI_BASE_URL': JSON.stringify(read('OPENAI_BASE_URL')),
        'process.env.OPENAI_MODEL': JSON.stringify(read('OPENAI_MODEL')),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
