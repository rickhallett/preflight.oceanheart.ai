<script>
  import AnimatedCard from '$lib/components/AnimatedCard.svelte';
  import AnimatedButton from '$lib/components/AnimatedButton.svelte';
  import SparklesHero from '$lib/components/SparklesHero.svelte';
</script>

<div class="space-y-12">
  <!-- Hero Section with Sparkles -->
  <SparklesHero 
    title="Preflight" 
    subtitle="Your journey to wellness starts here"
    className="mb-16"
  />
  
  <div class="max-w-4xl mx-auto space-y-8">

  <!-- Feature Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <AnimatedCard delay={100}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Survey</h2>
      <p class="text-gray-600 dark:text-gray-300">Complete your wellness assessment to get personalized recommendations.</p>
      <div class="mt-4">
        <AnimatedButton href="/survey" variant="primary">
          Start Survey
        </AnimatedButton>
      </div>
    </AnimatedCard>
    
    <AnimatedCard delay={200}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Coach</h2>
      <p class="text-gray-600 dark:text-gray-300">Get AI-powered coaching tailored to your wellness goals.</p>
      <div class="mt-4">
        <AnimatedButton href="/coach" variant="primary">
          Meet Coach
        </AnimatedButton>
      </div>
    </AnimatedCard>
    
    <AnimatedCard delay={300}>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Feedback</h2>
      <p class="text-gray-600 dark:text-gray-300">Review your progress and share your experience.</p>
      <div class="mt-4">
        <AnimatedButton href="/feedback" variant="primary">
          Give Feedback
        </AnimatedButton>
      </div>
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
</div>
