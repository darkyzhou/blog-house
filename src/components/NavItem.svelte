<script>
  export let caption;
  export let route;
  export let active;
</script>

<a
  sapper:prefetch
  class="block px-4 py-2 text-gray-200 {active && 'text-gray-600 bg-gray-200'}"
  href="{route}">
  {caption}
</a>
