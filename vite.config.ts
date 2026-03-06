import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const DEFAULT_SITE_URL = 'https://cityray.github.io/mydevice';

const routes = ['/', '/devices', '/features', '/benchmark'];

function normalizeSiteUrl(rawUrl: string): string {
  return rawUrl.replace(/\/+$/, '');
}

function seoAssetsPlugin(siteUrl: string): Plugin {
  return {
    name: 'generate-seo-assets',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl);
    },
    closeBundle() {
      const today = new Date().toISOString().split('T')[0];
      const urls = routes
        .map(
          (r) =>
            `  <url>\n    <loc>${siteUrl}${r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`
        )
        .join('\n');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      writeFileSync(resolve('dist', 'sitemap.xml'), xml);

      const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
      writeFileSync(resolve('dist', 'robots.txt'), robots);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || DEFAULT_SITE_URL);

  return {
    plugins: [react(), tailwindcss(), seoAssetsPlugin(siteUrl)],
    base: '/mydevice/',
    resolve: {
      alias: {
        '@': resolve('.', 'src')
      }
    },
    build: {
      outDir: 'dist'
    }
  };
});
