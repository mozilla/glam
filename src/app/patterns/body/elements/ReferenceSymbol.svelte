<script>
import { symbol, symbolStar as referenceSymbol } from 'd3-shape';

export let xLocation;
export let yLocation;
export let color = 'black';
</script>

<g style="transform:translate({xLocation}px, {yLocation}px)">
    <path 
      d={symbol().type(referenceSymbol).size(20)()} 
      fill={color}
    />
  </g>