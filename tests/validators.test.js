import { noDuplicates, noResponse } from '../src/utils/data-validation';
import {
  noResponseExamples,
  noDuplicatesExamples,
} from './examples/validators';

describe('noResponse', () => {
  it('passes if there is a response key', () => {
    expect(() => noResponse(noResponseExamples.hasResponse)).not.toThrow();
    expect(() => noResponse(noResponseExamples.noResponse)).toThrow();
  });
});

describe('noDuplicates', () => {
  it('passes or rejects depending on if there are duplicate keys (build_ids, versions)', () => {
    expect(() =>
      noDuplicates(noDuplicatesExamples.noDups, 'build_id')
    ).not.toThrow();
    expect(() => noDuplicates(noDuplicatesExamples.dups, 'build_id')).toThrow();
  });
});
