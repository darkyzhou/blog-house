<style>
  .tabHeader > * {
    flex-grow: 1;
    display: grid;
    place-items: center;
  }

  .tabHeader .icon {
    color: var(--bg-gray-200);
    display: flex;
    align-items: center;
    padding: 4px 6px;
    height: 100%;
  }

  .tabContent > * {
    display: none;
  }

  #toggle1:checked ~ .tabContent div:nth-child(1) {
    display: block;
  }

  #toggle1:checked ~ .tabHeader li:nth-child(1) .icon {
    color: var(--bg-gray-800);
    background-color: var(--bg-gray-200);
  }

  #toggle2:checked ~ .tabContent div:nth-child(2) {
    display: block;
  }

  #toggle2:checked ~ .tabHeader li:nth-child(2) .icon {
    color: var(--bg-gray-800);
    background-color: var(--bg-gray-200);
  }

  #toggle3:checked ~ .tabContent div:nth-child(3) {
    display: block;
  }

  #toggle3:checked ~ .tabHeader li:nth-child(3) .icon {
    color: var(--bg-gray-800);
    background-color: var(--bg-gray-200);
  }
</style>

<script>
  import { getIcon } from './icons';

  export let extraClasses = '';
</script>

<div class="flex gap-2 {extraClasses}">
  <input id="toggle1" type="radio" name="tab" class="hidden" checked />
  <input id="toggle2" type="radio" name="tab" class="hidden" />
  <input id="toggle3" type="radio" name="tab" class="hidden" />
  <ul class="tabHeader flex-none list-none flex flex-col">
    <li>
      <label class="icon" for="toggle1">
        <svelte:component this="{getIcon('message')}" extraClasses="w-8 h-8" />
      </label>
    </li>
    <li>
      <label class="icon" for="toggle2">
        <svelte:component this="{getIcon('heart')}" extraClasses="w-8 h-8" />
      </label>
    </li>
    <li>
      <label class="icon" for="toggle3">
        <svelte:component this="{getIcon('code')}" extraClasses="w-8 h-8" />
      </label>
    </li>
  </ul>
  <div class="tabContent flex-grow">
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
  </div>
</div>
