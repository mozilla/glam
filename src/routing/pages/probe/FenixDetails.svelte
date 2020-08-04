<script>
import Doc from '../../../components/Doc.svelte';
</script>

<style>
  .drawer-section {
    padding: var(--space-2x) 0;
  }
  .drawer-section--end {
    align-self: end;
    min-height: calc(var(--increment) * 2);
    position: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--space-base);
  }

  /* FIXME: once @graph-paper/button supports href, use the Button component. */
  .docs-button {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: transparent;
    display: grid;
    width: 100%;
    color: var(--digital-blue-500);
    border: none;
    cursor: pointer;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    text-decoration: none;
    justify-content: center;
    grid-column-gap: var(--space-base);
    text-transform: uppercase;
    font-size: var(--text-015);
    font-weight: 500;
    padding: var(--space-base);
    transition: background-color 100ms;
    border-radius: var(--space-1h);
  }

  .docs-button:hover {
    background-color: var(--cool-gray-150);
  }

  .details-notice {
    font-size: var(--text-02);
    color: var(--cool-gray-700);
    font-style: italic;
  }
</style>

<!-- probe-details-content -->
<div class="probe-details-content">
  <p class="details-notice">
    Details for Fenix probes coming soon. Tracking in these issues:
    <a target="_blank" href="https://github.com/mozilla/glam/issues/724">
      #724
    </a>
    ,
    <a target="_blank" href="https://github.com/mozilla/glam/issues/692">
      #692
    </a>
    ,
    <a target="_blank" href="https://github.com/mozilla/glam/issues/691">
      #691
    </a>
    .
  </p>
</div>
<!-- /probe-details-content -->

<!-- probe-details-download -->
<div class="probe-details-download">

  <div class="drawer-section drawer-section--end">
    <a
      class="docs-button"
      href="https://docs.google.com/document/d/1qIkEDemnODbYuVIfpciohgEXcaFjrK_mfVG5FOSeVuM/preview"
      target="_blank">
      <Doc size={16} />
      Documentation
    </a>
  </div>
</div>
<!-- /probe-details-download -->
