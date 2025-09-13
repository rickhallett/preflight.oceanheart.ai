<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav style="padding: 1rem; display: flex; gap: 1rem; border-bottom: 1px solid #eee;">
  <a href="/">Home</a>
  <a href="/survey">Survey</a>
  <a href="/coach">Coach</a>
  <a href="/feedback">Feedback</a>
</nav>

<main style="padding: 1rem;">
  {@render children?.()}
</main>
