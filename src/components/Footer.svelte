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
  import footerConfiguration from '../../config/footer-configuration.yml';

  let extraClasses;
  export let useGrayBg = false;
  export { extraClasses as class };
</script>

<footer
  class="footer text-carbongray-300 text-sm py-2 sm:py-4 px-4 md:px-8 lg:px-12 xl:px-24 flex justify-between flex-wrap {useGrayBg &&
    'bg-carbongray-900'} {extraClasses}">
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
