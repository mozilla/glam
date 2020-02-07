/* eslint-disable import/prefer-default-export */
import { format } from 'd3-format';

export const formats = {};

formats.count = format('~s');
formats.percent = format('.0%');
formats.rate = format(',d');
formats.ratio = format('.2');
