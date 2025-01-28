import { defer } from '../functional/defer.js';
import { type ReadableStore } from './ReadableStore.js';
import { Store } from './Store.js';

export function derive<
	const Stores extends Record<string, ReadableStore<any>>,
	Callback extends (values: {
		[k in keyof Stores as `$${k extends string | number ? k : never}`]: ReturnType<
			Stores[k]['get']
		>;
	}) => any,
>(stores: Stores, callback: Callback): Store<ReturnType<Callback>> {
	const entries = Object.entries(stores);

	if (entries.length === 0) {
		return new Store(
			(callback as (values: any) => ReturnType<Callback>)({}),
		);
	}

	const store = new Store(undefined as ReturnType<Callback>);
	const values = Object.fromEntries(
		entries.map(([k, store]) => /** @type {const} */ [
			`$${k}`,
			store.get(),
		]),
	) as Parameters<typeof callback>[0];
	defer(store, () => {
		for (const unsubscribe of unsubscribes) {
			unsubscribe();
		}
	});

	const subscriber = (
		/** @type {string} */ k: string,
		/** @type {unknown} */ v: unknown,
	) => {
		const prev = values[`$${k}`];
		if (prev === v) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		values[`$${k}` as keyof typeof values] = v as any;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		store.set(callback(values));
	};

	const unsubscribes = entries.map(([k, store]) =>
		store.subscribeLazy((v) => {
			subscriber(k, v);
		}),
	);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	store.set(callback(values));

	return store;
}
