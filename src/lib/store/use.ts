/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { noop } from '../functional/noop.js';
import { type ReadableStore } from './ReadableStore.js';

export function use<T extends Record<string, ReadableStore<any>>>(
	dependencies: T,
	callback: (values: {
		[k in keyof T as `$${k extends string | number ? k : never}`]: ReturnType<
			T[k]['get']
		>;
	}) => void,
) {
	const entries = Object.entries(dependencies);

	if (entries.length === 0) {
		(callback as () => void)();
		return noop;
	}

	const values = Object.fromEntries(
		entries.map(([k, store]) => [`$${k}`, store.get()] as const),
	) as Parameters<typeof callback>[0];
	const subscriber = (k: string, v: unknown) => {
		const prev = values[`$${k}`];
		if (prev === v) {
			return;
		}

		values[`$${k}` as keyof typeof values] = v as any;
		callback(values);
	};

	const unsubscribes = entries.map(([k, store]) =>
		store.subscribeLazy((v) => {
			subscriber(k, v);
		}),
	);

	callback(values);

	return () => {
		for (const unsubscribe of unsubscribes) {
			unsubscribe();
		}
	};
}
