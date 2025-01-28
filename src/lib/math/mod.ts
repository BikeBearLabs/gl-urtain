/**
 * Modulo.
 *
 * @see https://stackoverflow.com/a/17323608
 */
export function mod(t: number, m: number) {
	return ((t % m) + m) % m;
}
