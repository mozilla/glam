import { noResponse, noUseCounters } from '../src/utils/data-validation';
import { noResponseExamples } from './examples/validators';

describe('noResponse', () => {
  it('passes if there is a response key', () => {
    expect(() => noResponse(noResponseExamples.hasResponse)).not.toThrow();
    expect(() => noResponse(noResponseExamples.noResponse)).toThrow();
  });
});

describe('noUseCounters', () => {
  it('throws for Glean and legacy use counters', () => {
    expect(() => noUseCounters('use.counter.doc.foo')).toThrow(
      'Use counters are not supported here.'
    );
    expect(() => noUseCounters('USE_COUNTER2_SVGSVGELEMENT')).toThrow();
  });

  it('passes for other probes', () => {
    expect(() => noUseCounters('metrics.foo_counter')).not.toThrow();
    expect(() => noUseCounters('house_counter')).not.toThrow();
    expect(() => noUseCounters(undefined)).not.toThrow();
  });
});
