<script>
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { format } from 'd3-format';

import BuildIDComparison from '../BuildIDComparison.svelte';
import DistributionComparison from '../rollovers/DistributionComparison.svelte';
import ComparisonSummary from '../../../../components/data-graphics/ComparisonSummary.svelte';

import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import {
  buildIDToDate,
} from '../../../../components/data-graphics/utils/build-id-utils';

import { extractPercentiles } from '../../../../components/data-graphics/utils/percentiles';

export let data;
export let title;
export let key;
export let timeHorizon;
export let percentiles = [50];

let valueFmt = format(',.4r');
let countFmt = format(',d');

const probeType = getContext('probeType');

let yScaleType;
let yDomain;
let whichPercentileVersion = 'transformedPercentiles';
if (probeType === 'histogram') {
  yScaleType = 'scalePoint';
  yDomain = data[0].histogram.map((d) => d.bin);
} else if (probeType === 'scalar') {
  yScaleType = 'log';
  let upperDomain = Math.max(...data.map((d) => d.percentiles[95]));
  yDomain = [0, upperDomain];
  whichPercentileVersion = 'percentiles';
}

// FIXME: after demo remove this requirement
data = data.slice(0, -1);

let domain = writable(data.map((d) => d.label));

function setDomain(str) {
  const start = buildIDToDate(data[data.length - 1].label);
  let filtered = data;
  let daysAgo = str === 'WEEK' ? 7 : 30;
  if (str !== 'ALL_TIME') {
    start.setDate(start.getDate() - daysAgo);
    filtered = data.filter((d) => buildIDToDate(d.label) >= start);
  }
  domain.set(filtered.map((d) => d.label));
}

$: setDomain(timeHorizon);

let hovered = {};

let WIDTH = 450;
let HEIGHT = 350;

// FIXME: this is for demo purposes. use better build data.
let reference = data[data.length - 1];

const movingAudienceSize = tweened(0, { duration: 500, easing });

$: movingAudienceSize.set(reference.audienceSize);

function getPercentile(percentileBin, datum) {
  let percentileValue;
  if (probeType !== 'histogram') percentileValue = datum.percentiles[percentileBin];
  else percentileValue = datum.transformedPercentiles[percentileBin];
  return { label: datum.label, bin: percentileBin, value: percentileValue };
}

function getAllPercentiles(percentileBins, datum) {
  return percentileBins.map((p) => getPercentile(p, datum));
}

</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content max-content auto;
}

.summary {
  display:grid;
  grid-auto-flow:column;
  justify-content: end;
  font-size: 14px;
}

h4 {
  padding: 0px;
  margin:0px;
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.title-and-summary {
  display:grid;
  grid-template-columns: auto max-content max-content;
  grid-column-gap: var(--space-4x);
  justify-items: start;
  margin-bottom: var(--space-4x);
}

.bignum {
  width: max-content;
}

.bignum__label {
  font-size: var(--text-015);
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.bignum__value {
  font-size: var(--text-06);
  text-align: right;
}
</style>


<div class='title-and-summary'>
  <div>
    <h4>{title}</h4>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Latest Median (50th perc.)</div>
    <div class=bignum__value>{valueFmt(reference.percentiles[50])}</div>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Audience Size</div>
    <div class=bignum__value>{countFmt($movingAudienceSize)}</div>
  </div>
</div>

<div class=graphic-and-summary>
  <BuildIDComparison
    data={data}
    xDomain={$domain}
    yDomain={yDomain}
    timeHorizon={timeHorizon}
    lineColorMap={percentileLineColorMap}
    key={key}
    yScaleType={yScaleType}
    width={WIDTH}
    height={HEIGHT}
    transform={(p, d) => extractPercentiles(p, d, whichPercentileVersion)}
    metricKeys={percentiles}
    bind:reference={reference}
    bind:hovered={hovered}
    extractMouseoverValues={getPercentile}
  />

  <DistributionComparison 
    yType={yScaleType}
    width={125}
    height={HEIGHT}
    leftDistribution={hovered.datum ? hovered.datum.histogram : undefined}
    rightDistribution={reference.histogram}
    leftLabel={hovered.x}
    rightLabel={reference.label}
    colorMap={percentileLineColorMap}
    leftPercentiles={hovered.datum ? getAllPercentiles(percentiles, hovered.datum) : undefined}
    rightPercentiles={getAllPercentiles(percentiles, reference)}
    xDomain={['hovered', 'latest']}
    yDomain={yDomain}
  />
  
  <ComparisonSummary 
    left={hovered.datum ? hovered.datum.percentiles : hovered.datum} 
    right={reference.percentiles}
    leftLabel={hovered.x}
    rightLabel={reference.label}
    keySet={percentiles}
    colorMap={percentileLineColorMap}
    valueFormatter={valueFmt}
    keyFormatter={(perc) => `${perc}%`}
    />
</div>
    