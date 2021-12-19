<script>
  import { onMount } from 'svelte';

  export let type;
  let Icon;

  onMount(async () => {
    if (!type) {
      console.error('empty icon type');
    }
    try {
      const res = await import(`../../node_modules/carbon-icons-svelte/lib/${type}/${type}.svelte`);
      Icon = res.default;
    } catch (err) {
      // TODO: fallback icon
      console.error('failed to load icon', err);
    }
  });
</script>

<svelte:component this="{Icon}" />
