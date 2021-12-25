<script>
  import { WaterflowController } from '../routes/_utils';
  import TagCard from './TagCard.svelte';

  let extraStyles;
  export { extraStyles as style };
  export let items;

  let columns = [];
  let controller = new WaterflowController('tags-container', 150, 4, items, (c) => {
    columns = c;
  });
</script>

<div
  class="flex gap-4 sm:gap-6 my-4 px-6 sm:px-8 lg:px-16 w-full flex-grow justify-center"
  style={extraStyles}
  use:controller.observeResize
>
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-4">
      {#each column as item}
        <a
          sveltekit:prefetch
          href={`/tags/${item.slug}`}
          class="block outline-none border-transparent border-2 focus:border-carbongray-200"
        >
          <TagCard {item} />
        </a>
      {/each}
    </div>
  {/each}
</div>
