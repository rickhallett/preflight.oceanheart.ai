<script>
  import AnimatedCard from '$lib/components/AnimatedCard.svelte';
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <AnimatedCard>
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Wellness Survey</h1>
    <p class="text-gray-600 dark:text-gray-300 mb-6">Help us understand your wellness journey with a few quick questions.</p>
    
    <div class="space-y-4">
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="h-6 bg-blue-200 dark:bg-blue-700 rounded animate-pulse mb-2"></div>
        <div class="h-4 bg-blue-200 dark:bg-blue-700 rounded animate-pulse w-3/4"></div>
      </div>
      
      <div class="text-center text-gray-500 dark:text-gray-400">
        Form runtime coming soon...
      </div>
    </div>
  </AnimatedCard>
</div>

