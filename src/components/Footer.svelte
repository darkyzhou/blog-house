<script>
  import footerConfiguration from '../../config/footer-configuration.yml';
  import Rss16 from 'carbon-icons-svelte/lib/Rss16';

  // must be right after the imports
  const ICONS = []; //@MARK:FOOTER

  let extraClasses;
  export { extraClasses as class };
</script>

<div class="w-full">
  <footer
    class="footer text-center w-full max-w-[980px] mx-auto text-carbongray-300 text-sm py-6 px-4 sm:px-12 flex justify-center sm:justify-between items-end flex-wrap gap-2 {extraClasses}"
  >
    <div class="flex gap-6 text-carbongray-200 text-sm">
      {#if footerConfiguration.additional}
        {#each footerConfiguration.additional as item, i}
          {#if item.type === 'page'}
            <a
              data-sveltekit-preload-data
              href="/{item.target}"
              class="flex flex-col items-center gap-1"
            >
              {#if ICONS[i]}
                <svelte:component this={ICONS[i]} />
              {/if}
              {item.caption}
            </a>
          {:else if item.type === 'link'}
            <a target="_blank" href={item.target} class="flex flex-col items-center gap-1">
              {#if ICONS[i]}
                <svelte:component this={ICONS[i]} />
              {/if}
              {item.caption}
            </a>
          {:else if item.type === 'plain'}
            <div class="flex flex-col items-center gap-1">
              {#if ICONS[i]}
                <svelte:component this={ICONS[i]} />
              {/if}
              {item.caption}
            </div>
          {:else if item.type === 'rss'}
            <a target="_blank" href="/rss.xml" class="flex flex-col items-center gap-1">
              <Rss16 />
              RSS
            </a>
          {/if}
        {/each}
      {/if}
    </div>
    <div class="flex flex-col gap-1 text-center sm:text-right">
      {#if footerConfiguration.leftHtml}
        {@html footerConfiguration.leftHtml}
      {/if}
      {#if footerConfiguration.rightHtml}
        {@html footerConfiguration.rightHtml}
      {/if}
    </div>
  </footer>
</div>

<style>
  :global(.footer a) {
    color: var(--bg-carbonblue-100);
  }

  :global(.footer a:hover),
  :global(.footer a:focus) {
    text-decoration: underline;
  }
</style>
