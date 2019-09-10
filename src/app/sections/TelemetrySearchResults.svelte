<script>
import { format } from 'd3-format';
import { fly } from 'svelte/transition';
import { getContext } from 'svelte'
import { searchResults, store } from '../store/store.js'

export let updateProbe = getContext('updateProbe');
export let updateSearchQuery = getContext('updateSearchQuery');

let formatTotal = format(',.4d');

</script>

<style>

/* FIXME: move toward BEM */
.telemetry-results {
    --header-bg-color: var(--gray01);
    --list-border-color: gainsboro;
    --list-border: 1px solid var(--list-border-color);
    max-height: calc(100vh - var(--header-height) * 3);
    border:1px solid gainsboro;
    background-color: white;
    width: calc(100vw - var(--drawer-width) * 2 - var(--space-base) - 40px * 2);
    box-shadow: 0px 0px 30px rgba(0,0,0,.2);
    border-bottom-right-radius: var(--border-radius-base);
    position: absolute;
    /* 40px is icon width */
    transform: translateX(calc(var(--space-base) + 40px));
    overflow: hidden;
}

.header {
    background: linear-gradient(to left, var(--header-bg-color), var(--gray02));
    /* background-color: var(--header-bg-color); */
    padding:var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    font-size:.8em;
    color: var(--gray16);
    font-style: italic;
    height: 20px;
    display: grid;
    align-items:center;
}

ul {
    max-height: calc(100vh - var(--header-height) * 3 - 40px);
    padding:0;
    margin:0;
    list-style-type: none;
    overflow-y: scroll;
}

li:first-child {
    border-top: var(--list-border);
}

li {
    padding:var(--space-2x);
    border-bottom: var(--list-border);
    display:grid;
    grid-template-columns: auto 100px;
    grid-column-gap: var(--space-2x);
    grid-template-rows: max-content max-content;
    grid-template-areas: "title probe-type"
                         "description versions";
    cursor: pointer;
    color: var(--body-gray);
}

li:hover {
    background-color: var(--bg-gray);
}

.name {
    grid-area: title;
    font-weight:900;
    word-break: break-all;
}

.probe-type, .first-release {
    justify-self: end;
    padding: var(--border-radius-1h);
}

.first-release {
    font-size:.8em;
    text-align: right;
    align-self: end;
}

.probe-type {
    grid-area: probe-type;
}

.description {
    grid-area: description;
    font-size:.8em;
    line-height:1.4;
}

</style>

{#if $store.searchIsActive}
<div transition:fly={{duration:100, y:-10}} class=telemetry-results>
    <div class=header>
        {#if $searchResults.total}
            matching {$searchResults.results.length} of
            {formatTotal($searchResults.total)} probes
        {:else}
            getting the probes – one second!
        {/if}
        
    </div>
    {#if $searchResults.results.length}
        <ul>
        {#each $searchResults.results as {id, name, type, description, versions}, i (id)}
            <li on:click={(evt) => {
                updateProbe({id, name, type, description, versions});
            }}>
                <div class=name>{name}</div>
                <div class="probe-type label label-text--01 label--{type}">{type}</div>
                <div class=description>{@html description}</div>
                <div class=first-release>
                    <div>first version</div>
                    <div>{versions.nightly[0] || versions.beta[0]}</div>
                </div>
            </li>
        {/each}
        </ul>
    {/if}
</div>
{/if}
