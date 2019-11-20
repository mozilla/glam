<script>
  import { symbol, symbolStar as referenceSymbol } from "d3-shape";

  export let xLocation;
  export let yLocation;
  export let color = "black";
  export let size = 30;
</script>

<g style="transform:translate({xLocation}px, {yLocation}px)">
  <path
    d={symbol()
      .type(referenceSymbol)
      .size(size)()}
    fill={color} />
</g>
