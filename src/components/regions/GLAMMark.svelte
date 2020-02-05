<script>
import { tooltip } from 'udgl/utils/tooltip';
import Logo from 'udgl/icons/GLAM.svelte';
import { store } from '../../state/store';
</script>

<style>
h1 {
    cursor: pointer;
}
</style>

<h1 on:click={store.reset}><Logo /> <div use:tooltip={'The Glean Aggregated Metrics Dashboard', { distance: 16 }}>GLAM</div></h1>
