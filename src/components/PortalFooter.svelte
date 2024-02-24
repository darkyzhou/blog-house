<script>
  import footerConfiguration from '../../config/footer-configuration.yml';

  let extraClasses;
  export { extraClasses as class };
</script>

<footer
  class="footer w-full max-w-[980px] mx-auto text-carbongray-300 text-sm py-2 sm:py-4 px-4 sm:px-12 flex justify-center sm:justify-between flex-wrap {extraClasses}"
>
  {#if footerConfiguration.leftHtml}
    {@html footerConfiguration.leftHtml}
  {/if}
  {#if footerConfiguration.rightHtml}
    {@html footerConfiguration.rightHtml}
  {/if}
</footer>

<style>
  :global(.footer a) {
    color: var(--bg-carbonblue-200);
  }

  :global(.footer a:hover),
  :global(.footer a:focus) {
    text-decoration: underline;
  }
</style>
