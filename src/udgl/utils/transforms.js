import produce from 'immer';

export function groupBy(xs, key, transform = (_) => _) {
  return xs.reduce((rv, x) => {
    const K = transform(x[key]);
    (rv[K] = rv[K] || []).push(produce(x, (xi) => xi));
    return rv;
  }, {});
}
