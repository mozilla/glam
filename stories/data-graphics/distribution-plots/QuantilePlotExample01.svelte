<script>

import QuantilePlot from '../../../src/components/data-graphics/QuantilePlot.svelte';
import QQPlot from '../../../src/components/data-graphics/QQPlot.svelte';
import LinePlot from '../../../src/components/data-graphics/LinePlot.svelte';
import GCMS_BY_VERSION from '../../../tests/data/gc_ms_version.json';
import GCMS_BY_BUILD from '../../../tests/data/gc_ms_build_id.json';
import { makeDataset } from './shared';

const gcmsByVersion = GCMS_BY_VERSION.response;
const gcmsByBuild = GCMS_BY_BUILD.response;
// client_agg_type.

let gcmsVersion01 = makeDataset(gcmsByVersion);

function sortByBuildID(a, b) {
  if (a.metadata.build_id < b.metadata.build_id) return -1;
  if (a.metadata.build_id >= b.metadata.build_id) return 1;
  return 0;
}

function sortByLabel(a, b) {
  if (a.label < b.label) return -1;
  if (a.label >= b.label) return 1;
  return 0;
}

gcmsVersion01 = [gcmsVersion01[0], gcmsVersion01[1], { ...gcmsVersion01[0], label: '71' }];
let gcmsVersion02 = makeDataset(gcmsByVersion);
gcmsVersion02 = [gcmsVersion02[0], gcmsVersion02[1], { ...gcmsVersion02[0], label: '71' }, { ...gcmsVersion02[1], label: '72' }];
let gcmsVersion03 = [...gcmsVersion02, { ...gcmsVersion02[0], label: '73' }, { ...gcmsVersion02[1], label: '74' }, { ...gcmsVersion02[0], label: '75' }, { ...gcmsVersion02[0], label: '76' }];

let gcmsBuild = makeDataset(gcmsByBuild, 'build_id');

gcmsBuild.sort(sortByLabel);
const v = gcmsBuild[0];
</script>

<style>
h2 {
  margin:0;
  padding:0;
  padding-left: 50px;
}

.plot {
  margin-top: var(--space-4x);
  margin-bottom: var(--space-4x);
}

hr {
  border: 1px solid var(--cool-gray-200);
}


</style>

<div class=story>
  <h1 class="story__title">probe / <span class=probe-head>gc_ms</span></h1>
  <hr />

  <div class=plot>
    <h2>By Version</h2>
    <QQPlot data={gcmsVersion01} />
  </div>
  <hr />
  <div class=plot>
      <h2>By Build ID</h2>
      <LinePlot width={800} height={400} data={gcmsBuild.slice(70)} units="ms" />
    </div>
    <div class=plot>
      <h2>By Build ID</h2>
      <LinePlot width={800} height={400} data={gcmsBuild.slice(gcmsBuild.length - 7)} units="ms" />
    </div>
    <div class=plot>
      <h2>By Build ID</h2>
      <LinePlot width={800} height={400} data={gcmsBuild.slice(gcmsBuild.length - 30)} units="ms" />
    </div>
  <!-- <div class=plot-set>
    <QuantilePlot data={gcmsVersion01} />
    <QuantilePlot width=500 data={gcmsVersion01} />
  </div>
  <div class=plot-set>
    <QuantilePlot data={gcmsVersion02} />
  </div>
  <div class=plot-set>
    <QuantilePlot data={gcmsVersion03} />
  </div> -->
  <!-- <div class=plot-set>
    <QuantilePlot aggregationLevel="build_id" data={gcmsBuild} height=400 width=1000 />
  </div> -->
</div>