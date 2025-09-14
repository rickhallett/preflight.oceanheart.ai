<script>
  import AnimatedCard from '$lib/components/AnimatedCard.svelte';
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <AnimatedCard>
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Share Your Feedback</h1>
    <p class="text-gray-600 dark:text-gray-300 mb-6">Help us improve by sharing your experience with OceanHeart Preflight.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Progress Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Progress</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-300">Survey Completion</span>
            <span class="text-green-600 dark:text-green-400 font-medium">✓ Complete</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-300">Coach Interaction</span>
            <span class="text-yellow-600 dark:text-yellow-400 font-medium">In Progress</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-300">Goals Set</span>
            <span class="text-blue-600 dark:text-blue-400 font-medium">3 Goals</span>
          </div>
        </div>
      </div>
      
      <!-- Feedback Form Preview -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Feedback Form</h3>
        <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div class="space-y-3">
            <div class="h-4 bg-indigo-200 dark:bg-indigo-700 rounded animate-pulse"></div>
            <div class="h-4 bg-indigo-200 dark:bg-indigo-700 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-indigo-200 dark:bg-indigo-700 rounded animate-pulse w-1/2"></div>
          </div>
          <div class="text-center text-indigo-600 dark:text-indigo-400 text-sm mt-4">
            Feedback form coming soon...
          </div>
        </div>
      </div>
    </div>
  </AnimatedCard>
</div>

