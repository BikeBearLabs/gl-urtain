/**
 * Returns the shortest cyclical distance between {@linkcode a} & {@linkcode b},
 * assuming they are both within {@linkcode range}
 */
export function cyclicalDistance(a: number, b: number, range: number) {
	a %= range;
	b %= range;

	// calculate forward and backward distances
	const forwardDistance = (b - a + range) % range;
	const backwardDistance = (a - b + range) % range;

	// return the minimum of the two distances
	return Math.min(forwardDistance, backwardDistance);
}
