<style>
  @import url('/static/fonts/fira-code/fira-font-face.css');
  @import url('/static/fonts/metropolis/metropolis-font-face.css');
  @import url('/static/fonts/inter/inter-font-face.css');

  .font-section {
    margin-left: calc(var(--space-6x) * -1);
    margin-right: calc(var(--space-6x) * -1);
  }

  .fira-section {
    background: linear-gradient(
        to bottom left,
        var(--blue-slate-900),
        transparent
      ),
      linear-gradient(
        to bottom right,
        var(--digital-blue-900),
        var(--blue-slate-500)
      );
    color: var(--blue-slate-100);
  }

  .fira-code {
    font-family: 'Fira Code';
  }

  .fira-code b {
    color: var(--pantone-red-300);
    font-weight: 200;
    font-size: var(--text-05);
  }

  .sql-query {
    font-family: 'Fira Code';
    font-size: var(--text-02);
    background: linear-gradient(
      to right,
      var(--digital-blue-100),
      var(--blue-slate-100)
    );
    color: var(--digital-blue-900);
    padding: var(--space-4x);
    border-radius: var(--space-1h);
    white-space: pre-line;
    width: var(--space-72x);
  }

  .sql-query b,
  .sql-query i {
    color: var(--cool-gray-900);
  }

  .font-title {
    font-size: 5em;
    margin-bottom: 0;
  }

  .metropolis {
    font-family: 'Metropolis';
  }

  .met-ex {
    margin-top: var(--space-8x);
    margin-bottom: var(--space-12x);
  }

  .metropolis-section {
    background: linear-gradient(to bottom, white, var(--cool-gray-100));
  }

  .metropolis01 {
    font-family: 'Metropolis';
    font-size: var(--text-09);
    font-weight: bold;
    color: white;
    background-color: var(--blue-slate-600);
    padding: var(--space-2x);
    padding-left: calc(var(--space-2x) + 16.5px);
    width: max-content;
    border-radius: var(--space-1h);
    box-shadow: 8px 8px 0px var(--blue-slate-500),
      16px 16px 0px var(--blue-slate-400), 24px 24px 0px var(--blue-slate-300),
      32px 32px 0px var(--blue-slate-200), 40px 40px 0px var(--blue-slate-100);
  }

  .metropolis01 span {
    font-size: var(--text-03);
    display: inline-block;
    transform: translateY(0.3em) translateX(-0.1em);
    color: var(--pantone-red-400);
    font-weight: 400;
    letter-spacing: -0.04em;
  }

  .metropolis02 {
    font-family: 'Metropolis';
    font-size: var(--text-08);
    font-weight: 400;
    color: white;
    background-color: var(--pantone-red-700);
    padding: var(--space-2x);
    padding-left: var(--space-4x);
    /* padding-right: calc(var(--space-4x) - 11px); */
    padding-right: var(--space-4x);
    width: max-content;
    border-radius: var(--space-base);
    box-shadow: 8px 8px 0px var(--pantone-red-600),
      16px 16px 0px var(--pantone-red-500), 24px 24px 0px var(--pantone-red-400),
      32px 32px 0px var(--pantone-red-300), 40px 40px 0px var(--pantone-red-200);
  }

  .metropolis02 b {
    font-weight: black;
    font-size: 0.7em;
  }

  .inter {
    font-family: 'Inter var';
  }

  .inter-section {
    color: var(--pantone-red-800);
    background: radial-gradient(
        circle at bottom right,
        var(--pantone-red-300) -100%,
        transparent 70%
      ),
      linear-gradient(
        to right,
        var(--pantone-red-100) 50%,
        var(--pantone-red-300) 200%
      );
  }

  .inter01 {
    width: max-content;
    font-size: var(--text-03);
    line-height: 1.5;
    border-radius: var(--space-base);
    box-shadow: 0px var(--space-1h) var(--space-base) rgba(100, 100, 100, 0.2);
    color: var(--body-gray-01);
    padding: var(--space-4x);
    font-size: var(--text-02);
    background-color: hsla(0, 0%, 100%, 0.95);
  }

  .inter01 h3 {
    margin: 0;
    color: var(--subhead-gray-01);
    margin-bottom: var(--space-2x);
  }

  @keyframes pulse {
    0% {
      font-variation-settings: 'wght' 300;
    }
    50% {
      font-variation-settings: 'wght' 900;
    }
    100% {
      font-variation-settings: 'wght' 300;
    }
  }

  .variable {
    animation: pulse 1s infinite;
  }
</style>

<div class="story">
  <h1 class="story__title">Fonts</h1>
  <div class="story__description">
    We'll use three different fonts – Metropolis, Inter, and Fira Code. All
    three are open-source fonts associated with Mozilla and / or Firefox.
  </div>
  <div class="font-section story__section metropolis-section">
    <h2 class="font-title metropolis" style="color: var(--blue-slate-600);">
      Metropolis
    </h2>
    <div class="story__description">
      Metropolis is a geometric typeface used for page & app title elements,
      primarily – think of it as the "brand font". As such, try to only use it
      for logos and dashboard titles.
    </div>
    <div class="met-ex metropolis01">Telemetry<span>V2</span></div>

    <div class="met-ex metropolis02">
      Growth
      <b>&</b>
      Usage
      <!-- <span>α</span> -->
    </div>
  </div>

  <div class="font-section story__section inter-section">
    <h2
      class="font-title inter"
      style="font-weight: 900; color: var(--pantone-red-500);"
    >
      Inter
    </h2>
    <div class="story__description">
      Inter is the primary font for all other UX and copy. Use it for almost all
      other text in the app that isn't the main title element or something that
      should be expressed in a monospace font (such as a SQL query or code
      snippet).
    </div>
    <div class="inter inter01">
      <h3>HOW TO USE IT</h3>
      Telemetry probes, histograms, time series, download links.
      <br />
      <span style="text-transform: uppercase;">Overline Elements</span>,
      <i>Italic text.</i>
      Occasionally
      <b>Bold Text</b>
      as well.
      <br />
      You can also use variable font settings here,
      <br />but maybe don't
      <span class="variable">animate it</span>.
    </div>
  </div>

  <div class="font-section story__section fira-section">
    <h2
      class="font-title fira-code"
      style="font-size: 4em; font-weight: 900;
    color: var(--blue-slate-300);"
    >
      Fira Code
      <b>{'<== ~~ =!= ++'}</b>
    </h2>
    <div class="story__description">
      Fira Code is an expansion of Fira Mono, originally designed for FirefoxOS.
      Used primarily for code blocks, SQL queries, and other bits of engineering
      flavor, where necessary. The ligatures can easily be turned off when
      appropriate.
    </div>
    <div class="sql-query">
      SELECT aggregate, version, whatever FROM
      <b>telemetry</b>.<i>aggregates</i>
      WHERE channel='release' AND PRODUCT='fenix' LIMIT 100;
    </div>
  </div>
</div>
