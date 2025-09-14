<script>
  import AnimatedCard from '$lib/components/AnimatedCard.svelte';
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <AnimatedCard>
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">AI Wellness Coach</h1>
    <p class="text-gray-600 dark:text-gray-300 mb-6">Your personal AI coach is here to guide you on your wellness journey.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-3">
        <h3 class="font-semibold text-gray-800 dark:text-gray-100">What I can help with:</h3>
        <ul class="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• Personalized wellness recommendations</li>
          <li>• Goal setting and tracking</li>
          <li>• Habit formation strategies</li>
          <li>• Progress monitoring</li>
        </ul>
      </div>
      
      <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div class="h-4 bg-purple-200 dark:bg-purple-700 rounded animate-pulse mb-2"></div>
        <div class="h-4 bg-purple-200 dark:bg-purple-700 rounded animate-pulse w-2/3 mb-2"></div>
        <div class="h-4 bg-purple-200 dark:bg-purple-700 rounded animate-pulse w-1/2"></div>
        <div class="text-center text-purple-600 dark:text-purple-400 text-sm mt-3">
          LLM coaching flow coming soon...
        </div>
      </div>
    </div>
  </AnimatedCard>
</div>

