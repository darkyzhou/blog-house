<script>
  import { balancer } from 'svelte-action-balancer';

  let extraClasses;
  export { extraClasses as class };
  export let extraStyles = '';
  export { extraStyles as style };
  export let tableOfContent;
  export let highlightedIndex;

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

<div class="text-carbongray-200 flex flex-col {extraClasses}" style={extraStyles}>
  {#each resolved as item, i}
    <div
      class="px-4 lg:px-6 py-1 border-transparent hover:border-carbongray-200 focus:border-carbongray-200 border-1 {i ===
        highlightedIndex && 'bg-carbongray-700'}"
    >
      {#if item.id}
        <a
          class={item.padding <= 0 ? 'text-sm' : 'text-xs'}
          style="padding-left: {item.padding}rem"
          sveltekit:noscroll
          use:balancer={{ ratio: 0.2 }}
          href="javascript:document.getElementById('{item.id.toLowerCase()}').scrollIntoView(true);"
        >
          {item.caption}
        </a>
      {:else}
        <span
          class={item.padding <= 0 ? 'text-sm' : 'text-xs'}
          sveltekit:noscroll
          use:balancer={{ ratio: 0.2 }}
          style="padding-left: {item.padding}rem"
        >
          {item.caption}
        </span>
      {/if}
    </div>
  {/each}
</div>
