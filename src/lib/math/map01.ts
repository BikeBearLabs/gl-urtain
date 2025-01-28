/**
 * Maps {@linkcode t} from the range {@linkcode rangeStart} to {@linkcode rangeEnd}
 * to the range 0 to 1, without clamping it.
 *
 * @example
 * 	map01(50, 0, 100); // 0.5
 * 	map01(200, 0, 100); // 2
 * 	map01(-50, 0, 100); // -0.5
 */
export function map01(t: number, rangeStart: number, rangeEnd: number) {
	const range = rangeEnd - rangeStart;
	if (range === 0) return 0;
	return (t - rangeStart) / range;
}
