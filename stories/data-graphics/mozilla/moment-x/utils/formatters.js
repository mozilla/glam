/* eslint-disable import/prefer-default-export */
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

export const formats = {};

formats.count = format('~s');
formats.percent = format('.0%');
formats.percent2d = format('.2%');
formats.rate = format(',d');
formats.ratio = format('.2');

export const dmy = timeFormat('%b %d, %Y');
