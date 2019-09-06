
import { cubicOut } from 'svelte/easing';

export function leftDrawer(node, {
	delay = 0,
	duration = 400,
	easing = cubicOut
}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const width = parseFloat(style.width);
	const padding_left = parseFloat(style.paddingLeft);
	const padding_right = parseFloat(style.paddingRight);
	const margin_left = parseFloat(style.marginLeft);
	// const margin_right = parseFloat(style.marginRight);
	const border_top_width = parseFloat(style.borderTopWidth);
	const border_bottom_width = parseFloat(style.borderBottomWidth);

	return {
		delay,
		duration,
		easing,
        css: t =>
			`overflow-x: hidden;` +
            `opacity: ${Math.min(t * 20, 1) * opacity};` +
			`transform: translateX(${- (1-t) * width}px);` +
			`padding-left: ${t * padding_left}px;` +
			`padding-right: ${t * padding_right}px;` +
			`margin-left: ${t * margin_left}px;` +
			`margin-right: ${- (1-t) * width}px;` +
			`border-top-width: ${t * border_top_width}px;` +
			`border-bottom-width: ${t * border_bottom_width}px;`
	};
}


export function rightDrawer(node, {
	delay = 0,
	duration = 400,
	easing = cubicOut
}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const width = parseFloat(style.width);
	const padding_left = parseFloat(style.paddingLeft);
	const padding_right = parseFloat(style.paddingRight);
	// const margin_left = parseFloat(style.marginLeft);
	const margin_right = parseFloat(style.marginRight);
	const border_top_width = parseFloat(style.borderTopWidth);
	const border_bottom_width = parseFloat(style.borderBottomWidth);

	return {
		delay,
		duration,
		easing,
        css: t =>
			`overflow-x: hidden;` +
            `opacity: ${Math.min(t * 20, 1) * opacity};` +
			`transform: translateX(${(1-t) * width}px);` +
			`padding-left: ${t * padding_left}px;` +
			`padding-right: ${t * padding_right}px;` +
			`margin-left: ${- (1-t) * width}px;` +
			`margin-right: ${t * margin_right}px;` +
			`border-top-width: ${t * border_top_width}px;` +
			`border-bottom-width: ${t * border_bottom_width}px;`
	};
}