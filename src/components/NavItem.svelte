<script>
  export let caption;
  export let route;
  export let active;
</script>

<a
  class="block px-4 py-2 text-gray-200"
  class:text-gray-600="{active}"
  class:bg-gray-200="{active}"
  href="{route}">
  {caption}
</a>
