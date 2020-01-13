<script>
import { tooltip } from '../../components/utils/tooltip';
import Header from '../../components/sections/Header.svelte';
import Logo from '../../components/icons/GLAM.svelte';
import { store } from '../state/store';
</script>

<style>
h1 {
    cursor: pointer;
}
</style>

<Header>
    <h1 on:click={store.reset}><Logo /> <div use:tooltip={'The Glean Aggregated Metrics Dashboard', { distance: 16 }}>GLAM</div></h1>
</Header>