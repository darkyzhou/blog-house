<script>
  import { WaterflowController } from '../routes/_utils';
  import TagCard from './TagCard.svelte';

  let extraStyles;
  export { extraStyles as style };
  export let tags;

  let columns = [];
  let controller = new WaterflowController('tags-container', 240, 4, tags, (c) => {
    columns = c;
  });
</script>

<div
  class="flex gap-6 sm:gap-8 my-4 sm:my-8 px-24 sm:px-8 lg:px-16 w-full flex-grow justify-center"
  style="{extraStyles}"
  use:controller.observeResize>
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-4">
      {#each column as tag}
        <a
          sveltekit:prefetch
          href="/tags/{tag.slug}"
          class="block outline-none border-transparent border-2 focus:border-carbongray-200">
          <TagCard tag="{tag}" />
        </a>
      {/each}
    </div>
  {/each}
</div>
