import {
  formatLargeNumber,
  formatFromNanoseconds,
} from '../src/utils/formatters';

describe('formatFromNanoseconds', () => {
  it('correctly formats nanoseconds', () => {
    expect(formatFromNanoseconds(123)).toEqual('123 ns');
  });
  it('correctly formats to microseconds', () => {
    expect(formatFromNanoseconds(12_345)).toEqual('12 μs');
    expect(formatFromNanoseconds(123_456)).toEqual('123 μs');
  });
  it('correctly formats to milliseconds', () => {
    expect(formatFromNanoseconds(1_234_567)).toEqual('1 ms');
    expect(formatFromNanoseconds(123_456_789)).toEqual('123 ms');
  });
  it('correctly formats to seconds', () => {
    expect(formatFromNanoseconds(12_345_678_912)).toEqual('12 s');
  });
});
describe('formatLargeNumber', () => {
  it('correctly formats large numbers', () => {
    expect(formatLargeNumber(123)).toEqual('123');
    expect(formatLargeNumber(1234)).toEqual('1.2k');
    expect(formatLargeNumber(1234567)).toEqual('1.2mil');
    expect(formatLargeNumber(1234567890)).toEqual('1.2bil');
  });
});
