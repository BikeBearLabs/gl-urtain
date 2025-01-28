import type { ReadableStore } from './ReadableStore.js';

export type * from './ReadableStore.js';

export type Updater<T> = (v: T) => T;

export type WritableStore<T> = ReadableStore<T> & {
	set(value: T): void;
	update(updater: Updater<T>): void;
};
