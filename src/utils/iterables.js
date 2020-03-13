export function* backwards(array) {
  if (!Array.isArray(array)) throw new Error(`must pass in Array, instead got ${typeof array}`);
  let i = array.length;
  while (i > 0) {
    i -= 1;
    yield array[i];
  }
}
