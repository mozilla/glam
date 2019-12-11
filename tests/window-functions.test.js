import { scaleLinear } from 'd3-scale';
import { firstIndexAbove, previousCurrentNext, get1DWindow } from '../src/components/data-graphics/utils/window-functions';

const data01 = [
  { a: 4 },
  { a: 5 },
  { a: 6 },
  { a: 7.5 },
  { a: 9 },
  { a: 10 },
  { a: 11 },
  { a: 13 },
];

describe('firstIndexAbove', () => {
  it('finds the first index above', () => {
    expect(firstIndexAbove({ value: 7.3, data: data01, key: 'a' })).toEqual(3);
    expect(firstIndexAbove({ value: 2, data: data01, key: 'a' })).toEqual(0);
    expect(firstIndexAbove({ value: 10.000001, data: data01, key: 'a' })).toEqual(6);
    expect(firstIndexAbove({ value: -Infinity, data: data01, key: 'a' })).toEqual(0);
    expect(firstIndexAbove({ value: Infinity, data: data01, key: 'a' })).toEqual(8);
  });
});

describe('previousCurrentNext', () => {
  it('finds previous current next values', () => {
    expect(previousCurrentNext({ value: 7.3, data: data01, key: 'a' })).toStrictEqual([2, 3, 4]);
    expect(previousCurrentNext({ value: 9.2, data: data01, key: 'a' })).toStrictEqual([3, 4, 5]);
    expect(previousCurrentNext({ value: 9.51, data: data01, key: 'a' })).toStrictEqual([4, 5, 6]);
    expect(previousCurrentNext({ value: 4.1, data: data01, key: 'a' })).toStrictEqual([0, 0, 1]);
    expect(previousCurrentNext({ value: 3, data: data01, key: 'a' })).toStrictEqual([0, 0, 1]);
    expect(previousCurrentNext({ value: 12.51, data: data01, key: 'a' })).toStrictEqual([6, 7, 7]);
  });
});

describe('get1DWindow', () => {
  it('gets a 1d window', () => {
    expect(get1DWindow({
      value: 7.3, data: data01, key: 'a', pad: 0.5,
    })).toStrictEqual({
      start: 6.75,
      end: 8.25,
      width: 8.25 - 6.75,
      rangeStart: 6.75,
      rangeEnd: 8.25,
      rangeWidth: 8.25 - 6.75,
    });

    expect(get1DWindow({
      value: 7.3, data: data01, key: 'a', pad: 1,
    })).toStrictEqual({
      start: 6,
      end: 9,
      width: 3,
      rangeStart: 6,
      rangeEnd: 9,
      rangeWidth: 3,
    });
    const scale = scaleLinear().domain([0, 15]).range([0, 100]);
    expect(get1DWindow({
      value: 7.3, data: data01, key: 'a', pad: 1, scale,
    })).toStrictEqual({
      start: 6,
      end: 9,
      width: 3,
      rangeStart: scale(6),
      rangeEnd: scale(9),
      rangeWidth: scale(9) - scale(6),
    });
  });
});
