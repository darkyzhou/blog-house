<style>
</style>

<script>
  export let extraClasses = '';
  export let caption;
  export let backgroundSrc;
  export let route;
</script>

<a rel="prefetch" class="block group {extraClasses} relative cursor-pointer" href="{route}">
  <img alt="" src="{backgroundSrc}" class="object-cover pointer-events-none" />
  <div
    class="absolute inset-0 opacity-0 group-hover:opacity-100 h-full w-full grid place-items-center">
    <span class="text-2xl font-bold">{caption}</span>
  </div>
</a>
