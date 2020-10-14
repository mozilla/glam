import { formatMemory, formatFromNanoseconds } from '../src/utils/formatters';

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

describe('formatMemory', () => {
  it('correctly formats bytes to bytes', () => {
    expect(formatMemory('byte')(1)).toEqual('1.00');
    expect(formatMemory('byte')(12)).toEqual('12.0');
    expect(formatMemory('byte')(123)).toEqual('123');
  });
  it('correctly formats bytes to kilobytes', () => {
    expect(formatMemory('byte')(1_234)).toEqual('1.23k');
    expect(formatMemory('byte')(12_345)).toEqual('12.3k');
    expect(formatMemory('byte')(123_456)).toEqual('123k');
  });
  it('correctly formats bytes to megabytes', () => {
    expect(formatMemory('byte')(1_234_567)).toEqual('1.23M');
    expect(formatMemory('byte')(12_345_678)).toEqual('12.3M');
    expect(formatMemory('byte')(123_456_789)).toEqual('123M');
  });
  it('correctly formats bytes to gigabytes', () => {
    expect(formatMemory('byte')(1_234_567_891)).toEqual('1.23G');
    expect(formatMemory('byte')(12_345_678_912)).toEqual('12.3G');
    expect(formatMemory('byte')(123_456_789_123)).toEqual('123G');
  });
  it('correctly formats kilobytes to appropriate SI prefix', () => {
    expect(formatMemory('kilobyte')(1)).toEqual('1.00k');
    expect(formatMemory('kilobyte')(123)).toEqual('123k');
    expect(formatMemory('kilobyte')(1_234)).toEqual('1.23M');
    expect(formatMemory('kilobyte')(12_345)).toEqual('12.3M');
    expect(formatMemory('kilobyte')(123_456)).toEqual('123M');
    expect(formatMemory('kilobyte')(1_234_567)).toEqual('1.23G');
    expect(formatMemory('kilobyte')(12_345_678)).toEqual('12.3G');
    expect(formatMemory('kilobyte')(123_456_789)).toEqual('123G');
  });
  it('correctly formats megabytes to appropriate SI prefix', () => {
    expect(formatMemory('megabyte')(1)).toEqual('1.00M');
    expect(formatMemory('megabyte')(123)).toEqual('123M');
    expect(formatMemory('megabyte')(1_234)).toEqual('1.23G');
    expect(formatMemory('megabyte')(12_345)).toEqual('12.3G');
    expect(formatMemory('megabyte')(123_456)).toEqual('123G');
    expect(formatMemory('megabyte')(1_234_567)).toEqual('1.23T');
  });
  it('correctly formats gigabytes to appropriate SI prefix', () => {
    expect(formatMemory('gigabyte')(1)).toEqual('1.00G');
    expect(formatMemory('gigabyte')(123)).toEqual('123G');
    expect(formatMemory('gigabyte')(1_234)).toEqual('1.23T');
    expect(formatMemory('gigabyte')(12_345)).toEqual('12.3T');
    expect(formatMemory('gigabyte')(123_456)).toEqual('123T');
    expect(formatMemory('gigabyte')(1_234_567)).toEqual('1.23P');
  });
});
