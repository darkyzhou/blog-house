<style>
  :global(.footer a) {
    color: var(--bg-carbonblue-200);
  }

  :global(.footer a:hover),
  :global(.footer a:focus) {
    text-decoration: underline;
  }
</style>

<script>
  import footerConfiguration from '../../config/footer-configuration.yml';

  let extraClasses;
  export { extraClasses as class };
</script>

<footer
  class="footer w-full max-w-[960px] mx-auto text-carbongray-300 text-sm py-2 sm:py-4 px-4 sm:px-12 flex justify-between flex-wrap {extraClasses}">
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
