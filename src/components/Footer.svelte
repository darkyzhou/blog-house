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
  import footerConfiguration from '../footer-configuration.yml';

  export let extraClasses = '';
</script>

<footer class="footer text-carbongray-300 text-sm py-2 px-4 sm:py-4 sm:px-12 flex justify-between flex-wrap {extraClasses}">
  {#if footerConfiguration.leftContentHtml}
    <p>
      {@html footerConfiguration.leftContentHtml}
    </p>
  {/if}
  {#if footerConfiguration.rightContentHtml}
    <p>
      {@html footerConfiguration.rightContentHtml}
    </p>
  {/if}
</footer>
