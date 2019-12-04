<script>
import LineSegSpinner from '../../src/components/LineSegSpinner.svelte';
</script>

<style>

.set {
    margin-bottom: var(--space-4x);
    border-radius: var(--space-base);
    max-width: calc(var(--increment) * 6);
    padding: var(--space-base);
    display: grid;
    grid-template-columns: calc(var(--increment) * 4) auto;
    align-items: center;
    justify-items: center;
    border: 1px solid var(--line-gray-01);
    background-color: white;
    box-shadow: 0px 0px var(--space-base) rgba(0,0,0,.1);
    color: var(--subhead-gray-01);
    font-weight:300;
}

.text {
    width: 100%;
    justify-self: start;
    padding-left: var(--space-2x);
}

.dark {
    background-color: var(--blue-slate-500);
    color: white;
    border: 1px solid transparent;
}

</style>

<div class=story>
    <h1 class=story__title>Line Segment Spinners</h1>
    <div class="set dark">
        <div class="text">
            <div class=overline-text--01>
                default
            </div>
            <div class=body-text--short-01>
                size=24, color=white
            </div>
        </div>
        <LineSegSpinner />
    </div>

    <div class="set dark">
        <div class="text body-text--short-01">
            size=64
        </div>
        <LineSegSpinner size=64 />
    </div>

    <div class="set">
        <div class="text body-text--short-01">
            color=digital blue
        </div>
        <LineSegSpinner size=64 color='var(--digital-blue-500)' />
    </div>
</div>