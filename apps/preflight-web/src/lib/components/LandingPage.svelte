<script lang="ts">
  let { onproceed } = $props();
  
  function proceed() {
    onproceed?.();
  }
</script>

<div class="landing-page min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
  <div class="container mx-auto px-4">
    <div class="card max-w-4xl mx-auto p-8 text-center">
      <div class="space-y-6">
        <!-- Hero Section -->
        <div>
          <h1 class="h1 font-bold text-primary-700-200-token mb-4">
            Welcome to OceanHeart Preflight
          </h1>
          <p class="text-xl text-surface-600-300-token">
            Your AI-powered companion for personal growth and performance optimization
          </p>
        </div>
        
        <!-- Project Description -->
        <div class="grid md:grid-cols-2 gap-8 my-12">
          <div class="card variant-ghost-surface p-6">
            <h3 class="h3 mb-4">🚀 What's New</h3>
            <ul class="space-y-2 text-left">
              <li>• Enhanced AI coaching algorithms</li>
              <li>• New survey and feedback system</li>
              <li>• Improved user interface with Skeleton UI</li>
              <li>• Real-time performance analytics</li>
            </ul>
          </div>
          
          <div class="card variant-ghost-surface p-6">
            <h3 class="h3 mb-4">✨ Features</h3>
            <ul class="space-y-2 text-left">
              <li>• Personalized coaching recommendations</li>
              <li>• Interactive surveys and assessments</li>
              <li>• Progress tracking and analytics</li>
              <li>• Secure authentication system</li>
            </ul>
          </div>
        </div>
        
        <!-- Release Notes -->
        <div class="card variant-ghost-primary p-6">
          <h3 class="h3 mb-4">📝 Latest Updates</h3>
          <div class="text-left space-y-3">
            <div>
              <strong>v0.1.0 - Application Layout System</strong>
              <p class="text-sm text-surface-600-300-token">
                Implemented new layout system with header, navigation, and footer components.
                Added theme picker for customizable user experience.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Call to Action -->
        <div class="pt-6">
          <button 
            class="btn variant-filled-primary btn-lg"
            onclick={proceed}
          >
            Continue to Application →
          </button>
          <p class="text-sm text-surface-500-400-token mt-2">
            This page appears for new users or users who haven't visited in 7 days
          </p>
        </div>
      </div>
    </div>
  </div>
</div>