import constraints from '../../config/constraints.json';

const data = {
  name: constraints.base.blogName,
  short_name: constraints.base.blogName,
  description: constraints.base.description,
  dir: constraints.base.dir,
  lang: constraints.base.lang,
  theme_color: '#121619',
  background_color: '#121619',
  display: 'standalone',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
};

export async function get(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/manifest+json' });
  response.end(JSON.stringify(data));
}
