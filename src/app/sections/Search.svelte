<script>
import { searchQuery, updateSearchQuery, store, updateSearchIsActive } from '../store/store.js';
import SearchIcon from '../../components/icons/Search.svelte';
import MoreVertIcon from '../../components/icons/MoreVert.svelte';

let value = '';

import { onMount } from 'svelte';
import { slide, fly } from 'svelte/transition'

let resultSet=[];

let timeout;

let hovered;

// const handleKeypress = (event) => {
//     const key = event.key;
//     const keyCode = event.keyCode;
//     if ($searchOptions && resultSet.length > 1) {
//         if (key === 'ArrowUp') keyUp();
//         if (key === 'ArrowDown') keyDown();
//     }

// }

// const keyUp = () => {
//     // get id of current hovered
//     const activeResult = resultSet.find(r=>r.searchID === hovered);
//     if (activeResult.searchID > 0) {
//         // do something
//         hovered -= 1;
//     }
// }

// const keyDown = () => {
//     const activeResult = resultSet.find(r=>r.searchID === hovered);
//     if (activeResult.searchID < resultSet.length-1) {
//         hovered += 1;
//     }
// }

let visible = false;

onMount(() => { visible = true });

const turnOnSearch = () =>{
    store.dispatch(updateSearchIsActive(true));
}
const turnOffSearch = () => {
    setTimeout(() => {
        store.dispatch(updateSearchIsActive(false));
    }, 50);
}

</script>

<style>

.search-container {
    height: var(--increment);
    box-shadow: 0px 0px var(--space-1h) rgba(0,0,0,.2);
    display:grid;
    grid-template-columns: [icon] 40px [input] auto [help] 40px;
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    align-items: stretch;
    background-color: white;
}

.icon {
    display:grid;
    align-items: center;
    justify-items: center;
    opacity:.5;
}

input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    font-size: 1em;
    border: none;
    color: var(--gray10);
    background-color: white;
}

input:focus {
    color: var(--gray16);
}

</style>

<div class=search-container>
    <div class=icon><SearchIcon /></div>
    <input on:focus={turnOnSearch} 
        placeholder="search for a telemetry probe"
        on:blur={turnOffSearch}
        bind:value={$searchQuery} on:input={(evt) => {
            updateSearchQuery(evt.target.value);
        }} />
    <!-- <div class=icon><MoreVertIcon /></div> -->
</div>
