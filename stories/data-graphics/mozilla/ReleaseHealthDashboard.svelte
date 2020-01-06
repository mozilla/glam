<script>
import { fly } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import Axis from '../../../src/components/data-graphics/guides/Axis.svelte';
import AxisLabel from '../../../src/components/data-graphics/guides/AxisLabel.svelte';
import AxisLine from '../../../src/components/data-graphics/guides/AxisLine.svelte';
import AxisTick from '../../../src/components/data-graphics/guides/AxisTick.svelte';
import { releases } from './data';

import { groupBy } from '../../../src/components/utils/transforms';

let xDomain = Array.from(new Set(releases.map((r) => r.minor)));
let yDomain = [0, 2];

releases.forEach((r) => {
  r.pass = Math.random() < 0.8;
});

let graphs = [
  { key: 'browserCrashRate', title: 'Browser Crash Rate' },
  { key: 'browserCrashIncidence', title: 'Browser Crash Incidence %' },
  { key: 'contentCrashRate', title: 'Content Crash Rate' },
  { key: 'contentCrashIncidence', title: 'Browser Crash Incidence %' },
];

// group by major version

const byVersion = groupBy(releases, 'major');

</script>

<style>
h2 { margin: 0; padding-left: 40px; font-size: var(--text-05)}
</style>

<div class=story>
  <h1 class=story__title>Mission Control</h1>
  <div style='display: grid; grid-template-columns: auto auto; grid-column-gap: var(--space-2x); justify-content: start; grid-row-gap: var(--space-4x);'>
  {#each graphs as {key, title}}
    <div>
      <h2>{title}</h2>
      <DataGraphic 
        {xDomain} 
        {yDomain} 
        width={400}
        height={250}
        bottom={50}
        yType="linear" 
        xType="scalePoint">
        <g slot=background>
          <LeftAxis lineStyle=short showBorder />
          <Axis side=bottom ticks={xDomain}>
              <g slot=ticks let:ticks>
                {#each Object.entries(byVersion) as [major, minors], i}
                  {#each minors as {minor}, j}
                    <AxisTick placement={minor} length={j > 0 ? 14 : 4} />
                  {/each}
                {/each}
                
              </g>
              <g slot=border>
                {#each Object.entries(byVersion) as [major, minors]}
                  <AxisLine start={minors[0].minor} end={minors.slice(-1)[0].minor} />
                {/each}
              </g>
              <g slot=labels let:ticks>
                {#each Object.entries(byVersion) as [major, minors], i}
                  <AxisLabel placement={minors[0].minor} color=var(--cool-gray-450)>
                    {minors[0].minor.split('.')[0]}
                  </AxisLabel>
                  {#each minors as {minor, pass}, j}
                    <AxisLabel placement={minor} offset={12}>
                      {minor.split('.').slice(1, Infinity).join('.')}
                    </AxisLabel>
                    <AxisLabel placement={minor} offset={24} color={pass ? 'var(--cool-gray-400)' : 'var(--pantone-red-500)'} fontSize={10} fontWeight={pass ? 'normal' : 'bold'}>
                      {pass ? '' : '-'}{~~(Math.random() * 10)}%
                    </AxisLabel>
                  {/each}
                {/each}

              </g>
          </Axis>
        </g>
        <g slot=body>
        {#each releases as release, i}
          <g in:fly={{
 duration: 500, delay: Math.random() * 300, y: 10, easing,
}}>
            <Point x={release.minor} y={release[key]} r={3} />

          </g>
        {/each}
        )
      </DataGraphic>
    </div>
  {/each}
  </div>
</div>