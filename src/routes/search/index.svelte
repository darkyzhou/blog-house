<script>
  import { onMount } from 'svelte';

  let fetchingIndexes = true;
  let idx;
  let result;

  onMount(() => {
    const searchInput = document.getElementById('searchInput');

    fetch('/lunr-indexes.json')
      .then((response) => response.json())
      .then((indexes) => (idx = lunr.Index.load(indexes)));

    searchInput.addEventListener('input', () => {
      result = idx.search(searchInput.value);
    });
  });
</script>

<svelte:head>
  <script
    src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"
    integrity="sha256-DFDZACuFeAqEKv/7Vnu1Tt5ALa58bcWZegGGFNgET8g="
    crossorigin="anonymous"></script>
</svelte:head>
