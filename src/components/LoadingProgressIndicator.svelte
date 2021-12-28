<style>
  :global(.indicator) {
    position: fixed;
    height: 3px;
    left: 0;
    pointer-events: none;
    will-change: opacity, right;
    transition: all 0s cubic-bezier(0, 0.55, 0.45, 1);
    transition-property: opacity, right;
    opacity: 0;
    right: 100%;
  }

  @media (max-width: 768px) {
    :global(.indicator) {
      height: 6px;
    }
  }

  :global(.indicator--loading) {
    transition-duration: 1s, 1600ms;
    opacity: 1;
    right: 5%;
  }

  :global(.indicator--finished) {
    transition-duration: 900ms, 600ms;
    opacity: 0;
    right: 0;
  }
</style>

<script>
  import { afterUpdate } from 'svelte';

  export let loading = false;

  let indicator;
  let previousLoading = false;
  let finished = false;

  function setClassName(element, enable, className) {
    if (enable) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  afterUpdate(() => {
    finished = previousLoading && !loading;
    previousLoading = loading;

    setClassName(indicator, finished, 'indicator--finished');
    if (finished) {
      setClassName(indicator, loading, 'indicator--loading');
    } else {
      setTimeout(() => setClassName(indicator, loading, 'indicator--loading'), 50);
    }
  });
</script>

<div class="indicator bg-carbonblue-400" bind:this="{indicator}"></div>
