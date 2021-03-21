<style>
  .indicator {
    position: fixed;
    left: 0;
    pointer-events: none;
    will-change: opacity, right;
    transition-property: opacity, right;
    transition-duration: 0s, 0s;
    opacity: 0;
    right: 100%;
  }

  .indicator--loading {
    transition-duration: 1s, 3s;
    opacity: 1;
    right: 5%;
  }

  .indicator--finished {
    transition-duration: 1s, 1s;
    opacity: 0;
    right: 0;
  }
</style>

<script>
  import { afterUpdate } from 'svelte';

  export let extraClasses = '';
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

<div class="indicator h-0.5 bg-carbonblue-300 {extraClasses}" bind:this="{indicator}"></div>
