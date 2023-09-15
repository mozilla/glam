<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  export let viewportMinWidth;
  export let size;
  let d = 50;
  let duration = 200;
  let mounted = false;
  onMount(() => {
    mounted = true;
  });

  let innerWidth = { window };
  $: size = innerWidth < viewportMinWidth ? 34 : 40;
</script>

<svelte:window bind:innerWidth />

{#if mounted}
  <svg
    height={size}
    fill="white"
    viewBox="0 {0 - 20} 133 {38 + 20 * 2}"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    xmlns:serif="http://www.serif.com/"
    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
  >
    <g>
      <path
        in:fly={{ duration, y: 5 }}
        d="M20.459,18.408L20.459,22.852L29.102,22.852C29.102,28.931 24.707,32.202 18.066,32.202C9.985,32.202 5.273,26.636 5.273,18.555C5.273,10.449 10.278,4.883 17.651,4.883C23.022,4.883 26.489,7.08 28.394,11.401L32.935,9.424C30.347,3.369 25.366,0 17.651,0C7.495,0 0,7.397 0,18.555C0,29.614 6.982,37.012 17.432,37.012C23.633,37.012 27.759,34.741 29.468,31.25L29.614,31.25L29.883,36.279L33.887,36.279L33.887,18.408L20.459,18.408Z"
        style="fill-rule:nonzero;"
      />
      <path
        in:fly={{ duration, delay: d, y: -5 }}
        d="M44.067,0.781L39.136,0.781L39.136,36.279L61.06,36.279L61.06,31.812L44.067,31.812L44.067,0.781Z"
        style="fill-rule:nonzero;"
      />
      <path
        in:fly={{ duration, delay: d * 2, y: 5 }}
        d="M89.624,36.279L94.824,36.279L80.591,0.635L77.344,0.635L63.086,36.279L68.164,36.279L71.094,28.784L86.694,28.784L89.624,36.279ZM72.778,24.487L78.809,9.082L79.028,9.082L85.034,24.487L72.778,24.487Z"
        style="fill-rule:nonzero;"
      />
      <path
        in:fly={{ duration, delay: d * 3, y: -5 }}
        d="M97.827,36.279L102.539,36.279L102.539,13.794L102.734,13.794L113.55,36.279L116.577,36.279L127.393,13.794L127.588,13.794L127.588,36.279L132.275,36.279L132.275,0.781L128.687,0.781L115.283,29.419L115.039,29.419L101.489,0.781L97.827,0.781L97.827,36.279Z"
        style="fill-rule:nonzero;"
      />
    </g>
  </svg>
{/if}
