<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  export let size = 32;
  let mounted = false;
  onMount(() => {
    mounted = true;
  });
  let y = 50;
  let duration = 400;
  let delay = 200;
</script>

<style>
  svg {
    --dark: var(--digital-blue-300);
    --medium: var(--digital-blue-600);
    --light: var(--digital-blue-400);
    /* --dark: var(--digital-blue-500);
    --medium:var(--digital-blue-600);
    --light:var(--digital-blue-300); */
    /* --dark: rgb(37, 92, 37);
    --medium:rgb(37, 129, 37);
    --light:forestgreen; */
  }
</style>

<!-- <svg width={size} height={size} viewBox="0 0 393 344" version="1.1"
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
xml:space="preserve" xmlns:serif="http://www.serif.com/"
style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(1,0,0,1,-647.081,-407.668)">
        <g id="EL00" transform="matrix(1,0,0,1,203.476,363.886)">
            <g transform="matrix(-1.00192,-0.578457,0.578457,-1.00192,1281.86,897.986)">
                <path d="M832.532,113.029C898.846,113.029 952.684,166.867 952.684,233.18C952.684,299.464 898.894,353.284 832.532,353.332C873.159,353.246 906.048,299.441 906.048,233.18C906.048,166.867 873.107,113.03 832.532,113.029Z" style="fill:var(--light);"/>
            </g>
            <g transform="matrix(-0.613032,-0.353934,0.578457,-1.00192,896.097,727.848)">
                <path d="M770.171,392.399C703.772,392.314 650.019,338.508 650.019,272.247C650.019,205.934 703.857,152.096 770.171,152.096C836.484,152.096 890.322,205.934 890.322,272.247C890.322,338.508 836.569,392.314 770.171,392.399L770.171,392.399Z" style="fill:var(--dark);"/>
            </g>
            <g transform="matrix(-0.293665,-0.169548,0.277103,-0.479956,745.877,450.748)">
                <path d="M770.171,392.399C703.772,392.314 650.019,338.508
                650.019,272.247C650.019,205.934 703.857,152.096
                770.171,152.096C836.484,152.096 890.322,205.934
                890.322,272.247C890.322,338.508 836.569,392.314
                770.171,392.399L770.171,392.399Z" style="fill:transparent"/>
            </g>
            <g transform="matrix(0.578457,-1.00192,1.00192,0.578457,-81.6591,689.049)">
                <path d="M546.446,397.238C546.321,395.866 546.257,394.483 546.257,393.092C546.257,352.518 600.096,319.576 666.409,319.576C732.722,319.576 786.56,352.518 786.56,393.092C786.56,394.03 786.532,394.965 786.474,395.894C786.582,394.635 786.637,393.368 786.64,392.092C786.592,458.454 732.772,512.244 666.489,512.244C601.899,512.244 549.145,461.169 546.446,397.238Z" style="fill:var(--light);"/>
            </g>
        </g>
    </g>
</svg> -->

<!-- <svg width={size} height="100%" viewBox="0 0 384 333" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(1,0,0,1,-805.661,-985.636)">
        <g transform="matrix(-0.866479,-0.499213,-0.499213,0.866479,2437.21,651.861)">
            <g transform="matrix(1,0,0,1,-110.851,-64)">
                <path d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z" style="fill:var(--medium);"/>
                <path d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152" style="fill:var(--dark);"/>
                <path d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120" style="fill:var(--light);"/>
            </g>
            <g>
                <path d="M997.661,1344L1163.94,1248L1163.94,1056L997.661,1152L997.661,1344Z" style="fill:var(--medium);"/>
                <path d="M997.661,1344L942.236,1312L942.236,1120L997.661,1152" style="fill:var(--dark);"/>
                <path d="M1108.51,1024L1163.94,1056L997.661,1152L942.236,1120" style="fill:var(--light);"/>
            </g>
        </g>
    </g>
</svg> -->
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
    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
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

  <!-- <svg width="100%" height={size} viewBox="0 0 432 405" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(1,0,0,1,-109.547,-913.394)">
        <g transform="matrix(-0.69233,-1.19915,1.19915,-0.69233,128.734,1993.43)">
            <path d="M498.831,496L436.477,596L346.41,528L401.836,440L498.831,496Z" style="fill:var(--dark);"/>
            <path d="M637.395,384L581.969,352L498.831,400L554.256,432" style="fill:var(--medium);"/>
            <path d="M595.825,328L498.831,272L443.405,368L540.4,424" style="fill:var(--dark);"/>
            <path d="M512.687,600L471.118,576L512.687,504L512.687,600Z" style="fill:var(--medium);"/>
            <path d="M512.687,344L415.692,288L443.405,272L540.4,328" style="fill:var(--medium);"/>
            <path d="M512.687,344L512.687,440L415.692,384L415.692,288" style="fill:var(--dark);"/>
            <path d="M498.831,464L415.692,512L318.697,456L401.836,408L498.831,464Z" style="fill:var(--dark);"/>
            <path d="M436.477,436L346.41,376L360.267,352L457.261,400" style="fill:var(--medium);"/>
            <path d="M415.692,544L318.697,488L318.697,456L415.692,512" style="fill:var(--medium);"/>
            <g transform="matrix(1.73205,-1,9.61481e-17,2,83.1384,-1456)">
                <path d="M264,1024L248,1024L248,1064.94C248,1066.3 247.123,1067.1 245.729,1067.02C244.335,1066.94 242.66,1065.99 241.39,1064.56C232.02,1054.02 216,1036 216,1036L204,1048C204,1048 222.023,1064.02 232.564,1073.39C233.992,1074.66 234.941,1076.34 235.02,1077.73C235.1,1079.12 234.297,1080 232.941,1080C219.598,1080 192,1080 192,1080L192,1096L232.773,1096C233.602,1096 234.65,1096.65 235.315,1097.58C235.98,1098.51 236.091,1099.48 235.585,1099.92C225.971,1108.47 204,1128 204,1128L220,1140C220,1140 236.318,1119.02 244.039,1109.09C244.463,1108.55 245.435,1108.63 246.382,1109.29C247.329,1109.95 248,1111.02 248,1111.86C248,1125.47 248,1152 248,1152L264,1152L264,1111.06C264,1109.7 264.877,1108.9 266.271,1108.98C267.665,1109.06 269.34,1110.01 270.61,1111.44C279.98,1121.98 296,1140 296,1140L308,1128C308,1128 289.977,1111.98 279.436,1102.61C278.008,1101.34 277.059,1099.66 276.98,1098.27C276.9,1096.88 277.703,1096 279.059,1096C292.402,1096 320,1096 320,1096L320,1080L279.86,1080C279.019,1080 277.954,1079.33 277.292,1078.38C276.63,1077.43 276.547,1076.46 277.092,1076.04C287.02,1068.32 308,1052 308,1052L292,1036C292,1036 275.682,1056.98 267.961,1066.91C267.537,1067.45 266.565,1067.37 265.618,1066.71C264.671,1066.05 264,1064.98 264,1064.14C264,1050.53 264,1024 264,1024" style="fill:var(--light);"/>
            </g>
        </g>
    </g>
</svg> -->
{/if}
