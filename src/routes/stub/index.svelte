<script context="module">
  export async function preload({ params, query }) {
    // FIXME: this is a hacky way to make sapper generate static files when running svelte export
    // here is a related mr that might change the situation: https://github.com/sveltejs/sapper/pull/1288
    await this.fetch('sitemap.xml');
    await this.fetch('robots.txt');
    await this.fetch('lunr-indexes.json');
    await this.fetch('site.webmanifest');
    return this.redirect(302, '/');
  }
</script>
