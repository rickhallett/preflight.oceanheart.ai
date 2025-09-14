<script lang="ts">
  import { page } from '$app/stores';
  
  let { user } = $props();
  let isAuthenticated = $derived(!!user);
  
  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/login', label: 'Login' }
  ];
  
  const authenticatedLinks = [
    { href: '/', label: 'Home' },
    { href: '/survey', label: 'Survey' },
    { href: '/coach', label: 'Coach' },
    { href: '/feedback', label: 'Feedback' }
  ];
  
  let currentLinks = $derived(isAuthenticated ? authenticatedLinks : publicLinks);
  let currentPath = $derived($page.url.pathname);
</script>

<nav class="bg-surface-50-900-token border-b border-surface-300-600-token">
  <div class="container mx-auto px-4">
    <ul class="flex space-x-6 py-3">
      {#each currentLinks as link}
        <li>
          <a 
            href={link.href}
            class="text-surface-700-200-token hover:text-primary-700-200-token transition-colors {currentPath === link.href ? 'font-semibold text-primary-700-200-token' : ''}"
          >
            {link.label}
          </a>
        </li>
      {/each}
      
      {#if isAuthenticated}
        <li class="ml-auto">
          <a 
            href="/logout"
            class="text-surface-700-200-token hover:text-primary-700-200-token transition-colors"
          >
            Logout
          </a>
        </li>
      {/if}
    </ul>
  </div>
</nav>