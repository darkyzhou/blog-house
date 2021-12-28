import basicConfiguration from '../../config/basic-configuration.yml';

const data = {
  name: basicConfiguration.blogName,
  short_name: basicConfiguration.blogName,
  description: basicConfiguration.description,
  dir: basicConfiguration.dir,
  lang: basicConfiguration.language,
  theme_color: '#121619',
  background_color: '#121619',
  display: 'standalone',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
};

export async function get() {
  return {
    body: data
  };
}
