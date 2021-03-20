<script>
  import { stores } from '@sapper/app';

  export let extraClasses = '';
  export let extraStyles = '';
  export let tableOfContent;
  export let highlightedIndex;

  const { page } = stores();

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

<ul
  class="list-none p-0 text-carbongray-200 font-light cursor-pointer break-words {extraClasses}"
  style="{extraStyles}">
  {#each resolved as item, i}
    <li
      class="mt-2 mb-2 hover:underline {item.padding <= 0 ? 'text-sm' : 'text-xs'} {i ===
        highlightedIndex && 'text-carbonblue-300'}"
      style="padding-left: {item.padding}rem">
      {#if item.id}
        <a href="{$page.path}#{item.id}">{item.caption}</a>
      {:else}
        {item.caption}
      {/if}
    </li>
  {/each}
</ul>
