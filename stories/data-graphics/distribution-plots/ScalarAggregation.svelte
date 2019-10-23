<script>
import ACTIVE_TICKS_BUILD from '../../../tests/data/browser_engagement_active_ticks_build_id.json';
import ScalarAggregationView from '../../../src/app/patterns/body/scalars/ScalarAggregationView.svelte';

</script>

<div class=story>

  <h1 class="story__title">probe / <span
  class=probe-head>browser_engagement_active_ticks</span></h1>
  <div style="width: var(--space-81x);">
      <ScalarAggregationView data={ACTIVE_TICKS_BUILD.response} />
  </div>

</div>