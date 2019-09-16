import { cumSum, weightedQuantile } from '../src/utils/stats';
import { hist01, weightedQuantiles01} from './data.js'

describe('cumSum', () => {
  it('', () => {
    const vs = [1,10,100,3,4];
    expect(cumSum(vs)).toStrictEqual([1,11,111,114,118]);
  });
});

describe('weightedQuantile', () => {
  it('correctly computes the weighted quantiles', () => {
    expect(weightedQuantile([.05,.25,.5,.75,.95], hist01.map(h=>h.value), hist01.map(h=>h.weight))).toEqual(weightedQuantiles01);
  });
});
