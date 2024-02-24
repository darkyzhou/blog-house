<script>
  import { balancer } from 'svelte-action-balancer';
  import { getStores } from '$app/stores';

  let extraClasses;
  export { extraClasses as class };
  export let extraStyles = '';
  export { extraStyles as style };
  export let tableOfContent;
  export let highlightedIndex;

  const { page } = getStores();

  let resolved;
  $: {
    const greatestHeadingLevel = [...tableOfContent].sort(
      (a, b) => a.headingLevel - b.headingLevel
    )[0].headingLevel;
    const startingIndex = tableOfContent.findIndex(
      (item) => item.headingLevel === greatestHeadingLevel
    );
    resolved = tableOfContent.slice(startingIndex).map((item) => ({
      ...item,
      padding: item.headingLevel - greatestHeadingLevel
    }));
  }
</script>

<div class="py-2 text-carbongray-200 flex flex-col {extraClasses}" style={extraStyles}>
  {#each resolved as item, i}
    {#if item.id}
      <a
        class="py-1 hover:underline {item.padding <= 0 ? 'text-sm' : 'text-xs'} {i ===
          highlightedIndex && 'text-carbonblue-300'}"
        style="padding-left: {item.padding}rem"
        sveltekit:noscroll
        use:balancer={{ ratio: 0.2 }}
        href="javascript:document.getElementById('{item.id.toLowerCase()}').scrollIntoView(true);"
      >
        {item.caption}
      </a>
    {:else}
      <span
        class="py-1 hover:underline {item.padding <= 0 ? 'text-sm' : 'text-xs'} {i ===
          highlightedIndex && 'text-carbonblue-300'}"
        sveltekit:noscroll
        use:balancer={{ ratio: 0.2 }}
        style="padding-left: {item.padding}rem"
      >
        {item.caption}
      </span>
    {/if}
  {/each}
</div>
