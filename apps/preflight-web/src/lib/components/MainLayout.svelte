<script lang="ts">
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Navbar from './Navbar.svelte';
  
  let { children, user } = $props();
</script>

<div class="app min-h-screen flex flex-col">
  <Header />
  <Navbar {user} />
  
  <main class="flex-1 container mx-auto px-4 py-8">
    {@render children?.()}
  </main>
  
  <Footer />
</div>