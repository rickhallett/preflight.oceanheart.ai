<script lang="ts">
  import { onMount } from 'svelte';
  import { cn, random } from '$lib/utils/aceternity-adapter.js';
  
  interface Props {
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    particleColor?: string;
    className?: string;
  }
  
  let {
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 1200,
    particleColor = "#FFFFFF",
    className = ""
  }: Props = $props();
  
  let containerElement: HTMLDivElement;
  let particles: Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    velocityX: number;
    velocityY: number;
    life: number;
    maxLife: number;
  }> = $state([]);
  
  let animationId: number;
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
    initializeParticles();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  });
  
  function initializeParticles() {
    if (!containerElement) return;
    
    const rect = containerElement.getBoundingClientRect();
    const area = rect.width * rect.height;
    const numParticles = Math.floor(area / particleDensity);
    
    const newParticles = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push(createParticle(i, rect.width, rect.height));
    }
    particles = newParticles;
  }
  
  function createParticle(id: number, width: number, height: number) {
    return {
      id,
      x: random.between(0, width),
      y: random.between(0, height),
      size: random.between(minSize, maxSize),
      opacity: random.between(0.3, 1),
      velocityX: random.between(-0.5, 0.5),
      velocityY: random.between(-0.5, 0.5),
      life: 0,
      maxLife: random.between(120, 300)
    };
  }
  
  function animate() {
    if (!containerElement || !mounted) return;
    
    const rect = containerElement.getBoundingClientRect();
    
    particles = particles.map(particle => {
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.life++;
      
      // Update opacity based on life cycle
      const lifeRatio = particle.life / particle.maxLife;
      if (lifeRatio < 0.3) {
        particle.opacity = lifeRatio / 0.3;
      } else if (lifeRatio > 0.7) {
        particle.opacity = (1 - lifeRatio) / 0.3;
      }
      
      // Reset particle if it's dead or out of bounds
      if (particle.life >= particle.maxLife || 
          particle.x < 0 || particle.x > rect.width ||
          particle.y < 0 || particle.y > rect.height) {
        return createParticle(particle.id, rect.width, rect.height);
      }
      
      return particle;
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Handle resize
  let resizeTimeout: NodeJS.Timeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (mounted) {
        initializeParticles();
      }
    }, 300);
  }
  
  onMount(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  });
</script>

<svelte:window on:resize={handleResize} />

<div 
  bind:this={containerElement}
  class={cn("relative overflow-hidden", className)}
  style="background: {background};"
>
  {#if mounted}
    <div class="absolute inset-0 pointer-events-none">
      {#each particles as particle (particle.id)}
        <div
          class="absolute rounded-full animate-pulse"
          style="
            left: {particle.x}px;
            top: {particle.y}px;
            width: {particle.size}px;
            height: {particle.size}px;
            background-color: {particleColor};
            opacity: {particle.opacity};
            box-shadow: 0 0 {particle.size * 2}px {particleColor};
          "
        ></div>
      {/each}
    </div>
  {/if}
  
  <!-- Gradient mask for softer edges -->
  <div 
    class="absolute inset-0 pointer-events-none"
    style="
      background: radial-gradient(circle at center, transparent 0%, transparent 40%, {background} 100%);
    "
  ></div>
</div>

<style>
  .animate-pulse {
    animation: sparkle-pulse 2s ease-in-out infinite;
  }
  
  @keyframes sparkle-pulse {
    0%, 100% { 
      transform: scale(0.8); 
      opacity: 0.7; 
    }
    50% { 
      transform: scale(1.2); 
      opacity: 1; 
    }
  }
</style>