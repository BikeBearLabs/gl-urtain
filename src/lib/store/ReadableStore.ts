export type Subscriber<T> = (v: T) => Invalidator | Promise<void> | void;
export type Invalidator = () => void;
export type Unsubscriber = () => void;
export type StartStopNotifier<T> = (
	set: (v: T) => void,
) => Invalidator | Promise<void> | void;

export type ReadableStore<T> = {
	get(): T;
	subscribe(onChanged: Subscriber<T>): Unsubscriber;
	subscribeLazy(onChanged: Subscriber<T>): Unsubscriber;
	trigger(): void;
	destroy(): void;
	derive<R>(fn: (v: T) => R): ReadableStore<R>;
};
