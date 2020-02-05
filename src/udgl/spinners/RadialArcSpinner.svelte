<script>
    import { spring } from 'svelte/motion';
    import { arc } from 'd3-shape';
    
    export let size = 200;
    
    function makeArc(outerRadius, innerRadius) {
      return (endAngle) => arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius)
        .startAngle(0)
        .endAngle(endAngle)();
    }
    
    const tiny = size / 8;
    const small = tiny * 2;
    const med = tiny * 3;
    const large = tiny * 4;
    const buffer = 4;
    
    const tinyTickArc = makeArc(tiny, tiny - size / 8 + buffer);
    const smallTickArc = makeArc(small, (small - size / 8) + buffer);
    const mediumTickArc = makeArc(med, (med - size / 8) + buffer);
    const largeTickArc = makeArc(large, (large - size / 8) + buffer);
    let starter = Math.PI / 6;
    const tinyTicker = spring(0, { damping: 0.9, stiffness: 0.3 });
    const smallTicker = spring(0, { damping: 0.9, stiffness: 0.2 });
    const mediumTicker = spring(0, { damping: 0.9, stiffness: 0.2 });
    const largeTicker = spring(0, { damping: 0.9, stiffness: 0.1 });

    $: tinyTicker.set(starter);
    $: smallTicker.set(starter);
    $: mediumTicker.set(starter);
    $: largeTicker.set(starter);

    const T = 125;
    
    setInterval(() => {
      tinyTicker.set(($tinyTicker + Math.PI / 16) % (Math.PI * 2));
    }, T);
    
    setInterval(() => {
      smallTicker.set(($smallTicker + Math.PI / 16) % (Math.PI * 2));
    }, T * 2);
    
    setInterval(() => {
      mediumTicker.set(($mediumTicker + Math.PI / 16) % (Math.PI * 2));
    }, T * 4);
    
    setInterval(() => {
      largeTicker.set(($largeTicker + Math.PI / 16) % (Math.PI * 2));
    }, T * 8);
    
    </script>
    
    <svg width={size} height={size}>
      <g transform='translate({size / 2} {size / 2})'>
        <path d={tinyTickArc($tinyTicker)} fill=var(--cool-gray-300) />
        <path d={smallTickArc($smallTicker)} fill=var(--cool-gray-400) />
        <path d={mediumTickArc($mediumTicker)} fill=var(--cool-gray-500) opacity=.6 />
        <path d={largeTickArc($largeTicker)} fill=var(--cool-gray-600) opacity=.6 />
      </g>
    </svg>