<script>
import { tooltip } from '../../components/utils/tooltip';
import Header from '../../components/sections/Header.svelte';
import Logo from '../../components/icons/GLAM.svelte';
</script>

<Header>
    <h1><Logo /> <div use:tooltip={'The Glean Aggregated Metrics Dashboard', { distance: 16 }}>GLAM</div></h1>
</Header>