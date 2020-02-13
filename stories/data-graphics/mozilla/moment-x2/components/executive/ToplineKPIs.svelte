<script>
import { getContext, onMount } from 'svelte';
import { fly } from 'svelte/transition';
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Point from 'udgl/data-graphics/elements/Point.svelte';
import ArrowUp from 'udgl/icons/ArrowUp.svelte';
import ArrowDown from 'udgl/icons/ArrowDown.svelte';
import Subsection from '../Subsection.svelte';
import BigNumber from '../BigNumber.svelte';
import { formats } from '../../utils/formatters';

const data = getContext('data');

let mounted = false;
onMount(() => {
  mounted = true;
});
const F2F = 'Fennec-to-Fenix';
const KPIs = [
  {
    sublabel: `${F2F} Migration`,
    label: '% of Migrated Fennec Clients',
    key: 'fennecToFenixRetention',
    description: 'description here',
    arrow: 'up',
    value: 0.22, // -0.05,
    subvalue: 'of 84% of eligible Fennec clients',
    format: 'percent',
  },
  {
    sublabel: `${F2F} Migration`,
    label: 'Established Active Users',
    key: 'fennecEstablishedRetention',
    value: 0.62,
    arrow: 'up',
    subvalue: '+3% from last week',
    format: 'rate',
    description: 'A returning user was present in the previous period and is present in the current period.  The user was established during the previous period.',
  },
  {
    sublabel: `${F2F} Migration`,
    label: 'Retention Rate',
    key: 'fenixEstablishedRetention',
    description: 'description here',
    arrow: 'up',
    subvalue: '+1% from last week',
    value: 0.79,
    format: 'percent',
  },
  {
    sublabel: `${F2F} Growth Metric`,
    label: 'Change Ratio',
    key: 'f2fChangeRatio',
    arrow: 'down',
    description: 'description here',
    subvalue: `${-1}% from last week`,
    value: -0.05, // -0.05,
    format: 'ratio',
  },
  {
    sublabel: 'Fenix vs. Fennec 1yr ago',
    label: 'Retention Diff',
    key: 'successMetric',
    subvalue: `-${1}% from last week`,
    arrow: 'down',
    description: 'description here',
    value: 0.1, // -0.05,
    format: 'ratio',
  },
  {
    sublabel: `${F2F} Clients`,
    label: 'Overall Retention Rate',
    subvalue: `+${0.5}% from last week`,
    arrow: 'up',
    description: 'description here',
    value: Math.random(), // Math.random(),
    format: 'percent',
  },
];

function extents(data, key) {
  const values = data.map((d) => d[key]);
  return [Math.min(...values), Math.max(...values)];
}

function dateRanges(data, key) {
  return [data[0][key], data[data.length - 1][key]];
}

</script>

  <Subsection>
    <h3 slot='title'>At a glance</h3>
    <div class="at-a-glance">
    {#if mounted}
    {#each KPIs as {sublabel, label, value, format, description, subvalue, arrow, key}, i}
      <BigNumber description={description}>
        <span slot=sublabel>{sublabel}</span>
        <span slot=label>
          {label}
        </span>
        <div slot=big-number>
          <div style='display: grid; grid-auto-flow: column; justify-content: end; grid-column-gap: var(--space-2x);'>
          {#if key}
          <div in:fly={{ duration: 500 }} style='display: grid; align-items: center;'>
            <DataGraphic
              xDomain={dateRanges(data, 'date')}
              yDomain={extents(data, key)}
              xType=time
              yType=linear
              top={5}
              left={0}
              right={3}
              bottom={5}
              width={50}
              height={15}
            >
              <Line 
                color={arrow ? (arrow === 'up' ? 'var(--pond-green-500)' : 'var(--pantone-red-500)') : 'var(--cool-gray-600)'}
                strokeWidth=2
                lineDrawAnimation={{ duration: 800, delay: 300 }} data={data} xAccessor=date yAccessor={key} />
              <g
                in:fly={{ duration: 500, delay: 600, y: 30 * (arrow === 'up' ? 1 : -1) }}>
                <Point 
                  color={arrow ? (arrow === 'up' ? 'var(--pond-green-500)' : 'var(--pantone-red-500)') : 'var(--cool-gray-600)'}
                  r=3  size=3 x={data[data.length - 1].date} y={data[data.length - 1][key]} />
              </g
              >
            </DataGraphic
            >
          </div>
          {/if}
          <Tweenable params={{ duration: 750 }} value={value} from={0} let:tweenValue={v}>{formats[format](v)}</Tweenable>
          {#if arrow}
          <div in:fly={{ duration: 500, delay: 250, y: 10 * (arrow === 'up' ? 1 : -1) }} style="color: {arrow === 'up' ? 'var(--pond-green-400)' : 'var(--pantone-red-400)'}">
            <svelte:component this={arrow === 'up' ? ArrowUp : ArrowDown} size={20} />
          </div>
          {/if}
          </div>
        </div>
        
        <span slot=small-number>
          {#if subvalue}
            <span style='color: {arrow ? (arrow === 'up' ? 'var(--pond-green-700)' : 'var(--pantone-red-500)') : 'var(--cool-gray-600)'}'>
              {subvalue}
            </span>
          {/if}
        </span>
      </BigNumber>
    {/each}
    {/if}
    </div>
  </Subsection>