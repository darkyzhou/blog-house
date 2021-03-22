<style>
  .tabHeader > * {
    flex: 1 1 0%;
  }

  .tabHeader .icon {
    color: var(--bg-carbongray-200);
    display: flex;
    align-items: center;
    padding: 4px 6px;
    height: 100%;
  }

  .tabContent > * {
    display: none;
  }

  @media (max-width: 767px) {
    .tabContent .markdown-body {
      font-size: 0.875rem !important;
      line-height: 1.5rem !important;
    }
  }

  @media (min-width: 768px) {
    .tabContent .markdown-body {
      font-size: 1rem !important;
      line-height: 1.8rem !important;
    }
  }
</style>

<script>
  import { getIcon } from './icons';

  export let extraClasses = '';
  export let tabContents = [];

  $: toggleCss = tabContents
    .map(
      (_, i) => `
  #toggle${i + 1}:checked ~ .tabContent div:nth-child(${i + 1}) {
    display: block;
  }

  #toggle${i + 1}:checked ~ .tabHeader li:nth-child(${i + 1}) .icon {
    color: var(--bg-carbongray-800);
    background-color: var(--bg-carbongray-200);
  }
  `
    )
    .join('');

  $: toggleCssWrapped = `<style type='text/css'>${toggleCss}</style>`;
</script>

<svelte:head>
  {@html toggleCssWrapped}
</svelte:head>

<div class="flex {extraClasses}">
  {#each tabContents as _, i}
    <input id="toggle{i + 1}" type="radio" name="tab" class="hidden" checked="{!i}" />
  {/each}
  <ul class="tabHeader flex-none list-none flex flex-col">
    {#each tabContents as tab, i}
      <li>
        <label
          class="icon cursor-pointer outline-none border-transparent hover:border-carbongray-300 focus:border-carbongray-300 border-2"
          for="toggle{i + 1}"
          tabindex="0">
          <svelte:component this="{getIcon(tab.icon)}" extraClasses="w-8 h-8" />
        </label>
      </li>
    {/each}
  </ul>
  <div
    class="tabContent flex-grow p-2 h-full text-carbongray-100 leading-relaxed">
    {#each tabContents as tab}
      <div class="overflow-y-auto h-full markdown-body">
        {@html tab.contentHtml}
      </div>
    {/each}
  </div>
</div>
