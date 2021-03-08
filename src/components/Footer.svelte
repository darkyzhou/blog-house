<script>
  import { stores } from '@sapper/app';

  const { page } = stores();
</script>

<footer class="text-center text-gray-400 text-sm py-4 {$page.path === '/' && 'bg-gray-900'}">
  Made with ❤️ by darkyzhou
</footer>
