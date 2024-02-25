<script>
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
  import { OVERLAY_SCROLLBAR_SETTINGS_OTHER } from '../utils/constants';

  // must be right after the imports
  const ICONS = []; //@MARK:TABS

  let extraClasses;
  export { extraClasses as class };
  export let tabContents = [];

  let activeTabIndex = 0;
</script>

<div class="flex {extraClasses}">
  <div
    id="profileTabContainer"
    class="tabContent flex-grow p-2 h-full text-carbongray-100 leading-relaxed"
  >
    {#each tabContents as tab, i}
      {#if activeTabIndex === i}
        <div class="h-full">
          <OverlayScrollbarsComponent class="h-full" options={OVERLAY_SCROLLBAR_SETTINGS_OTHER}>
            <div class="prose markdown">
              {@html tab.contentHtml}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      {/if}
    {/each}
  </div>
  <ul class="tabHeader flex-none list-none flex flex-col">
    {#each tabContents as _, i}
      <li
        class="flex-1 flex items-center px-1 py-2 h-full text-carbongray-200 cursor-pointer outline-none border-transparent hover:border-carbongray-300 focus:border-carbongray-300 border-2 {activeTabIndex ===
          i && 'text-carbongray-800 bg-carbongray-200'}"
        tabindex="0"
        on:click={() => {
          activeTabIndex = i;
        }}
      >
        <span class="w-8 h-8">
          <svelte:component this={ICONS[i]} />
        </span>
      </li>
    {/each}
  </ul>
</div>

<style>
  @media (max-width: 767px) {
    .tabContent .markdown {
      font-size: 0.875rem !important;
      line-height: 1.5rem !important;
    }
  }

  @media (min-width: 768px) {
    .tabContent .markdown {
      font-size: 1rem !important;
      line-height: 1.8rem !important;
    }
  }
</style>
