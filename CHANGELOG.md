# Changelog

## [unreleased](https://github.com/mozilla/glam/compare/2020.10.0...HEAD) (date TBD)

- Update time horizon to be able to view more data
  ([#928](https://github.com/mozilla/glam/pull/928))

## [2020.10.0](https://github.com/mozilla/glam/compare/2020.9.0...2020.10.0) (2020-10-01)

- Add `keyed-scalar` to list of probe types
  ([b876a80](https://github.com/mozilla/glam/commit/b876a80f9b627ecd9409781164e52f93b70d273e))

## [2020.9.1](https://github.com/mozilla/glam/compare/2020.9.0...2020.9.1) (2020-09-29)

- Fix for import clashes when running parallel imports in production
  ([bdea458](https://github.com/mozilla/glam/commit/bdea458f1217cd33866f5f296924d31d8caa266c))

## [2020.9.0](https://github.com/mozilla/glam/compare/2020.7.0...2020.9.0) (2020-09-24)

- Update
  [database](https://github.com/mozilla/glam/commit/9adef25f3e5a511a3a4b9f6ff6d54ef2d7afe942)
  and
  [API](https://github.com/mozilla/glam/commit/88d7980aea40b48192434ad9e10bb3e42819aad0)
  to support Fenix aggregations
- Update front-end to use probe-search in
  [6530682](https://github.com/mozilla/glam/commit/6530682dbb546c411d7b1082175507df40452c44)
  and
  [18041c5](https://github.com/mozilla/glam/commit/18041c59d7f911764bc0942264a0ac1e553c0592)
- Replace in-app auth0 implementation with nginx proxy auth0 in
  [#887](https://github.com/mozilla/glam/pull/887) and
  [#889](https://github.com/mozilla/glam/pull/889)
- Remove udgl and replace components with graph-paper
  ([#902](https://github.com/mozilla/glam/pull/902))
- Update to support multiple apps per Glean product
  ([f11e979](https://github.com/mozilla/glam/commit/f11e9793b4725d2bfc6ebd222d481555918b1c24))
- Refactor store initialization
  ([#687](https://github.com/mozilla/glam/issues/687))
- Attach labels to categorical histograms
  ([#907](https://github.com/mozilla/glam/pull/907))
- Add last updated model and API endpoint
  ([#743](https://github.com/mozilla/glam/pull/743))
- Add `/docs/adr/` (a directory of Architectural Decision Records)
  ([#854](https://github.com/mozilla/glam/pull/854/))
- Reset reference point when switching between probes
  ([#850](https://github.com/mozilla/glam/issues/850))

## [2020.7.0](https://github.com/mozilla/glam/compare/2020.6.0...2020.7.0) (2020-07-02)

- update front-end for search api changes

## [2020.6.0](https://github.com/mozilla/glam/compare/2020.5.2...2020.6.0) (2020-06-30)

- Fix issue with categorical explorer counts
  ([#587](https://github.com/mozilla/glam/pull/587))
- Use Probe Search Service for probe search results
  ([#602](https://github.com/mozilla/glam/pull/602))
- Replace data graphic components with `@graph-paper/datagraphic`,
  `@graph-paper/elements`, and `@graph-paper/guides` equivalents
  ([#573](https://github.com/mozilla/glam/pull/573))
- Update API to accept `versions` param as integer, defaulting to 3, for
  fetching more historical data
  ([#678](https://github.com/mozilla/glam/issues/678))
- Provide a category select box for probes with a large number of categories
  ([#216](https://github.com/mozilla/glam/issues/216))
- Add support for Google Analytics
  ([#554](https://github.com/mozilla/glam/issues/554))
- Various dependency updates

## [2020.5.2](https://github.com/mozilla/glam/compare/2020.5.1...2020.5.2) (2020-05-26)

- Select prerelease channel if current channel = release & probe only exists in
  prerelease ([#492](https://github.com/mozilla/glam/pull/492))
- Change GLAM API response to be more tabular
  ([#494](https://github.com/mozilla/glam/pull/494))
- Optimized random probe API ([#531](https://github.com/mozilla/glam/pull/531))

## [2020.5.1](https://github.com/mozilla/glam/compare/2020.5.0...2020.5.1) (2020-05-26)

- Update database schema to use transposed histograms and percentiles resulting
  in a 15x improvement in response times in some cases.
  ([#509](https://github.com/mozilla/glam/pull/509))

## [2020.5.0](https://github.com/mozilla/glam/compare/2020.4.2...2020.5.0) (2020-05-12)

- Add prototype app warning dialog
  ([#478](https://github.com/mozilla/glam/pull/478))
- Fix bug where process=all should convert to `process=[parent,content,gpu]`
  ([#481](https://github.com/mozilla/glam/pull/451))
- Switch to `curveLinear` for explore plots
  ([#483](https://github.com/mozilla/glam/pull/483/))
- Fix low-volume comparison chart
  ([#483](https://github.com/mozilla/glam/pull/483/),
  [#486](https://github.com/mozilla/glam/pull/486/))

## [2020.4.2](https://github.com/mozilla/glam/compare/2020.4.1...2020.4.2) (2020-04-30)

- Change the violin plot implementation
  ([#451](https://github.com/mozilla/glam/pull/451))
- Change curvature of percentile lines
  ([#447](https://github.com/mozilla/glam/pull/447))

## [2020.4.1](https://github.com/mozilla/glam/compare/2020.4.0...2020.4.1) (2020-04-28)

- Add feedback button to top ([#464](https://github.com/mozilla/glam/pull/464))
- Add special-cased probe dimension missing data error component
  ([#441](https://github.com/mozilla/glam/pull/441))

## [2020.4.0](https://github.com/mozilla/glam/compare/m1...2020.4.0) (2020-04-22)

- fix bugs around low-volume probe displays
  ([#327](https://github.com/mozilla/glam/issues/327))
- fix bug where store values were reset after authentication
  ([#429](https://github.com/mozilla/glam/pull/429))
- fix bug with body selectors ([#421](https://github.com/mozilla/glam/pull/421))
- fix bug with aggregation level selector
  ([#422](https://github.com/mozilla/glam/pull/422))
- move dimension filters into the content body
  ([#418](https://github.com/mozilla/glam/pull/418))
- automatically adjust process if current one is not valid for probe
  ([#418](https://github.com/mozilla/glam/pull/418))

## [m1](https://github.com/mozilla/glam/compare/m0...m1) (2020-04-16)

- add error handling for 4xx responses
- add specific error handling for 404, when data is not available
- ran prettier on all JS (but not svelte) assets
- clean up unused storybook stories
- fix for keyed enumerated histograms
- add editorconfig to standardize editor code syntax
- add initial support for importing fenix data
- update to API to better support boolean histograms

## m0 (2020-03-26)

- Initial tagged release
