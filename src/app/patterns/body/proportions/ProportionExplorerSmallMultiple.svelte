<script>
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { format } from 'd3-format';

import BuildIDComparison from '../BuildIDComparison.svelte';
import DistributionComparison from '../rollovers/DistributionComparison.svelte';
import ComparisonSummary from '../../../../components/data-graphics/ComparisonSummary.svelte';

import {
  buildIDToDate,
} from '../../../../components/data-graphics/utils/build-id-utils';

export function extractProportions(activeKeys, convertedData, which = 'proportions') {
  return activeKeys
    .map((key) => convertedData.map((data) => {
      const value = data[which][key];
      return {
        label: data.label,
        bin: key,
        value,
      };
    }));
}


export let data;
export let title;
export let key;
export let timeHorizon;
export let proportions;
export let activeProportions;
export let colorMap = () => 'var(--digital-blue-500)';


let valueFmt = format(',.4r');
let countFmt = format(',d');
const percentFormatter = format('.0p');


const probeType = getContext('probeType');

let yScaleType = 'linear';
let yDomain = [0, 1];
let whichTransformation = 'proportions';
// if (probeType === 'histogram') {
//   yScaleType = 'scalePoint';
//   yDomain = data[0].histogram.map((d) => d.bin);
// } else if (probeType === 'scalar') {
//   yScaleType = 'log';
//   let upperDomain = Math.max(...data.map((d) => d.percentiles[95]));
//   yDomain = [0, upperDomain];
//   whichTransformation = 'counts';
// }

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

function getProportion(activeProportion, datum) {
  return { label: datum.label, bin: activeProportion, value: datum.proportions[activeProportion] };
}

function getAllProportions(activeProportions, datum) {
  return activeProportions.map((p) => getProportion(p, datum));
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
  <!-- <div class=bignum>
    <div class=bignum__label>⭑ Latest Median (50th perc.)</div>
    <div class=bignum__value>{valueFmt(reference.percentiles[50])}</div>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Audience Size</div>
    <div class=bignum__value>{countFmt($movingAudienceSize)}</div>
  </div> -->
</div>

<div class=graphic-and-summary>
  <BuildIDComparison
    data={data}
    xDomain={$domain}
    yDomain={yDomain}
    timeHorizon={timeHorizon}
    lineColorMap={colorMap}
    key={key}
    yScaleType={yScaleType}
    yTickFormatter={percentFormatter}
    width={WIDTH}
    height={HEIGHT}
    transform={(p, d) => extractProportions(p, d, whichTransformation)}
    metricKeys={proportions}
    bind:reference={reference}
    bind:hovered={hovered}
    extractMouseoverValues={getProportion}
  />

  <DistributionComparison 
    yType={yScaleType}
    yTickFormatter={percentFormatter}
    width={125}
    height={HEIGHT}
    showViolins={false}
    leftDistribution={hovered.datum ? hovered.datum.proportions : undefined}
    rightDistribution={reference.proportions}
    leftLabel={hovered.x}
    rightLabel={reference.label}
    colorMap={colorMap}
    leftPercentiles={hovered.datum ? getAllProportions(proportions, hovered.datum) : undefined}
    rightPercentiles={getAllProportions(proportions, reference)}
    xDomain={['hovered', 'latest']}
    yDomain={yDomain}
  />
  <!-- 
  <ComparisonSummary 
    left={hovered.datum} 
    right={reference}
    leftLabel={hovered.x}
    rightLabel={reference.label}
    percentiles={proportions} /> -->
</div>
    