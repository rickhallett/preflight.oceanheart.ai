<script lang="ts">
  import { createAnimatedValue, createSpringValue, cn } from '$lib/utils/aceternity-adapter.js';
  import { scale } from 'svelte/transition';
  
  interface Props {
    children?: any;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    onclick?: () => void;
    disabled?: boolean;
    loading?: boolean;
  }
  
  let { 
    children, 
    className = '', 
    variant = 'primary',
    size = 'md',
    href,
    onclick,
    disabled = false,
    loading = false
  }: Props = $props();
  
  // Animation states
  let isHovered = $state(false);
  let isPressed = $state(false);
  
  const scaleValue = createSpringValue(1, { stiffness: 0.4, damping: 0.8 });
  const shadowValue = createAnimatedValue(0);
  
  // Variant styles
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-transparent',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-transparent'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Event handlers
  function handleMouseEnter() {
    if (disabled || loading) return;
    isHovered = true;
    $scaleValue = 1.02;
    $shadowValue = 8;
  }
  
  function handleMouseLeave() {
    if (disabled || loading) return;
    isHovered = false;
    isPressed = false;
    $scaleValue = 1;
    $shadowValue = 0;
  }
  
  function handleMouseDown() {
    if (disabled || loading) return;
    isPressed = true;
    $scaleValue = 0.98;
  }
  
  function handleMouseUp() {
    if (disabled || loading) return;
    isPressed = false;
    $scaleValue = isHovered ? 1.02 : 1;
  }
  
  function handleClick() {
    if (disabled || loading) return;
    onclick?.();
  }
  
  const Component = href ? 'a' : 'button';
</script>

<svelte:element 
  this={Component}
  href={href}
  class={cn(
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait',
    className
  )}
  style="transform: scale({$scaleValue}); box-shadow: 0 {$shadowValue}px {$shadowValue * 2}px rgba(0, 0, 0, 0.1);"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  onclick={handleClick}
  disabled={disabled || loading}
  role="button"
  tabindex="0"
>
  <!-- Animated shine effect -->
  {#if isHovered && !disabled && !loading}
    <div 
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine rounded-lg"
      in:scale={{ duration: 300 }}
    ></div>
  {/if}
  
  <!-- Loading spinner -->
  {#if loading}
    <div class="mr-2 animate-spin">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        ></circle>
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  {/if}
  
  <!-- Button content -->
  <span class="relative z-10">
    {#if children}
      {@render children()}
    {/if}
  </span>
  
  <!-- Ripple effect on click -->
  {#if isPressed && !disabled && !loading}
    <div 
      class="absolute inset-0 bg-white/20 rounded-lg animate-ping"
      in:scale={{ duration: 200 }}
    ></div>
  {/if}
</svelte:element>

<style>
  @keyframes shine {
    0% { 
      transform: translateX(-100%) skewX(-12deg); 
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% { 
      transform: translateX(200%) skewX(-12deg); 
      opacity: 0;
    }
  }
  
  .animate-shine {
    animation: shine 0.8s ease-out;
  }
</style>