<style>
  :global(.footer a) {
    color: var(--bg-carbonblue-100);
  }

  :global(.footer a:hover),
  :global(.footer a:focus) {
    text-decoration: underline;
  }
</style>

<script>
  import config from '../config.json';

  export let extraClasses = '';
</script>

<footer class="footer text-carbongray-300 text-sm py-2 px-4 sm:py-4 sm:px-12 flex justify-between flex-wrap {extraClasses}">
  {#if config.footer.left}
    <p>
      {@html config.footer.left}
    </p>
  {/if}
  {#if config.footer.right}
    <p>
      {@html config.footer.right}
    </p>
  {/if}
</footer>
