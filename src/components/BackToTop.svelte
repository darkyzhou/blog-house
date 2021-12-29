<script>
  import ArrowUp32 from 'carbon-icons-svelte/lib/ArrowUp32';

  let extraClasses;
  export { extraClasses as class };
  export let show;

  function backToTop() {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
</script>

<div
  class="h-12 w-12 sm:h-16 sm:w-16 bottom-4 sm:bottom-8 right-4 sm:right-8 md:right-16 z-20 p-2 bg-carbongray-600 text-carbongray-100 grid place-items-center cursor-pointer {show
    ? 'opacity-90'
    : 'opacity-0 pointer-events-none'} {extraClasses}"
  style="position: fixed; transition-property: opacity; transition-duration: 250ms"
  on:click={backToTop}
>
  <ArrowUp32 class={show ? 'opacity-90' : 'opacity-0 pointer-events-none'} />
</div>
