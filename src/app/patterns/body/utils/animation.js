/* eslint-disable import/prefer-default-export */
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

export function twoPointSpring(initialHoverValue, initialReferenceValue, scale, colorMap = () => 'black') {
  function ptToSpringValue(pt) {
    if (pt === undefined) return undefined;
    const out = { ...pt };
    Object.keys(out).forEach((k) => {
      out[k] = scale(out[k]);
    });
    return out;
  }

  const leftValues = spring(ptToSpringValue(initialHoverValue), { damping: 1, stiffness: 0.7 });
  const rightValues = spring(ptToSpringValue(initialReferenceValue), { damping: 0.55, stiffness: 1 });

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
    setHover: (p) => {
      leftValues.set(ptToSpringValue(p));
    },
    setReference: (p) => {
      rightValues.set(ptToSpringValue(p));
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
