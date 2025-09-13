<script lang="ts">
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.svg';
  import MainLayout from '$lib/components/MainLayout.svelte';
  import LandingPage from '$lib/components/LandingPage.svelte';
  import '../app.css';
  
  let { children, data } = $props();
  let showLanding = $state(true);

  onMount(() => {
    const lastCheckIn = localStorage.getItem('last-check-in');
    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn);
      const now = new Date();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (now.getTime() - lastCheckInDate.getTime() < sevenDays) {
        showLanding = false;
      }
    }
  });

  function handleProceed() {
    localStorage.setItem('last-check-in', new Date().toISOString());
    showLanding = false;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if showLanding}
  <LandingPage onproceed={handleProceed} />
{:else}
  <MainLayout user={data.user}>
    {@render children?.()}
  </MainLayout>
{/if}
