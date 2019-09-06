<script>

import Button from '../src/components/Button.svelte';

</script>
<style>

:global(body) {
    background-color: var(--background-gray);
}

h2 {
    padding-left: var(--space-2x);
    font-size: 1.25rem;
    font-weight: 100;
}

.button-set {
    margin: var(--space-4x);
    display: grid;
    grid-template-columns: max-content max-content;
    align-content: center;
    outline: 1px solid var(--gray03);
    width: max-content;
    background-color: white;
}

.default {
    padding: var(--space-2x);
}

.set {
    margin: var(--space-2x);
}

/* DARK MODE BUTTONS */

.dark {
    background-color: var(--gray16);
}

.dark h2 {
    color: white;
}

.fake-app {
    margin: var(--space-4x);
    width: calc(var(--increment) * 8);
    border: 1px solid var(--gray03);
    border-radius: var(--border-radius-base);
    background-color: white;
}

.fake-bar {
    height: var(--increment);
    background-color: var(--base-primary);
    color: white;
    display: grid;
    font-size: 1.25rem;
    align-items: center;
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    grid-template-columns: auto max-content max-content;
    grid-column-gap: var(--space-base);
}

.fake-body {
    padding: var(--space-base);
    min-height: calc(var(--increment) * 4);
}

</style>

<div class=button-set>
    <div class=default>
        <h2>Prime</h2>
        <div class=set>
            <Button level="high">High Button</Button>
        </div>
        <div class=set>
            <Button level="medium">Medium Button</Button>
        </div>
        <div class=set>
            <Button level="low">Low Button</Button>
        </div>
    </div>

    <div class="default dark">
        <h2>Prime Dark</h2>
        <div class=set>
            <Button level="high" dark>High Button</Button>
        </div>
        <div class=set>
            <Button level="medium" dark>Medium Button</Button>
        </div>
        <div class=set>
            <Button level='low' dark>Low Button</Button>
        </div>
    </div>

    <!-- compact variant -->
    <div class=default>
        <h2>Prime Compact</h2>
        <div class=set>
            <Button level='high' compact>High Button</Button>
        </div>
        <div class=set>
            <Button level='medium' compact>Medium Button</Button>
        </div>
        <div class=set>
            <Button level='low' compact>Low Button</Button>
        </div>
    </div>

    <div class="default dark">
        <h2>Prime Compact Dark</h2>
        <div class=set>
            <Button compact dark>High Button</Button>
        </div>
        <div class=set>
            <Button level='medium' compact dark>Medium Button</Button>
        </div>
        <div class=set>
            <Button level='low' compact dark>Low Button</Button>
        </div>
    </div>
</div>

<div class=fake-app>
    <div class="fake-bar dark">
        <div>My App</div>
        <Button level='low' compact dark>Maybe</Button>
        <Button level='high' compact dark>Go</Button>
    </div>
    <div class=fake-toolthing></div>
    <div class=fake-body>
        <Button level="high">Activate</Button>
    </div>
</div>