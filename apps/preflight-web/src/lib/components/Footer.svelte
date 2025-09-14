<script lang="ts">
  let showThemePicker = $state(false);
  
  const themes = [
    { name: 'wintry', label: 'Wintry' },
    { name: 'modern', label: 'Modern' },
    { name: 'vintage', label: 'Vintage' },
    { name: 'seafoam', label: 'Seafoam' },
    { name: 'crimson', label: 'Crimson' }
  ];
  
  function setTheme(themeName: string) {
    document.body.setAttribute('data-theme', themeName);
    showThemePicker = false;
  }
</script>

<footer class="bg-surface-200-700-token border-t border-surface-300-600-token mt-auto">
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center">
      <p class="text-surface-600-300-token">&copy; 2025 OceanHeart AI</p>
      
      <!-- Theme Picker -->
      <div class="relative">
        <button 
          class="btn btn-sm variant-ghost-surface" 
          onclick={() => showThemePicker = !showThemePicker}
        >
          🎨
        </button>
        
        {#if showThemePicker}
          <div class="card p-4 absolute bottom-full right-0 mb-2 min-w-48">
            <h6 class="h6 mb-2">Choose Theme</h6>
            <div class="space-y-1">
              {#each themes as theme}
                <button 
                  class="btn btn-sm variant-ghost-surface w-full text-left"
                  onclick={() => setTheme(theme.name)}
                >
                  {theme.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</footer>