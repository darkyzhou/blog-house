<style>
  .caption {
    background-color: var(--bg-gray-200);
    opacity: 0;
    transform: skew(100deg, -10deg) scale(0);
    will-change: transform, opacity;
    transition-property: transform, opacity;
    transition-duration: 350ms;
  }

  .link:hover .caption,
  .link:focus .caption {
    opacity: 0.8;
    transform: skew(180deg) scale(1);
  }

  .link:hover .imageMask,
  .link:focus .imageMask {
    filter: blur(2px);
  }
</style>

<script>
  export let extraClasses = '';
  export let caption;
  export let backgroundSrc;
  export let route;
</script>

<a
  sapper:prefetch
  class="link overflow-hidden grid cursor-pointer {extraClasses}"
  style="grid-template-areas: 'stack'"
  href="{route}">
  <div class="caption z-10 h-full w-full grid place-items-center" style="grid-area: stack">
    <span class="text-2xl font-bold">{caption}</span>
  </div>
  <div style="grid-area: stack">
    <img alt="" src="{backgroundSrc}" class="object-cover pointer-events-none w-full h-full" />
  </div>
</a>
