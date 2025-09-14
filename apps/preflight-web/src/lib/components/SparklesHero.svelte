<script lang="ts">
  import SparklesCore from './SparklesCore.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  interface Props {
    title?: string;
    subtitle?: string;
    className?: string;
  }
  
  let {
    title = "Preflight",
    subtitle = "Your journey to wellness starts here",
    className = ""
  }: Props = $props();
  
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="relative flex flex-col items-center justify-center min-h-[40vh] w-full {className}">
  <!-- Sparkles Background -->
  <div class="absolute inset-0 w-full h-full">
    <SparklesCore
      background="transparent"
      minSize={0.4}
      maxSize={1.4}
      particleDensity={1200}
      particleColor="#3b82f6"
      className="w-full h-full"
    />
  </div>
  
  <!-- Content -->
  <div class="relative z-10 text-center space-y-4 px-4">
    {#if mounted}
      <div in:fade={{ duration: 800, delay: 200 }}>
        <!-- Main Title with Underline Effect -->
        <h1 class="text-6xl md:text-8xl lg:text-9xl font-bold relative">
          <!-- Gradient Text -->
          <span class="bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 bg-clip-text text-transparent">
            {title}
          </span>
          
          <!-- Animated Underline -->
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full max-w-xs">
            <div class="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse"></div>
            <div class="h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-1 animate-shimmer"></div>
          </div>
        </h1>
      </div>
      
      {#if subtitle}
        <div in:fade={{ duration: 600, delay: 600 }}>
          <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {subtitle}
          </p>
        </div>
      {/if}
    {:else}
      <!-- Loading placeholder -->
      <div class="animate-pulse">
        <div class="h-16 md:h-24 lg:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-64 mx-auto"></div>
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
      </div>
    {/if}
  </div>
  
  <!-- Additional Sparkle Layer for depth -->
  <div class="absolute inset-0 w-full h-full opacity-50">
    <SparklesCore
      background="transparent"
      minSize={0.2}
      maxSize={0.8}
      particleDensity={800}
      particleColor="#8b5cf6"
      className="w-full h-full"
    />
  </div>
  
  <!-- Gradient Overlay for better text readability -->
  <div class="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-white/5 dark:from-black/5 dark:to-black/5 pointer-events-none"></div>
</div>

<style>
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
    background-size: 200px 100%;
    animation: shimmer 3s ease-in-out infinite;
  }
</style>