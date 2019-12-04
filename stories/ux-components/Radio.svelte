<script>
import RadioGroup from '../../src/components/RadioGroup.svelte';
import RadioSelector from '../../src/components/RadioSelector.svelte';

const basicRadioSelectorGroups = ['first option', 'second option'];
let currentBasic = basicRadioSelectorGroups[0];

const groupRadioSelectorOpts = ['one', 'two', 'three', 'four'];

let groupedBasic = groupRadioSelectorOpts[0];

</script>


<style>

.set {
    background-color: var(--cool-gray-800);
    padding: var(--space-4x);
    width: calc(var(--increment) * 5);
    border-radius: var(--space-base);
}

.collection {
    display:grid;
    grid-template-columns: max-content max-content;
    grid-column-gap: var(--space-4x);
}

h2 {
    color: white;
}

</style>

<div class=story>
    <h1 class=story__title>Radio Buttons</h1>
    <div class=collection>
        <div class=set>
            <h2>RadioSelector w/o RadioGroup ({currentBasic})</h2>
            {#each basicRadioSelectorGroups as value}
                <RadioSelector value={value} label={value} group={currentBasic}
                onSelect={() => { currentBasic = value; }} />
            {/each}
        </div>

        <div class=set>
            <h2>RadioSelector w/ RadioGroup ({groupedBasic})</h2>
            <RadioGroup onSelect={(value) => { groupedBasic = value; }}>
                <span slot='label'>
                    Options here
                </span>
                {#each groupRadioSelectorOpts as value}
                    <RadioSelector value={value} label={value} group={groupedBasic} />
                {/each}
            </RadioGroup>
        </div>
    </div>
</div>