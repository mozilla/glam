<script>
  import MozillaLogo from '../icons/MozillaLogo.svelte';
</script>

<style>
  .glam-footer {
    grid-column: body-content;
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: var(--space-2x) auto;
    align-items: center;
  }
  .project-links {
    list-style: none;
    display: flex;
    font-size: var(--text-015);
    font-weight: 400;
    gap: var(--space-2x);
    padding: 0 var(--space-4x);
    margin: 0;
  }
  .project-links a {
    color: var(--cool-gray-700);
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
  <a class="mozilla-logo" href="https://www.mozilla.org/"><MozillaLogo /></a>
  <ul class="project-links">
    <li>
      <a href="https://docs.telemetry.mozilla.org/cookbooks/glam.html">Docs</a>
    </li>
    <li>
      <a href="https://www.mozilla.org/privacy/websites/#cookies">Cookies</a>
    </li>
    <li>
      <a href="https://matrix.to/#/#datatools:mozilla.org">Matrix</a>
    </li>
    <li>
      <a href="https://app.slack.com/client/T027LFU12/CB1EQ437S">Slack🔒</a>
    </li>
    <li><a href="https://github.com/mozilla/glam/">GitHub</a></li>
  </ul>
</div>
