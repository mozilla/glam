<script>
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { format } from 'd3-format';
import { cubicOut as easing } from 'svelte/easing';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';

import { proportionSmallMultiple } from '../utils/constants';

export let count;
export let total;
export let referenceCount;
export let isReference;
export let hovered = false;

const countFormat = format(',.0f');

const audienceSize = tweened(0, { duration: 800, delay: 200, easing });

$: audienceSize.set(count);

let audienceXScale;
let mounted = false;
onMount(() => { mounted = true; });

</script>

<style>
.audience-size {
  font-size: var(--text-015);
  color: var(--cool-gray-500);
  font-family: var(--main-mono-font);
}
</style>

<td class="data-cell data-cell--secondary">
    <div>
        <div class='audience-size'>
            {countFormat($audienceSize)}
          </div>
    {#if mounted}
      <DataGraphic
        width={proportionSmallMultiple.width}
        height={proportionSmallMultiple.height}
        left={5}
        right={3}
        top={0}
        bind:xScale={audienceXScale}
        xDomain={[0, 1]}
        yDomain={[0, 1]}
        xType={'linear'}
      >
        <line x1={audienceXScale(0)} x2={audienceXScale(1)} y1={3} y2={3} stroke='var(--cool-gray-400)' stroke-dasharray="4,1" />
        <line x1={audienceXScale(0)} x2={audienceXScale($audienceSize / total)} y1={3} y2={3} stroke-width=2 stroke='var(--cool-gray-500)'/>
        {#if isReference}
          <ReferenceSymbol xLocation={audienceXScale($audienceSize / total)} yLocation={3} color=var(--cool-gray-700) />
        {:else}
          <circle cx={audienceXScale($audienceSize / total)} cy={3} r=2.5 fill=var(--cool-gray-500) />
        {/if}
        {#if hovered}
          <ReferenceSymbol xLocation={audienceXScale(referenceCount / total)} yLocation={3} color=var(--cool-gray-500) />
          <text 
            font-size=10
            font-weight=bold
            text-anchor=middle
            x={audienceXScale(referenceCount / total)} y={3 + 12} 
            fill=var(--pantone-red-500)
            >ref.</text>
        {/if}
      </DataGraphic>
    {/if}
    </div>
</td>