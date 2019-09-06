<script>
import SparkBar from '../src/components/data-graphics/SparkBar.svelte';
import Button from '../src/components/Button.svelte';
import { tweened } from 'svelte/motion';
import { cubicOut as easing} from 'svelte/easing';

const t = 500;
let v1 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v1.set(Math.random() * 3 / 4);

let v2 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v2.set(Math.random() * 3 / 4);

let v3 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v3.set(Math.random() * 3 / 4);

let v4 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v4.set(Math.random() * 3 / 4);

let v5 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v5.set(Math.random() * 3 / 4);

let v6 = tweened(0, {duration: t + Math.random() * 300, easing});
$: v6.set(Math.random() * 3 / 4);

function randomize() {
    v1.set(Math.random() * 3 / 4);
    v2.set(Math.random() * 3 / 4);
    v3.set(Math.random() * 3 / 4);
    v4.set(Math.random() * 3 / 4);
    v5.set(Math.random() * 3 / 4);
    v6.set(Math.random() * 3 / 4);
}

</script>

<style>

.sparks { 
    width: var(--drawer-width);
    margin-top: var(--space-2x);
    margin-left: var(--space-4x);
 }

 h1, h2, p {
    margin-left: var(--space-4x);
    color: var(--body-gray);
 }

 .controls {
     margin-left: var(--space-4x);
 }
</style>

<h1>SparkBar</h1>

<p>
    Conforms to the width of whatever container it is in.
</p>

<div class=controls>
    <Button level=medium compact on:click={randomize}>randomize</Button>
</div>

<h2>With Labels (default)</h2>

<div class=sparks >
    <SparkBar value={$v1} />
    <SparkBar value={$v2} />
    <SparkBar value={$v3} />
    <SparkBar value={$v4} />
</div>

<h2>Without Labels</h2>


<div class=sparks >
    <SparkBar labels={false} value={$v5} />
    <SparkBar value={$v6} />
</div>