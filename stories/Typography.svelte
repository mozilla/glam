<script>

let sizes = ['xxl', 'xl','lg', 'md', 'standard', 'sm', 'xs'];

let componentText = `component`
let bodyShort = `This is for very short paragraphs component text. Only one or two lines, preferably.`
let bodyLong = `
This should be used for longer types of text that exceed a few lines.
Different line spacing is required in these situations. One does not
need to be too rigid to this end.

`
let bodies = [
    {cl:'body-text--short-01', body: bodyShort},
    {cl:'body-text--short-02', body: bodyShort},
    {cl:'body-text--long-01', body: bodyLong},
    {cl:'body-text--long-02', body: bodyLong},
    {cl:'label-text--01 component', body: componentText},
    {cl:'overline-text--01', body: componentText},
    ]
let headings = ['02', '03', '04', '05', '06', '07']

</script>

<style>

.component {
    padding: var(--space-base);
    border-radius: var(--space-1q);
    background-color: var(--digital-blue);
    color: white;
    width: max-content;
}

:global(:root) {
    --text-base-size: 1em;
}


:global(body) {
    font-size: var(--text-base-size);
}

.display {
    display: grid;
    grid-template-columns: 250px max-content;
    grid-column-gap: var(--space-4x);
    align-items: center;
    margin-bottom: var(--space-2x);
}

.display div:first-child {
    justify-self: end;
    font-family: 'Courier New', Courier, monospace;
}

.display p {
    width: 400px;
}

</style>

<div style='margin: var(--space-4x);'>
    <h1 class='heading--06'>Typography</h1>
    <section>
        {#each ['button-text--standard', 'button-text--compact'] as cl}
            <div class=display>
                <div>.{cl}</div>
                <div class="{cl}">button</div>
            </div>
        {/each}
        {#each bodies as {cl, body}}
            <div class=display>
                <div>.{cl}</div>
                <p class='{cl}'>{body}</p>
            </div>
        {/each}
        {#each headings as h}
            <div class=display>
                <div>.heading--{h}</div>
                <h1 class="heading heading--{h}">Telemetry Dashboard</h1>
            </div>
        {/each}
    </section>
</div>