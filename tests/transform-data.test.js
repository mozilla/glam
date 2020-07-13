import { transform } from '../src/utils/transform-data';

describe('transform parameters must be either a function or falsy', () => {
  it('rejects non-functions / falsy values', () => {
    expect(() => transform(10, 'hello')).toThrow();
  });
  it('accepts a function', () => {
    expect(() => transform(() => {})).not.toThrow();
    expect(() =>
      transform((point) => {
        point.y = 10000;
      })
    ).not.toThrow();
  });
  it('accepts a falsy value', () => {
    expect(() => transform(false)).not.toThrow();
    const tFalse = transform(false);
    expect(tFalse([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }])).toEqual([
      { x: 1 },
      { x: 2 },
      { x: 3 },
      { x: 4 },
    ]);
  });
  it('accepts both falsy values and functions', () => {
    const t = transform(false, (v) => {
      v.x += 1;
    });
    expect(t([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }])).toEqual([
      { x: 2 },
      { x: 3 },
      { x: 4 },
      { x: 5 },
    ]);
  });
});

describe('basic transformations work as expected', () => {
  const data = [
    { x: 30, y: 1000, z: 'abcdefghijklmnop' },
    { x: 60, y: 40, z: 'opqrstuvwzyz' },
  ];
  const pipeline = transform(
    (pt) => {
      pt.x += 10;
    },
    (pt) => {
      pt.y = pt.x / pt.y;
    },
    (pt) => {
      pt.z = pt.z.slice(0, 4);
    }
  );
  const transformedData = pipeline(data);
  it('transforms a singular field', () => {
    expect(transformedData.map((di) => di.x)).toEqual([40, 70]);
    expect(transformedData.map((di) => di.z)).toEqual(['abcd', 'opqr']);
  });
  it('pushes one transform to the next layer', () => {
    expect(transformedData.map((di) => di.y)).toEqual([40 / 1000, 70 / 40]);
  });
});
