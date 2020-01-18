<style>
.main-footer {
  grid-column: main;
  display: flex;
  justify-content: flex-end;
  width: var(--main-content-width);
  margin: var(--space-2x) auto;
}
.project-links {
  list-style: none;
  display: grid;
  font-size: var(--text-015);
  font-weight: 500;
  grid-gap: var(--space-2x);
  grid-template-columns: auto auto auto;
  padding: var(--space-base) var(--space-4x);
  margin: 0;
}
.project-links a {
  color: var(--cool-gray-800);
}
</style>

<footer class="main-footer">
  <ul class="project-links">
    <li><a href="https://www.mozilla.org/privacy/websites/#cookies">Cookies</a></li>
    <li><a href="https://app.slack.com/client/T027LFU12/CB1EQ437S">Slack</a></li>
    <li><a href="https://github.com/mozilla/glam/">GitHub</a></li>
  </ul>
</footer>