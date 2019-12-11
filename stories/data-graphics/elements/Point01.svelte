<script>
import { fly, fade } from 'svelte/transition';

import Button from '../../../src/components/Button.svelte';
import ButtonGroup from '../../../src/components/ButtonGroup.svelte';


import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';

import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import marvel from '../data/marvel-strength-weight.json';
// import genericPointData from '../data/four-class.json';

let alignmentColors = {
  Good: 'blue',
  Bad: 'red',
  Neutral: 'black',
};

// let colors = {
//   a: 'var(--pantone-red-600)',
//   b: 'var(--digital-blue-500)',
//   c: 'var(--cool-gray-700)',
// };

// const makeScatter = (n = N) => Array.from({ length: n })
//   .map(() => ({ x: slowRandom() * 10, y: slowRandom() * 2 + 5 }));

// function jitter(data, ...dimensions) {
//   return data.map((d) => {
//     let di = { ...d };
//     dimensions.forEach((dim) => {
//       di[dim] += (Math.random() - 0.5) * 0.5;
//     });
//     return di;
//   });
// }

let which = ['Good', 'Bad', 'Neutral'];

function toggle(value) {
  if (which.includes(value)) which = [...which].filter((w) => w !== value);
  else which = [...which, value];
}

</script>

<style>

h3 {
  margin:0;
  margin-left: 45px;
  margin-right: 35px;
  width: 600px;
}

.offset {
  padding-left: 45px;
}

.data-graphic {
  font-family: var(--main-mono-font);
}

.story-body-controls {
  margin: var(--space-2x);
}

.story-body-controls label {
  font-size: var(--text-02);
  text-transform: uppercase;
  padding-bottom: var(--space-1h);
  padding-left: var(--space-base);
  color: var(--cool-gray-500);
}
</style>

<div class=story>
  <h1 class="story__title offset">Points</h1>
  <div class=dg>
    <h3>Height vs. Weight of Marvel Characters: an investigation</h3>
    <div class="story-body-controls offset">
      <label>Alignment</label>
      <ButtonGroup>
        {#each ['Good', 'Bad', 'Neutral'] as alignment, i}
          <Button 
          level=medium
          toggled={which.includes(alignment) }
          on:click={() => { toggle(alignment); }}
          compact>{alignment}</Button>
        {/each}
        </ButtonGroup>
      </div>

      <div class=data-graphic>
        <DataGraphic
          xDomain={[0, 1000]}
          yDomain={[0, 1000000]}
          xType=log
          yType=log
          width={600}
          height={350}
          top={10}
          leftBorder={true}
          rightBorder={true}
          topBorder={true}
          bottomBorder={true}
          borderThickness={2}
        >
        <LeftAxis />
        <BottomAxis lineStyle=long />
        <GraphicBody>
          <g in:fly={{ duration: 200, y: 5 }}>

            <!-- {#each genericPointData as {x, y, color}, i (x + y + color)}
              {#if which.includes(color)}
              <g>
                <Point 
                  r={3} x={x} y={y} 
                  fillOpacity={0.2} 
                  fill={colors[color]}
                  stroke={colors[color]} strokeWidth={2} strokeOpacity={0.4} />
                </g>
              {/if}
            {/each} -->
          {#each marvel as {strength, weight, height, alignment, URL}, i (URL)}
            {#if which.includes(alignment)}
            <g>
              <Point 
                r={1 + strength / 2} x={height} y={weight} 
                fillOpacity={0.3} 
                fill={alignmentColors[alignment]}
                opacity={0.6}
                stroke={alignmentColors[alignment]} strokeWidth=1 strokeOpacity={0.6} />
              </g>
            {/if}
          {/each}
        </g>
      </GraphicBody>

      </DataGraphic>
    </div>
  </div>
</div>