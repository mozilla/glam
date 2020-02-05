<script>
import { fly, fade } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';

import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import Point from 'udgl/data-graphics/elements/Point.svelte';
import Axis from 'udgl/data-graphics/guides/Axis.svelte';
import AxisLabel from 'udgl/data-graphics/guides/AxisLabel.svelte';
import AxisLine from 'udgl/data-graphics/guides/AxisLine.svelte';
import AxisTick from 'udgl/data-graphics/guides/AxisTick.svelte';
import Button from 'udgl/Button.svelte';
import ButtonGroup from 'udgl/ButtonGroup.svelte';

import { groupBy } from 'udgl/utils/transforms';

import { releases } from './data';


let xDomain = Array.from(new Set(releases.map((r) => r.minor)));
let yDomain = [0, 2];

releases.forEach((r) => {
  r.pass = Math.random() < 0.8;
});

let graphs = [
  { key: 'browserCrashRate', title: 'Browser Crash Rate' },
  { key: 'browserCrashIncidence', title: 'Browser Crash Incidence Rate' },
  { key: 'contentCrashRate', title: 'Content Crash Rate' },
  { key: 'contentCrashIncidence', title: 'Browser Crash Incidence Rate' },
];

// group by major version

const byVersion = groupBy(releases, 'major');

let controlSet = true;

let rot = 0;
let alignments = ['start', 'middle', 'end'];

let botAlign = 'middle';
</script>

<style>
h2 { margin: 0; padding-left: 50px; font-size: var(--text-03); font-weight: normal;}
.control-set {
  padding: var(--space-base);
}

.control + .control {
  margin-top: var(--space-2x);
}
</style>

{#if controlSet}
<div style='
  position: absolute; right:0; top:0;
  display: grid;
  grid-auto-flow: column;
  padding: var(--space-2x);
  background-color: white;
  height:100vh;
'>
  <div class=control-set>
    <div class=control>
      <input type=range bind:value={rot} min={-90} max={90} />
    </div>
    <div class=control>
      <Button level=medium compact on:click={() => { rot = 0; }}>reset rotation</Button>
    </div>
    <div class=control>
    <ButtonGroup>
      {#each alignments as a}
      <Button level='medium' compact toggled={botAlign === a} on:click={() => { botAlign = a; }}>{a}</Button>
      {/each}
    </ButtonGroup>
    </div>
  </div>

</div>

{/if}

<div class=story>
  <h1 class=story__title>Release Health Dashboard</h1>

  <div style='display: grid; grid-template-columns: auto auto; grid-column-gap: var(--space-2x); justify-content: start; grid-row-gap: var(--space-4x);'>
  {#each graphs as {key, title}}
    <div>
      <h2>{title}</h2>
      <DataGraphic 
        {xDomain} 
        {yDomain}
        top={20}
        width={400}
        height={250}
        bottom={50}
        yType="linear" 
        xType="scalePoint">
        <g slot=background>
          <Axis side=left lineStyle=short showTicks={false} ticks={[0.5, 1, 1.5]} />
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
                  <AxisLabel align={botAlign} rotate={rot} placement={minors[0].minor} color=var(--cool-gray-450)>
                    {minors[0].minor.split('.')[0]}
                  </AxisLabel>
                  {#each minors as {minor, pass}, j}
                    <AxisLabel  align={botAlign} rotate={rot} placement={minor} offset={12}>
                      {minor.split('.').slice(1, Infinity).join('.')}
                    </AxisLabel>
                    <AxisLabel  align={botAlign} rotate={rot}  placement={minor} offset={24} color={pass ? 'var(--cool-gray-400)' : 'var(--pantone-red-500)'} fontSize={10} fontWeight={pass ? 'normal' : 'bold'}>
                      {pass ? '' : '-'}{~~(Math.random() * 10)}%
                    </AxisLabel>
                  {/each}
                {/each}

              </g>
          </Axis>
        </g>
        <g slot=body let:xScale let:yScale let:top let:bottom>
        {#each Object.entries(byVersion) as [major, minors],i}
          <rect
            in:fly={{ duration: 500, y: 10 * (i % 2 === 0 ? 1 : -1) }}
            x={xScale(minors[0].minor) - xScale.step() / 2 + 1} 
            y={top + 10}
            width={xScale(minors.slice(-1)[0].minor) - xScale(minors[0].minor) + xScale.step() - 2}
            height={bottom - top - 20}
            fill='var(--cool-gray-{150 + i * 50})'
            />
        {/each}
        {#each [0.5, 1, 1.5] as tick}
          <line 
            x1={xScale(releases[0].minor) + 1 - xScale.step() / 2}
            x2={xScale(releases[releases.length - 1].minor) + xScale.step() - 2}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke=white
          />
        {/each}
        {#each releases as release, i}
          <g in:fly={{
 duration: 500, delay: Math.random() * 300, y: 10, easing,
}}>
            <Point fill=var(--cool-gray-700) x={release.minor} y={release[key]} r={3} />
          </g>
        {/each}
        )
      </DataGraphic>
    </div>
  {/each}
  </div>
</div>