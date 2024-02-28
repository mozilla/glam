<script>
  import { onMount } from 'svelte';

  let consentGiven = false;

  onMount(() => {
    consentGiven = localStorage.getItem('cookieConsent') === 'true';
  });

  /* eslint-disable */
  function initializeGA4() {
    // Load the GA4 script dynamically
    var script = document.createElement('script');
    script.async = true;
    script.src =
      'https://www.googletagmanager.com/gtag/js?id={{ GA_TRACKING_ID }}';
    document.head.appendChild(script);

    // Initialize GA4 tracking
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', '{{ GA_TRACKING_ID }}');
  }
  /* eslint-enable */

  function giveConsent() {
    localStorage.setItem('cookieConsent', 'true');
    consentGiven = true;
  }

  function rejectCookies() {
    localStorage.setItem('cookieConsent', 'false');
    consentGiven = false;
  }

  $: if (consentGiven) {
    initializeGA4();
  }
</script>

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f4f4f4;
    padding: 20px;
    text-align: center;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  }
  .cookie-banner p {
    margin: 0 0 10px 0;
  }
  .cookie-banner button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    margin-right: 10px;
  }
  .cookie-settings {
    margin-top: 20px;
    background-color: #e9ecef;
    padding: 10px;
    border-radius: 5px;
  }
</style>

{#if !consentGiven}
  <div class="cookie-banner">
    <p>
      We use cookies to enhance your experience, by continuing to visit this
      site you agree to our use of cookies. <a
        href="https://www.mozilla.org/en-US/privacy/websites/#cookies"
        target="_blank">Learn More</a
      >.
    </p>
    <button on:click={giveConsent}>Accept</button>
    <button on:click={rejectCookies}>Reject</button>
  </div>
{/if}
