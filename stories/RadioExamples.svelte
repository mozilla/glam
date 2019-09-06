<script>
import RadioGroup from '../src/components/RadioGroup.svelte';
import RadioSelector from '../src/components/RadioSelector.svelte';
const basicRadioSelectorGroups = ['first option', 'second option'];
let currentBasic = basicRadioSelectorGroups[0];

const groupRadioSelectorOpts = ['one', 'two', 'three', 'four'];

let groupedBasic = groupRadioSelectorOpts[0]

</script>


<style>

:global(body) {
    background-color: white;
}

.story {
    padding: var(--space-base);
    width: calc(var(--increment) * 5);
    background-color: var(--gray16);
}

h2 {
    color: white;
}
</style>

<div class=story>
    <h2>RadioSelector w/o RadioGroup ({currentBasic})</h2>
    {#each basicRadioSelectorGroups as value}
        <RadioSelector value={value} label={value} group={currentBasic}
        onSelect={() => { currentBasic = value }} />
    {/each}
</div>

<div class=story>
    <h2>RadioSelector w/ RadioGroup ({groupedBasic})</h2>
    <RadioGroup onSelect={(value) => { groupedBasic = value }}>
        <span slot='label'>
            Options here
        </span>
        {#each groupRadioSelectorOpts as value}
            <RadioSelector value={value} label={value} group={groupedBasic} />
        {/each}
    </RadioGroup>
</div>
