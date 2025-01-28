import { clamp } from './clamp.js';

export function clamp01(t: number) {
	return clamp(t, 0, 1);
}
