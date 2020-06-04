<script>
const sizes = [
  '1q', '1h', 'base', '2x', '4x', '6x', '8x', '12x', '16x', '24x', '32x', '40x', '48x', '72x', '96x',
];

const getPxValue = (s) => {
  const computed = getComputedStyle(document.documentElement).getPropertyValue(`--space-${s}`);
  return computed.match(/\d{1,2}/g).map((v) => +v).reduce((a, b) => a * b, 1);
};
</script>

<style>
section {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  grid-column-gap: var(--space-4x);
  grid-row-gap: var(--space-base);
  color: var(--body-gray-01);
}

.value {
  text-align: right;
}

.h {
  font-weight: 900;
  color: var(--subhead-gray-01);
}
</style>

<div class=story>
  <h1 class='story__title'>Sizes</h1>
  <div class='story__subtitle'>for surfaces, elements, padding, margins, etc.</div>
  <section>
    <div class='h overline-text--01'>CSS Variable</div>
    <div class='h value overline-text--01'>Size</div>
    <div></div>
    {#each sizes as size, i (size)}
      <div class="helper-text--01">--space-{size}</div>
      <div class="value helper-text--01">{getPxValue(size)}px</div>
      <svg width=1000 height='var(--space-2x)'>
        <rect ry="var(--space-1q)" rx="var(--space-1q)" fill='var(--digital-blue-500)' x=0 y=0 height="var(--space-2x)" width="var(--space-{size})"></rect>
      </svg>
    {/each}
  </section>
</div>
