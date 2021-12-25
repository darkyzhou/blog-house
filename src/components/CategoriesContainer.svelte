<script>
  import { WaterflowController } from '../routes/_utils';
  import CategoryCard from './CategoryCard.svelte';

  let extraStyles;
  export { extraStyles as style };
  export let items;

  let columns = [];
  let controller = new WaterflowController('categories-container', 240, 4, items, (c) => {
    columns = c;
  });
</script>

<div
  class="flex gap-6 sm:gap-8 my-4 sm:my-8 px-24 sm:px-8 lg:px-16 w-full flex-grow justify-center"
  style="{extraStyles}"
  use:controller.observeResize>
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-4">
      {#each column as item}
        <a
          sveltekit:prefetch
          href="{`/categories/${item.slug}`}"
          class="block outline-none border-transparent border-2 focus:border-carbongray-200">
          <CategoryCard item="{item}" />
        </a>
      {/each}
    </div>
  {/each}
</div>
