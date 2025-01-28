import { type HexColor } from './HexColor.js';
import { hexToRgba } from './hexToRgba.js';
import { type RgbaColor } from './RgbaColor.js';

export function coerceToRgba(color: HexColor | RgbaColor): RgbaColor {
	if (typeof color === 'string') {
		return hexToRgba(color);
	}

	return color;
}
