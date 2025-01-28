import { lerp } from './lerp.js';
import { map01 } from './map01.js';

// eslint-disable-next-line max-params
export function map(
	t: number,
	rangeStart: number,
	rangeEnd: number,
	domainStart: number,
	domainEnd: number,
) {
	return lerp(map01(t, rangeStart, rangeEnd), domainStart, domainEnd);
}
