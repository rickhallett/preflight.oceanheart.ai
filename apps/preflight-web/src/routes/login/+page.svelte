<script lang="ts">
  function redirectToLogin() {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const authUrl = `https://passport.oceanheart.ai/auth?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  }
</script>

<div class="container h-full mx-auto flex justify-center items-center min-h-[60vh]">
  <div class="card p-8 text-center max-w-md">
    <h2 class="h2 mb-4 text-primary-700-200-token">Authentication Required</h2>
    <p class="mb-6 text-surface-600-300-token">
      To continue, you will be redirected to our secure identity provider, 
      <strong>OceanHeart Passport</strong>, to log in.
    </p>
    
    <div class="card variant-ghost-tertiary p-4 mb-6">
      <p class="text-sm">
        🔒 Your credentials are handled securely by our trusted authentication service.
        You will be redirected back here after successful login.
      </p>
    </div>
    
    <button 
      class="btn variant-filled-primary"
      onclick={redirectToLogin}
    >
      Proceed to Login →
    </button>
    
    <p class="text-xs text-surface-500-400-token mt-4">
      By continuing, you agree to be redirected to passport.oceanheart.ai
    </p>
  </div>
</div>