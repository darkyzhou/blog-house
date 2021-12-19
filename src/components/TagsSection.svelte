<style>
  .tagsContainer > li {
    display: flex;
    cursor: help;
  }

  .tagsContainer > li:not(:last-child) {
    margin-right: 6px;
  }

  .icon {
    color: var(--bg-carbonblue-100);
    margin-right: 4px;
  }
</style>

<script context="module">
  function isAtSameDay(a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDay() === dateB.getDay()
    );
  }
</script>

<script>
  import Calendar16 from 'carbon-icons-svelte/lib/Calendar16';
  import Pen16 from 'carbon-icons-svelte/lib/Pen16';
  import Document16 from 'carbon-icons-svelte/lib/Document16';

  export let article;
  export let textXs = false;
</script>

<ul class="tagsContainer font-light list-none p-0 flex flex-wrap gap-0.5">
  {#if article.printDate}
    <li title="发表日期">
      <span class="icon">
        <Calendar16 />
      </span>
      <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
        {article.printDate}
      </span>
    </li>
  {/if}
  {#if article.lastModifiedAt && !isAtSameDay(article.date, article.lastModifiedAt)}
    <li title="最近修改日期">
      <span class="icon">
        <Pen16 />
      </span>
      <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
        {article.printLastModifiedAt}
      </span>
    </li>
  {/if}
  <li title="字数">
    <span class="icon">
      <Document16 />
    </span>
    <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
      {article.wordsCount} 字
    </span>
  </li>
</ul>
