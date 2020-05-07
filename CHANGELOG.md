# Changelog

## [unreleased](https://github.com/mozilla/glam/compare/2020.4.2...HEAD) (date TBD)

-

## [2020.4.2](https://github.com/mozilla/glam/compare/2020.4.1...2020.4.2) (2020-04-30)

- changes the violin plot implementation ([#451](https://github.com/mozilla/glam/pull/451))
- changes curvature of percentile lines ([#447](https://github.com/mozilla/glam/pull/447))

## [2020.4.1](https://github.com/mozilla/glam/compare/2020.4.0...2020.4.1) (2020-04-28)

- Add feedback button to top ([#464](https://github.com/mozilla/glam/pull/464))
- Add special-cased probe dimension missing data error component ([#441](https://github.com/mozilla/glam/pull/441))

## [2020.4.0](https://github.com/mozilla/glam/compare/m1...2020.4.0) (2020-04-22)

- fix bugs around low-volume probe displays ([#327](https://github.com/mozilla/glam/issues/327))
- fix bug where store values were reset after authentication ([#429](https://github.com/mozilla/glam/pull/429))
- fix bug with body selectors ([#421](https://github.com/mozilla/glam/pull/421))
- fix bug with aggregation level selector ([#422](https://github.com/mozilla/glam/pull/422))
- move dimension filters into the content body ([#418](https://github.com/mozilla/glam/pull/418))
- automatically adjust process if current one is not valid for probe ([#418](https://github.com/mozilla/glam/pull/418))

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
