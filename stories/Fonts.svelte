<style>
@import url('/fonts/fira-code/fira-font-face.css');
@import url('/fonts/metropolis/metropolis-font-face.css');
@import url('/fonts/inter/inter-font-face.css');

.fira-code {
  font-family: 'Fira Code';

}

.sql-query {
  font-family: 'Fira Code';
  font-size: var(--text-02);
  background-color: var(--digital-blue-100);
  color: var(--digital-blue-900);
  padding: var(--space-4x);
  border-radius: var(--space-1h);
  white-space: pre-line;
  width: var(--space-72x);
}

.font-title {
  font-size: 5em;
  margin-bottom: 0;
}

.metropolis {
  font-family: 'Metropolis';
}

.metropolis01 {
  font-size: var(--text-09);
  font-weight: bold;
  color: white;
  background-color: var(--blue-slate-600);
  padding: var(--space-2x);
  padding-left: calc(var(--space-2x) + 16.5px);
  width: max-content;
  border-radius: var(--space-1h);
  box-shadow: 0px var(--space-1h) var(--space-base) rgba(100,100,100,.5);
  /* text-transform: uppercase; */
}

.metropolis01 span {
  font-size: var(--text-03);
  display: inline-block;
  transform: translateY(.3em) translateX(-.1em);
  color: var(--pantone-red-400);
  font-weight: 400;
  letter-spacing: -.04em;
}

.inter {
  font-family: 'Inter var';
}


.inter01 {
  border: 1px solid var(--cool-gray-200);
  padding: var(--space-4x);
  width: var(--space-96x);
  font-size: var(--text-03);
  line-height: 1.5;
  border-radius: var(--space-base);
  box-shadow: 0px var(--space-1h) var(--space-base) rgba(100,100,100,.2);
}

@keyframes pulse {
  0% {
    font-variation-settings: 'wght' 300;
  } 50% {
    font-variation-settings: 'wght' 900;
  } 100% {
    font-variation-settings: 'wght' 300;
  }
}

.variable {
  animation: pulse 1s infinite;
}
</style>

<div class=story>
  <h1 class=story__title>Fonts</h1>
  <div class=story__section>
    <h2 class="font-title metropolis" style='color: var(--blue-slate-600);'>Metropolis</h2>
    <div class=story__description>
      Used primary for title elements in data products.
    </div>
    <div class=metropolis01>
      Telemetry<span>V2</span>
    </div>
  </div>

  <div class=story__section>
    <h2 class='font-title inter' style='font-weight: 400; color: var(--pantone-red-500);'>Inter</h2>
    <div class=story__description>
      Used for almost all other text in the data tool.
    </div>
    <div class="inter inter01">
      Telemetry probes, histograms, time series, download links.
      <br />
      <span style='text-transform: uppercase;'>Overline Elements</span>,
      <i>Italic text.</i> Occasionally <b>Bold Text</b> as well.
      <br/>
      You can also use variable font settings here,
      but don't use it <span class=variable>the way I have here</span>!
    </div>
  </div>

  <div class=story__section>
    <h2 class='font-title fira-code' style='font-size: 4em; font-weight: 400;
    color: var(--mantis-green-700);'>Fira Code <b>{'<~'}</b></h2>
    <div class=story__description>
      Used primarily for code blocks, SQL queries, and other bits of 
      engineering flavor, where necessary. This should never be the
      first font you reach for in a data product.
    </div>
    <div class="sql-query">SELECT aggregate, version, whatever
    FROM <b>telemetry</b>.aggregates
    WHERE channel='NIGHTLY' AND
    PRODUCT='fenix'
    LIMIT 100;
    </div>
  </div>
</div>