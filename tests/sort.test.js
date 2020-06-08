import { numericStringsSort } from '../src/utils/sort';

describe('utils/sort.js', () => {
  it('someNumericalStringsSort', () => {
    const sorted = ['5', '1', '32', '9', '16', '3'].sort(numericStringsSort);
    expect(sorted).toStrictEqual(['1', '3', '5', '9', '16', '32']);
  });
});
