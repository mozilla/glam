<script>

  import NumericHistogramView from '../../../src/app/patterns/body/histograms/NumericHistogramView.svelte';
  import GCMS_BY_BUILD from '../../../tests/data/gc_ms_build_id.json';

  // const gcmsByVersion = GCMS_BY_VERSION.response;
  const gcmsByBuild = GCMS_BY_BUILD.response;

  </script>
    
    <div class=story>
      <div style="width: var(--space-81x);">
        <h1 class="story__title">probe / <span class=probe-head>gc_ms</span></h1>
        <NumericHistogramView data={gcmsByBuild} />
      </div>
    </div>