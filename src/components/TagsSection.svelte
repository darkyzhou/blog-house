<style>
  .tagsContainer > li {
    display: flex;
    align-items: center;
    cursor: help;
  }

  .tagsContainer > li:not(:last-child) {
    margin-right: 1rem;
  }

  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
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
  import Book16 from 'carbon-icons-svelte/lib/Book16';
  import Tag16 from 'carbon-icons-svelte/lib/Tag16';
  import tagsConfiguration from '../../config/tags-configuration.yml';

  export let article;
</script>

<ul class="tagsContainer text-sm sm:text-base list-none p-0 flex flex-wrap mb-4">
  {#if article.printDate}
    <li title="发表日期">
      <span class="icon">
        <Calendar16 />
      </span>
      <span class="text-carbongray-300 cursor-auto text-sm">{article.printDate}</span>
    </li>
  {/if}
  {#if article.lastModifiedAt && !isAtSameDay(article.date, article.lastModifiedAt)}
    <li title="最近修改日期">
      <span class="icon">
        <Pen16 />
      </span>
      <span class="text-carbongray-300 cursor-auto text-sm">{article.printLastModifiedAt}</span>
    </li>
  {/if}
  <li title="字数与阅读时间">
    <span class="icon">
      <Book16 />
    </span>
    <span class="text-carbongray-300 text-sm">
      {article.wordsCount} 字
      {#if article.readingTime}
        ({article.readingTime} 分钟读完)
      {/if}
    </span>
  </li>
  {#if article.tags?.length > 0}
    <li title="标签">
      <span class="icon">
        <Tag16 />
      </span>
      {#each article.tags as tag, j}
        {#if tagsConfiguration.tags.some((t) => t.name === tag)}
          <a
            sveltekit:prefetch
            href="/tags/{tagsConfiguration.tags.find((t) => t.name === tag).slug}"
            class="text-carbongray-300 hover:underline cursor-pointer text-sm">
            {tag}
          </a>
        {:else}
          <span class="text-carbongray-300 text-sm">{tag}</span>
        {/if}

        {#if j < article.tags.length - 1}
          <span class="pl-0.5 pr-2 text-sm">,</span>
        {/if}
      {/each}
    </li>
  {/if}
</ul>
