<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { createMousePosition, createAnimatedValue, cn } from '$lib/utils/aceternity-adapter.js';
  
  interface Props {
    children?: any;
    className?: string;
    hover?: boolean;
    delay?: number;
  }
  
  let { 
    children, 
    className = '', 
    hover = true,
    delay = 0
  }: Props = $props();
  
  let cardElement = $state<HTMLElement>();
  let mounted = $state(false);
  let isHovered = $state(false);
  
  // Mouse tracking for 3D effect
  const { mouseX, mouseY, startTracking, stopTracking } = createMousePosition();
  let rotateX = $state(0);
  let rotateY = $state(0);
  
  // Animated scale for hover effect
  const scaleValue = createAnimatedValue(1);
  
  function handleMouseEnter(event: MouseEvent) {
    if (!hover || !cardElement) return;
    isHovered = true;
    $scaleValue = 1.02;
    startTracking();
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (!hover || !isHovered || !cardElement) return;
    
    const rect = cardElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    // Calculate rotation based on mouse position (reduced intensity)
    rotateY = (deltaX / rect.width) * 10;
    rotateX = -(deltaY / rect.height) * 10;
  }
  
  function handleMouseLeave() {
    if (!hover) return;
    isHovered = false;
    $scaleValue = 1;
    rotateX = 0;
    rotateY = 0;
    stopTracking();
  }
  
  onMount(() => {
    mounted = true;
    return () => {
      stopTracking();
    };
  });
</script>

{#if mounted}
  <div
    bind:this={cardElement}
    class={cn(
      'relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg transition-all duration-300',
      hover && 'cursor-pointer',
      className
    )}
    style="transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg) scale({$scaleValue}); transform-origin: center center;"
    onmouseenter={handleMouseEnter}
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
    role="button"
    tabindex="0"
    in:fly={{ y: 20, duration: 400, delay }}
  >
    <!-- Shimmer effect on hover -->
    {#if isHovered}
      <div 
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer rounded-xl"
        in:scale={{ duration: 200 }}
      ></div>
    {/if}
    
    <!-- Card content -->
    <div class="relative z-10">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
{:else}
  <!-- Loading placeholder -->
  <div class={cn('p-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl', className)}>
    <div class="space-y-3">
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  </div>
{/if}

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out;
  }
</style>