/**
 * A sort function which sorts numeric strings numerically.
 *
 * @example
 * ['5', '1', '32', '9', '16', '3'].sort(numericStringsSort); // ['1', '3', '5', '9', '16', '32']
 */
export function numericStringsSort(a, b) {
  return a - b;
}
