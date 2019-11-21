/* eslint-disable import/prefer-default-export */
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

export function histogramSpring(initial, params = { damping: 1, stiffness: 0.9 }) {
  function getHistValues(d) {
    return d.map((di) => di.value);
  }
  let value = initial;
  const referenceDistSpring = spring(getHistValues(value), params);

  const { subscribe } = derived(referenceDistSpring,
    ($d) => $d.map((di, i) => ({ value: di, bin: value[i].bin })));
  return {
    subscribe,
    setValue: (v) => {
      value = v;
      referenceDistSpring.set(getHistValues(value));
    },
  };
}

export function twoPointSpring(initialHoverValue, initialReferenceValue, scale, colorMap = () => 'black') {
  function ptToSpringValue(pt) {
    if (pt === undefined) return undefined;
    const out = { ...pt };
    Object.keys(out).forEach((k) => {
      out[k] = scale(out[k]);
    });
    return out;
  }

  const hovParams = { damping: 1, stiffness: 0.7 };
  const refParams = { damping: 0.55, stiffness: 1 };
  const leftValues = spring(ptToSpringValue(initialHoverValue), hovParams);
  const rightValues = spring(ptToSpringValue(initialReferenceValue), refParams);

  const dotsAndLines = derived([leftValues, rightValues], ([$left, $right]) => {
    if (!$left || !$right) return [];
    const dal = Object.keys($right).reduce((acc, k) => {
      const rightY = $right[k];
      const leftY = $left[k];
      const color = colorMap(k);
      acc[k] = { leftY, rightY, color }; // eslint-disable-line
      return acc;
    }, {});
    return dal;
  });
  return {
    transform: ptToSpringValue,
    subscribe: dotsAndLines.subscribe,
    setHover: (p, hard = false) => {
      leftValues.set(ptToSpringValue(p), { hard });
    },
    setReference: (p, hard = false) => {
      rightValues.set(ptToSpringValue(p), { hard });
    },
  };
}

export function cartesianCoordSpring(initialValue, xScale, yScale, params = { damping: 0.65, stiffness: 0.3 }) {
  function ptToSpringValue(pt) {
    if (pt === undefined) return undefined;
    const out = { ...pt };
    Object.keys(out).forEach((k) => {
      out[k] = { x: xScale(out[k].x), y: yScale(out[k].y) };
    });
    return out;
  }
  const { subscribe, set } = spring(ptToSpringValue(initialValue), params);
  return {
    subscribe,
    setValue: (p) => {
      set(ptToSpringValue(p));
    },
  };
}
