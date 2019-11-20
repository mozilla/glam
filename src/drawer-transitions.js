import { cubicOut } from "svelte/easing";

export function leftDrawer(
  node,
  { delay = 0, duration = 400, easing = cubicOut }
) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const width = parseFloat(style.width);
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);
  const marginLeft = parseFloat(style.marginLeft);
  // const marginRight = parseFloat(style.marginRight);
  const borderTopWidth = parseFloat(style.borderTopWidth);
  const borderBottomWidth = parseFloat(style.borderBottomWidth);

  return {
    delay,
    duration,
    easing,
    css: t =>
      "overflow-x: hidden;" +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `transform: translateX(${-(1 - t) * width}px);` +
      `padding-left: ${t * paddingLeft}px;` +
      `padding-right: ${t * paddingRight}px;` +
      `margin-left: ${t * marginLeft}px;` +
      `margin-right: ${-(1 - t) * width}px;` +
      `border-top-width: ${t * borderTopWidth}px;` +
      `border-bottom-width: ${t * borderBottomWidth}px;`
  };
}

export function rightDrawer(
  node,
  { delay = 0, duration = 400, easing = cubicOut }
) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const width = parseFloat(style.width);
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);
  // const marginLeft = parseFloat(style.marginLeft);
  const marginRight = parseFloat(style.marginRight);
  const borderTopWidth = parseFloat(style.borderTopWidth);
  const borderBottomWidth = parseFloat(style.borderBottomWidth);

  return {
    delay,
    duration,
    easing,
    css: t =>
      "overflow-x: hidden;" +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `transform: translateX(${(1 - t) * width}px);` +
      `padding-left: ${t * paddingLeft}px;` +
      `padding-right: ${t * paddingRight}px;` +
      `margin-left: ${-(1 - t) * width}px;` +
      `margin-right: ${t * marginRight}px;` +
      `border-top-width: ${t * borderTopWidth}px;` +
      `border-bottom-width: ${t * borderBottomWidth}px;`
  };
}
