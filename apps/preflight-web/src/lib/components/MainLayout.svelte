<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Navbar from './Navbar.svelte';
  
  let { children, user } = $props();
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="app min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-blue-950/30">
  <Header />
  <Navbar {user} />
  
  <!-- Spacer for floating navbar -->
  <div class="h-20"></div>
  
  {#if mounted}
    <main 
      class="flex-1 container mx-auto px-4 py-8 relative"
      in:fly={{ y: 20, duration: 400, delay: 100 }}
    >
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style="background-image: radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0); background-size: 20px 20px;"></div>
      
      <!-- Content container with glass effect -->
      <div class="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 dark:border-gray-800/50 p-6 min-h-[60vh]">
        {#if children}
          <div in:fade={{ duration: 300, delay: 200 }}>
            {@render children()}
          </div>
        {/if}
      </div>
    </main>
  {:else}
    <!-- Loading placeholder -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
    </main>
  {/if}
  
  <Footer />
</div>