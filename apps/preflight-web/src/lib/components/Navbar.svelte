<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { createScrollPosition } from '$lib/utils/aceternity-adapter.js';
  
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
  
  // Floating navigation behavior
  let visible = $state(true);
  let lastScrollY = $state(0);
  const { scrollY, startTracking, stopTracking } = createScrollPosition();
  
  // Handle scroll-based show/hide
  $effect(() => {
    const currentScrollY = $scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past threshold - hide navbar
      visible = false;
    } else {
      // Scrolling up or at top - show navbar
      visible = true;
    }
    lastScrollY = currentScrollY;
  });
  
  onMount(() => {
    startTracking();
    return stopTracking;
  });
</script>

{#if visible}
  <nav 
    class="fixed top-4 inset-x-0 mx-auto z-50 max-w-2xl px-4"
    in:fly={{ y: -100, duration: 300 }}
    out:fade={{ duration: 200 }}
  >
    <div class="bg-white/80 dark:bg-black/80 backdrop-blur-lg rounded-full border border-gray-200/20 dark:border-gray-800/20 shadow-lg shadow-gray-500/5 dark:shadow-gray-900/20">
      <ul class="flex items-center justify-center space-x-6 px-6 py-3">
        {#each currentLinks as link}
          <li>
            <a 
              href={link.href}
              class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm font-medium relative {currentPath === link.href ? 'text-blue-600 dark:text-blue-400' : ''}"
            >
              {link.label}
              {#if currentPath === link.href}
                <span 
                  class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  in:fly={{ y: 4, duration: 200 }}
                ></span>
              {/if}
            </a>
          </li>
        {/each}
        
        {#if isAuthenticated}
          <li class="border-l border-gray-200/40 dark:border-gray-700/40 pl-6">
            <a 
              href="/logout"
              class="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </a>
          </li>
        {/if}
      </ul>
    </div>
  </nav>
{/if}