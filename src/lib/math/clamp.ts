export function clamp(t: number, min: number, max: number) {
	return Math.min(Math.max(t, min), max);
}
