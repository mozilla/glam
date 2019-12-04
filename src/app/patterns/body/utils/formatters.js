import { format } from 'd3-format';

export const formatValue = format(',.2f');
export const formatPercent = format('.0%');
export const formatCount = format(',d');
export const formatBuildIDToDateString = (b) => `${b.slice(0, 4)}-${b.slice(4, 6)}-${b.slice(6, 8)} ${b.slice(8, 10)}h`;
