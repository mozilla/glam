import {
  transform,
  addProportion,
  proportionsToCounts,
  changeBooleanHistogramResponse,
  toAudienceSize,
  makeLabel,
  checkForHistogram,
  checkForPercentiles,
  checkForTotalUsers,
} from '../src/utils/transform-data';

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

describe('checks', () => {
  it('correctly throws if checkForHistogram fails', () => {
    const dpass = [{ histogram: { 0: 10, 1: 20 } }];
    const dfail = [{ histogram: undefined }];
    expect(() => transform(checkForHistogram)(dpass)).not.toThrow();
    expect(() => transform(checkForHistogram)(dfail)).toThrow();
  });
  it('correctly throws if checkForPercentiles fails', () => {
    const dpass = [{ percentiles: { 5: 10, 25: 20000 } }];
    const dfail = [{ percentiles: undefined }];
    expect(() => transform(checkForPercentiles)(dpass)).not.toThrow();
    expect(() => transform(checkForPercentiles)(dfail)).toThrow();
  });
  it('correctly throws if checkForTotalUsers fails', () => {
    const dpass = [{ total_users: 1000000 }];
    const dfail = [{ total_users: undefined }];
    expect(() => transform(checkForTotalUsers)(dpass)).not.toThrow();
    expect(() => transform(checkForTotalUsers)(dfail)).toThrow();
  });
});

describe('addProportion / proportionsToCounts', () => {
  const getData = () => [{ histogram: { 0: 0.3, 1: 0.7 }, total_users: 100 }];
  it('adds a proportion key that replicates the value in histogram', () => {
    const data = getData();
    const transformed = transform(addProportion)(data);
    expect(transformed[0].proportions).toEqual(data[0].histogram);
  });
  it('adds a count equivalent to the proportion amounts', () => {
    const data = getData();
    const transformed = transform(addProportion, proportionsToCounts)(data);
    expect(transformed[0].counts).toEqual({ 0: 30, 1: 70 });
  });
});

describe('changeBooleanHistogramResponse', () => {
  it('changes the boolean-histogram response to match something usable in GLAM', () => {
    const data = [{ histogram: { 0: 0.4, 1: 0.6, 2: 0 } }];
    const transformed = transform(changeBooleanHistogramResponse)(data);
    expect(transformed[0].histogram).toEqual({ no: 0.4, yes: 0.6 });
  });
});

describe('toAudienceSize', () => {
  it('duplicates total_users to audienceSize', () => {
    const data = [{ total_users: 120 }];
    const transformed = transform(toAudienceSize)(data);
    expect(transformed[0].audienceSize).toEqual(data[0].total_users);
  });
});

describe('makeLabel', () => {
  const data = [
    {
      version: 50,
      build_id: '20200618170600',
      build_date: '2020-06-18T17:06:00+00:00',
    },
  ];
  it('makes the correct version label', () => {
    const t = transform(makeLabel.version)(data);
    expect(t[0].label).toEqual(t[0].version);
  });
  it('defaults to build_id if build_date is not present.', () => {
    const di = [{ ...data[0] }];
    delete di[0].build_date;
    const t = transform(makeLabel.build_id)(di);
    expect(t[0].label).toEqual(new Date(2020, 6 - 1, 18, 17, 6, 0));
  });
  it('uses build_date as label for build_id if present', () => {
    const t = transform(makeLabel.build_id)(data);
    expect(t[0].label).toEqual(new Date(2020, 6 - 1, 18, 17, 6, 0));
  });
});
