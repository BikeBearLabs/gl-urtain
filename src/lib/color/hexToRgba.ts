import { type HexColor } from './HexColor.js';
import { type RgbaColor } from './RgbaColor.js';

export function hexToRgba(hex: HexColor): RgbaColor {
	if (!hex.startsWith('#')) {
		return [NaN, NaN, NaN, NaN];
	}

	const hexString = hex.slice(1);

	if (hexString.length <= 4) {
		const r = hexSegmentToInt(`${hexString[0]!}${hexString[0]!}`);
		const g = hexSegmentToInt(`${hexString[1]!}${hexString[1]!}`);
		const b = hexSegmentToInt(`${hexString[2]!}${hexString[2]!}`);
		const a =
			hexString.length === 4 ?
				hexSegmentToInt(`${hexString[3]!}${hexString[3]!}`)
			:	255;

		return [r, g, b, a];
	}

	if (hexString.length <= 8) {
		const r = hexSegmentToInt(`${hexString[0]!}${hexString[1]!}`);
		const g = hexSegmentToInt(`${hexString[2]!}${hexString[3]!}`);
		const b = hexSegmentToInt(`${hexString[4]!}${hexString[5]!}`);
		const a =
			hexString.length === 8 ?
				hexSegmentToInt(`${hexString[6]!}${hexString[7]!}`)
			:	255;

		return [r, g, b, a];
	}

	return [NaN, NaN, NaN, NaN];
}

function hexSegmentToInt(segment: string): number {
	return Number.parseInt(segment, 16);
}
