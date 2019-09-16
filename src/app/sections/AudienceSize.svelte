<script>
import { format } from 'd3-format';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';

import SparkBar from '../../components/data-graphics/SparkBar.svelte';

export let percentage;
export let total;
export let population;

let formatTotal = format(',.4d');
let formatPercentage = format('.0%');

const tweenParams = { duration: 600, easing };

const displayPercentage = tweened(0, tweenParams);
const displayTotal = tweened(0, tweenParams);
const displayPopulation = tweened(0, tweenParams);
$: displayPercentage.set(percentage || 0);
$: displayTotal.set(total || 0);
$: displayPopulation.set(population || 0);

</script>

<style>

.audience-size__numbers {
    display: grid;
    grid-template-columns: auto auto;
    margin-bottom: var(--space-base);
    color: var(--body-gray);
}

.audience-size__total {
    justify-self: end;
    text-align:right;
    font-weight: 300;
}

.audience-size__total span {
    font-weight: 300;
}

</style>

<div>
    <div class='audience-size__numbers label-text--01'>
        <div class='audience-percentage'>{formatPercentage($displayPercentage)}</div>
        <div class='audience-size__total'>
            <span>{formatTotal($displayTotal)}</span> of {formatTotal($displayPopulation)}</div>
        </div>
        <SparkBar value={$displayPercentage} />
</div>
