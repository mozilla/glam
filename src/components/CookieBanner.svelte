<script>
    import { onMount } from 'svelte';
  
    let consentGiven = false;
    let settingsOpen = false; // To toggle the settings view
  
    onMount(() => {
      consentGiven = localStorage.getItem('cookieConsent') === 'true';
    });
  
    function giveConsent() {
      localStorage.setItem('cookieConsent', 'true');
      consentGiven = true;
    }
  
    function rejectCookies() {
      localStorage.setItem('cookieConsent', 'false');
      consentGiven = false;
    }
  
    function toggleSettings() {
      settingsOpen = !settingsOpen;
    }
  </script>
  
  {#if !consentGiven}
  <div class="cookie-banner">
    <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
    <button on:click={toggleSettings}>Manage cookie settings</button>
    <button on:click={giveConsent}>Accept</button>
    <button on:click={rejectCookies}>Reject</button>
    
    {#if settingsOpen}
    <div class="cookie-settings">
      <!-- Placeholder for detailed settings from Mozilla org-->
      <p>Cookie settings panel...</p>
    </div>
    {/if}
  </div>
  {/if}
  
  <style>
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
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