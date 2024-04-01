<script>
  import { scaleLinear } from 'd3-scale';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import { distributionComparisonGraph } from '../../utils/constants';
  import { formatCompact } from '../../utils/formatters';
  import { store } from '../../state/store';

  export let innerHeight;
  export let innerWidth;
  export let density;
  export let topTick;
  export let sampleCount;
  export let tooltipLocation;

  let height = (innerHeight * distributionComparisonGraph.heightMult) / 2;
  let color = 'var(--digital-blue-350)';
  let binSelector = 'bin';
  let offsetX = distributionComparisonGraph.alignOffsetX;
  let width =
    innerWidth * distributionComparisonGraph.widthMult -
    distributionComparisonGraph.right -
    distributionComparisonGraph.left;
  let maxHeight = height - distributionComparisonGraph.top;
  let minHeight = distributionComparisonGraph.bottom;
  let probeKind = $store.probe.details.kind;
  let categoricalProbeLabels = probeKind !== "categorical" ? [] : $store.probe.details.labels.filter((l) => $store.activeBuckets.includes(l));
  let formatPercent = (t) =>
    Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(t);
  let activeDensity = probeKind !== "categorical" ? density : density.filter((v, i) => { if($store.activeBuckets.includes(categoricalProbeLabels[i])) return v} )

  $: y = scaleLinear().domain([0, topTick]).range([minHeight, maxHeight]);

  const bucketWidth = (width * 1.0101) / activeDensity.length;
  const spaceBetweenBars = bucketWidth / 10;
  const barOffsetX = spaceBetweenBars / 2;
  const barWidth = bucketWidth - spaceBetweenBars;

  const buildBucketTxt = (index, bin) => {
    if(probeKind === "categorical") {
      return categoricalProbeLabels[index]
    } else {
      return index === activeDensity.length - 1
        ? `sample value ≥ ${bin}`
        : `${bin} ≤ sample value ≤ ${activeDensity[index + 1][binSelector]}`
    }
  }
</script>

<style>
  .hovd {
    opacity: 0;
  }
  .hovd:hover {
    opacity: 1;
    fill: var(--cool-gray-100);
    z-index: 999;
  }
</style>

<g style="fill: {color};">
  {#each activeDensity as { bin, value }, i}
    <rect
      stroke={color}
      x={offsetX + i * bucketWidth + barOffsetX}
      y={maxHeight - y(value) + minHeight}
      height={y(value) - minHeight}
      width={barWidth}
    />
  {/each}
</g>

<g style="fill: {'#fafafa'};">
  {#each activeDensity as { bin, value }, i}
    {@const bucketTxt = buildBucketTxt(i, bin)}
    {@const valTxt = `  |  ${formatPercent(value)} of samples (${formatCompact(
      sampleCount * value
    )})`}
    <rect
      x={offsetX + i * bucketWidth + barOffsetX}
      y="0"
      height={maxHeight}
      width={barWidth}
      class="hovd"
      use:tooltipAction={{
        text: bucketTxt + valTxt,
        location: tooltipLocation,
        alignment: 'center',
      }}
    />
  {/each}
</g>
