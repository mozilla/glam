<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  export let viewportMinWidth;
  export let size;
  let mounted = false;
  onMount(() => {
    mounted = true;
  });
  let y = 50;
  let duration = 400;
  let delay = 200;

  let innerWidth = { window };
  $: size = innerWidth < viewportMinWidth ? 22 : 24;
</script>

<style>
  svg {
    --dark: var(--digital-blue-250);
    --medium: var(--digital-blue-600);
    --light: var(--digital-blue-350);
    fill-rule: evenodd;
    clip-rule: evenodd;
    stroke-linejoin: round;
    stroke-miterlimit: 2;
  }
</style>

<svelte:window bind:innerWidth />

{#if mounted}
  <svg
    width="100%"
    height={size}
    viewBox="0 0 512 333"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xml:space="preserve"
    xmlns:serif="http://www.serif.com/"
    style="min-width: {size}px;">
    <g transform="matrix(1,0,0,1,-686.333,-953.365)">
      <g transform="matrix(-0.866025,-0.5,-0.5,0.866025,2318.33,620.811)">
        <g transform="matrix(1,0,0,1,-221.703,-128)">
          <g in:fly={{ y, duration, delay }}>
            <path
              d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
              style="fill:var(--medium);" />
            <path
              d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
              style="fill:var(--light);" />
            <path
              d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
              style="fill:var(--dark);" />
          </g>
        </g>
        <g transform="matrix(1,0,0,1,-110.851,-64)">
          <g in:fly={{ y, duration, delay: delay * 2 }}>
            <path
              d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
              style="fill:var(--medium);" />
            <path
              d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
              style="fill:var(--light);" />
            <path
              d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
              style="fill:var(--dark);" />
          </g>
        </g>
        <g>
          <g in:fly={{ y, duration, delay: delay * 3 }}>
            <path
              d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
              style="fill:var(--medium);" />
            <path
              d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
              style="fill:var(--light);" />
            <path
              d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
              style="fill:var(--dark);" />
          </g>
        </g>
      </g>
    </g>
  </svg>
{/if}
