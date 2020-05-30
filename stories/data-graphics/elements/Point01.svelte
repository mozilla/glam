<script>
import { fly } from 'svelte/transition';

import Button from 'udgl/Button.svelte';
import ButtonGroup from 'udgl/ButtonGroup.svelte';


import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import GraphicBody from 'udgl/data-graphics/GraphicBody.svelte';
import Point from 'udgl/data-graphics/elements/Point.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';

import marvel from '../data/marvel-strength-weight.json';

let alignmentColors = {
  Good: 'blue',
  Bad: 'red',
  Neutral: 'black',
};

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
