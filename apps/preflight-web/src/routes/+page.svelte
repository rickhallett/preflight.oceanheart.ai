<script>
  import AnimatedCard from '$lib/components/AnimatedCard.svelte';
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <!-- Hero Section -->
  <div class="text-center space-y-4">
    <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
      Welcome to OceanHeart Preflight
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300">
      Your journey to wellness starts here
    </p>
  </div>

  <!-- Feature Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <AnimatedCard delay={100}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Survey</h2>
      <p class="text-gray-600 dark:text-gray-300">Complete your wellness assessment to get personalized recommendations.</p>
      <a href="/survey" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Start Survey
      </a>
    </AnimatedCard>
    
    <AnimatedCard delay={200}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Coach</h2>
      <p class="text-gray-600 dark:text-gray-300">Get AI-powered coaching tailored to your wellness goals.</p>
      <a href="/coach" class="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
        Meet Coach
      </a>
    </AnimatedCard>
    
    <AnimatedCard delay={300}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Feedback</h2>
      <p class="text-gray-600 dark:text-gray-300">Review your progress and share your experience.</p>
      <a href="/feedback" class="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Give Feedback
      </a>
    </AnimatedCard>
  </div>
  
  <!-- Stats Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
    <AnimatedCard delay={400} className="text-center">
      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
      <div class="text-gray-600 dark:text-gray-300">Users Helped</div>
    </AnimatedCard>
    
    <AnimatedCard delay={500} className="text-center">
      <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">95%</div>
      <div class="text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
    </AnimatedCard>
    
    <AnimatedCard delay={600} className="text-center">
      <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
      <div class="text-gray-600 dark:text-gray-300">Support Available</div>
    </AnimatedCard>
  </div>
</div>
