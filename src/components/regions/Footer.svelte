<script>
  import MozillaLogo from 'udgl/icons/MozillaLogo.svelte';
</script>

<style>
  .glam-footer {
    grid-column: main;
    display: flex;
    justify-content: space-between;
    width: var(--main-content-width);
    margin: var(--space-2x) auto;
    align-items: center;
  }
  .project-links {
    list-style: none;
    display: grid;
    font-size: var(--text-015);
    font-weight: 500;
    grid-gap: var(--space-2x);
    grid-template-columns: auto auto auto;
    padding: 0 var(--space-4x);
    margin: 0;
  }
  .project-links a {
    color: var(--cool-gray-800);
  }
  .mozilla-logo {
    color: #000;
    margin-left: var(--space-4x);
    display: flex;
    align-items: center;
  }
  .mozilla-logo:hover {
    text-decoration: none;
  }
</style>

<div class="glam-footer">
  <a class="mozilla-logo" href="https://www.mozilla.org/">
    <MozillaLogo />
  </a>
  <ul class="project-links">
    <li>
      <a href="https://www.mozilla.org/privacy/websites/#cookies">Cookies</a>
    </li>
    <li>
      <a href="https://app.slack.com/client/T027LFU12/CB1EQ437S">Slack</a>
    </li>
    <li>
      <a href="https://github.com/mozilla/glam/">GitHub</a>
    </li>
  </ul>
</div>
