<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Animated background particles
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
</script>

<header class="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 border-b border-white/20 dark:border-gray-800/50 overflow-hidden">
  <!-- Animated background elements -->
  {#if mounted}
    <div class="absolute inset-0 opacity-40 dark:opacity-20" in:fade={{ duration: 1000 }}>
      <!-- Floating orbs -->
      <div class="absolute top-4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute top-8 right-1/3 w-24 h-24 bg-indigo-400/20 rounded-full blur-lg animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute bottom-4 left-1/2 w-40 h-40 bg-cyan-400/15 rounded-full blur-2xl animate-pulse" style="animation-delay: 2s"></div>
    </div>
  {/if}
  
  <!-- Content -->
  <div class="relative z-10 container mx-auto px-4 py-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
          OceanHeart Preflight
        </h1>
      </div>
      <div class="flex items-center space-x-4">
        <!-- User menu will go here later -->
      </div>
    </div>
  </div>
  
  <!-- Bottom gradient border -->
  <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
</header>