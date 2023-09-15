<script>
  import { fly } from 'svelte/transition';
  import { spring } from 'svelte/motion';

  const q = spring(80, { stiffness: 0.05, damping: 0.05 });

  const flyParams = { duration: 500, y: 60, x: -60 };
  const inc = 100;

  setTimeout(() => {
    q.set(0);
  }, inc * 3);
</script>

<style>
  svg {
    --dark: var(--cool-gray-400);
    --med: var(--cool-gray-300);
    --light: var(--cool-gray-200);
    --op-fill: var(--cool-gray-500);
    --op-stroke: var(--cool-gray-050);
    --op: 0.6;
    --q-fill: white;
    opacity: 0.6;
  }
</style>

<svg
  width="100%"
  height="100%"
  viewBox="0 0 776 640"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xml:space="preserve"
  xmlns:serif="http://www.serif.com/"
  shape-rendering="geometricPrecision"
  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"
>
  <g transform="matrix(1,0,0,1,-3055.34,-924)">
    <g transform="matrix(-1,-6.14092e-16,-6.14092e-16,1,4551.83,28)">
      <g transform="matrix(1,0,0,1,-221.703,-128)">
        <g in:fly={{ ...flyParams, delay: 6 * inc }}>
          <path
            d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
            style="fill:var(--med);"
          />
          <path
            d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
            style="fill:var(--dark);"
          />
          <path
            d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
            style="fill:var(--light);"
          />
        </g>
      </g>
      <g transform="matrix(1,0,0,1,-110.851,-64)">
        <g in:fly={{ ...flyParams, delay: 5 * inc }}>
          <path
            d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
            style="fill:var(--med);"
          />
          <path
            d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
            style="fill:var(--dark);"
          />
          <path
            d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
            style="fill:var(--light);"
          />
        </g>
      </g>
      <g>
        <g in:fly={{ ...flyParams, delay: 4 * inc }}>
          <path
            d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
            style="fill:var(--med);"
          />
          <path
            d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
            style="fill:var(--dark);"
          />
          <path
            d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
            style="fill:var(--light);"
          />
        </g>
      </g>
    </g>
    <g transform="matrix(-1,-6.14092e-16,-6.14092e-16,1,4219.28,220)">
      <g
        opacity="1"
        transform="matrix(1,-9.86076e-32,9.86076e-32,1,-221.703,-248)"
      >
        <!-- <g in:fly={{ duration: 1200, y: 80, delay: 3 * inc }}> -->
        <g in:fly={{ duration: 1200, y: 10, delay: 3 * inc }}>
          <g style="transform: translateY({$q}px)">
            <g style="transform: translateY(40px)">
              <path
                d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
                style="fill:var(--op-fill);fill-opacity:var(--op);stroke:var(--op-stroke);stroke-width:3px;stroke-dasharray:9,9,0,0;"
              />
              <path
                d="M997.661,1152L997.661,1344L942.236,1312L942.236,1120L997.661,1152Z"
                style="fill:var(--op-fill);fill-opacity:var(--op);stroke:var(--op-stroke);stroke-width:3px;stroke-dasharray:9,9,0,0;"
              />

              <g transform="matrix(-1,-6.14092e-16,-6.14092e-16,1,4440.98,-92)">
                <path
                  d="M3443.32,1244L3277.04,1148L3332.47,1116L3498.74,1212"
                  style="fill:var(--op-fill);fill-opacity:var(--op);stroke:var(--op-stroke);stroke-width:1px;"
                />
              </g>
              <g transform="matrix(-1,-6.14092e-16,-6.14092e-16,1,4440.98,-92)">
                <path
                  d="M3277.04,1148L3287.8,1141.79L3332.47,1116L3498.74,1212"
                  style="fill:none;stroke:var(--op-stroke);stroke-width:3px;stroke-dasharray:9,9,0,0;"
                />
              </g>

              <g
                transform="matrix(-166.79,96.2963,-1.09983e-13,200,1135.49,1229.43)"
              >
                <path
                  d="M0.379,-0.235C0.379,-0.24 0.378,-0.246 0.378,-0.251C0.378,-0.26 0.379,-0.27 0.38,-0.279C0.394,-0.291 0.415,-0.299 0.441,-0.308C0.502,-0.33 0.543,-0.36 0.543,-0.45C0.543,-0.56 0.459,-0.61 0.302,-0.61C0.15,-0.61 0.057,-0.564 0.057,-0.412C0.057,-0.398 0.058,-0.382 0.06,-0.365L0.229,-0.365C0.229,-0.38 0.228,-0.394 0.228,-0.407C0.228,-0.431 0.23,-0.454 0.237,-0.478C0.253,-0.484 0.271,-0.486 0.294,-0.486C0.343,-0.486 0.366,-0.473 0.366,-0.434C0.366,-0.397 0.347,-0.377 0.298,-0.355C0.239,-0.328 0.217,-0.308 0.217,-0.258C0.217,-0.251 0.217,-0.243 0.218,-0.235L0.379,-0.235ZM0.211,-0.165L0.211,0L0.385,0L0.385,-0.165L0.211,-0.165Z"
                  style="fill:var(--q-fill);fill-opacity:1;fill-rule:nonzero;stroke:var(--op-stroke);stroke-width:0.01px;stroke-linecap:butt;stroke-miterlimit:2;stroke-dasharray:0.04,0.01,0,0;"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
      <g transform="matrix(1,0,0,1,-110.851,-64)">
        <g in:fly={{ ...flyParams, delay: 2 * inc }}>
          <path
            d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
            style="fill:var(--med);"
          />
          <path
            d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
            style="fill:var(--dark);"
          />
          <path
            d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
            style="fill:var(--light);"
          />
        </g>
      </g>
      <g>
        <g in:fly={{ ...flyParams, delay: 1 * inc }}>
          <path
            d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z"
            style="fill:var(--med);"
          />
          <path
            d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152"
            style="fill:var(--dark);"
          />
          <path
            d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120"
            style="fill:var(--light);"
          />
        </g>
      </g>
    </g>
  </g>
</svg>
