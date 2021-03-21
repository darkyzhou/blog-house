const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss('./tailwind.js'),
    require('postcss-100vh-fix'),
    ...(process.env.NODE_ENV !== 'production'
      ? []
      : [
          require('@fullhuman/postcss-purgecss')({
            content: ['./src/**/*.svelte', './src/**/*.html'],
            defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || []
          }),
          require('cssnano')({
            preset: 'default'
          })
        ])
  ]
};
