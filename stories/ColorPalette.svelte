<script>

const families = [
  { color: 'blueslate', role: 'primary', d: 'toolbar / sidebar' },
  { color: 'raspberry', role: 'secondary', d: 'accents' },
  { color: 'lightcrimson', role: 'sparing accent', d: 'sparing accents' },
  { color: 'digital-blue', role: 'button/link', d: 'accessible buttons / links' },
  { color: 'pantone-red', role: 'error', d: 'dialogs, button states' },
  { color: 'mantis-green', role: 'success', d: 'success buttons, etc.' },
  // {color: 'goldenrod', role: "left-field"},
];

const tintsAndShades = (color) => [`${color}-light-40`, `${color}-light-30`, `${color}-light-20`,
  `${color}-light-10`, color, `${color}-dark-10`, `${color}-dark-20`,
  `${color}-dark-30`, `${color}-dark-40`];

</script>

<style>

.description {
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-style: italic;
    font-weight: normal;
    width: calc(var(--increment) * 3);
    height: var(--increment);
    font-size: .875rem;
    color: var(--gray10);
}

.color.role {
    font-weight: 900;
    text-transform:uppercase;
    color: var(--gray16);
}

.swatches {
    display:flex;
    flex-wrap: row-wrap;
    font-size:.85rem;
}

.color {
    height: var(--increment);
    width: calc(var(--increment) * 3);
    display: grid;
    align-content: center;
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-weight: 100;
}

.dark {
    color: white;
}

.main {
    font-weight: 900;
    height: calc(var(--increment) * 1.5);
}

</style>

<div class=story>
    <h1 class=story__title>Color Palette for Telemetry</h1>
    <div class=swatches>
        {#each families as {color, role, d}, i}
            <div>
                <div class="color role">{role}</div>
                <div class='description'>{d}</div>
                {#each tintsAndShades(color) as c, j}
                    <div style="background-color: var(--{c});" class="color
                    {c.includes('light') ? '' : 'dark'}">{c}</div>
                {/each}
            </div>
        {/each}
        <div>
            <div class='color role'>UX Grays</div>
            <div class='description'>bodies, lines, texts</div>
            <div style="background-color: var(--bg-gray);" class="color">bg-gray</div>
            <div style="color: var(--line-gray-01); outline: 1px solid var(--line-gray-01);"
            class="color">line-gray-01 –––––––––––</div>
            <div style="color: var(--line-gray-02); outline: 1px solid var(--line-gray-02);"
            class="color">line-gray-02 –––––––––––</div>
            <div style="background-color: var(--subhead-gray);"
            class="color dark">subhead-gray</div>
            <div style="background-color: var(--body-gray);" class="color dark">body-gray</div>
        </div>
    </div>
</div>