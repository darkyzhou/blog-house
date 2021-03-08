<style>
  .imageMask::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--bg-gray-900);
    opacity: 0.2;
  }
</style>

<script>
  export let extraClasses = '';
  export let caption;
  export let backgroundSrc;
  export let route;
</script>

<a sapper:prefetch class="block group {extraClasses} relative cursor-pointer" href="{route}">
  <div class="imageMask relative">
    <img alt="" src="{backgroundSrc}" class="object-cover pointer-events-none w-full h-full" />
  </div>
  <div
    class="absolute inset-0 opacity-0 group-hover:opacity-100 h-full w-full grid place-items-center">
    <span class="text-2xl font-bold">{caption}</span>
  </div>
</a>
