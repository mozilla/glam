import { noResponse } from '../../src/utils/data-validation';
import { noResponseExamples } from './examples/validators';

describe('noResponse', () => {
  it('passes if there is a response key', () => {
    expect(() => noResponse(noResponseExamples.hasResponse)).not.toThrow();
    expect(() => noResponse(noResponseExamples.noResponse)).toThrow();
  });
});
