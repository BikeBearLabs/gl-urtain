// copied from svelte's implementation

import type {
	Invalidator,
	ReadableStore,
	StartStopNotifier,
	Subscriber,
	Unsubscriber,
} from './ReadableStore.js';
import type { Updater } from './WritableStore.js';
import { Supply } from './Supply.js';

export type Storify<T> = T extends infer U ? Store<U> : never;
type Emitter<S extends string, V> =
	| {
			on(event: S, callback: (event: V) => void): void;
			off(event: S, callback: (event: V) => void): void;
	  }
	| {
			addEventListener(event: S, callback: (event: V) => void): void;
			removeEventListener(event: S, callback: (event: V) => void): void;
	  }
	| {
			addListener(event: S, callback: (event: V) => void): void;
			removeListener(event: S, callback: (event: V) => void): void;
	  };

export class Store<T = unknown> implements ReadableStore<T> {
	public static fromEmitter<
		T extends Emitter<string, any>,
		const S extends T extends Emitter<infer EventString, any> ? EventString
		:	never,
		V extends T extends Emitter<S, infer Event> ? Event : never,
	>(
		emitter: T,
		event: S,
		{
			start,
			stop,
		}: {
			start?: () => void;
			stop?: () => void;
		} = {},
	) {
		return new Store<V | undefined>(undefined, (set) => {
			const listener = (value: V) => {
				set(value);
			};

			start?.();

			if ('on' in emitter) {
				emitter.on(event, listener);
			} else if ('addEventListener' in emitter) {
				emitter.addEventListener(event, listener);
			} else if ('addListener' in emitter) {
				emitter.addListener(event, listener);
			} else {
				throw new Error('Unknown emitter');
			}

			return () => {
				if ('off' in emitter) {
					emitter.off(event, listener);
				} else if ('removeEventListener' in emitter) {
					emitter.removeEventListener(event, listener);
				} else if ('removeListener' in emitter) {
					emitter.addListener(event, listener);
				}

				stop?.();
			};
		});
	}

	protected static neq(a: unknown, b: unknown) {
		/* eslint-disable no-negated-condition, no-self-compare, eqeqeq */
		return (
			a != a ?
				b == b
			:	a !== b ||
				(a && typeof a === 'object') ||
				typeof a === 'function') as boolean;
		/* eslint-enable */
	}

	private readonly invalidators = new Set<Invalidator>();
	private readonly subscribers = new Set<Subscriber<T>>();

	private onStopped: Unsubscriber | undefined = undefined;

	#supply: Supply<T> | undefined = undefined;
	public get supply() {
		return (this.#supply ??= new Supply(this));
	}

	constructor(
		protected value: T,
		private readonly onStarted?: StartStopNotifier<T>,
	) {}

	public set(v: T) {
		if (!Store.neq(this.get(), v)) {
			return;
		}

		this.value = v;
		this.trigger();
	}

	public update(fn: Updater<T>) {
		this.set(fn(this.get()));
	}

	public get() {
		return this.value;
	}

	public trigger() {
		for (const invalidator of this.invalidators) {
			invalidator();
		}

		this.invalidators.clear();

		for (const subscriber of this.subscribers) {
			this.invoke(subscriber);
		}
	}

	public subscribe(onChanged: Subscriber<T>) {
		this.invoke(onChanged);

		return this.subscribeLazy(onChanged);
	}

	public subscribeLazy(onChanged: Subscriber<T>) {
		this.subscribers.add(onChanged);

		const shouldInvokeStarted = this.subscribers.size <= 1;
		if (shouldInvokeStarted && this.onStarted) {
			const invalidator = this.onStarted(this.set.bind(this));
			if (typeof invalidator === 'function') {
				this.onStopped = invalidator;
			}
		}

		return (() => {
			this.subscribers.delete(onChanged);

			const shouldInvokeStopped = this.subscribers.size <= 0;
			if (shouldInvokeStopped && this.onStopped) {
				this.onStopped();
				this.onStopped = undefined;
			}
		}) as Unsubscriber;
	}

	public destroy() {
		for (const invalidator of this.invalidators) {
			invalidator();
		}
		this.invalidators.clear();
		this.subscribers.clear();
		this.onStopped?.();
		this.onStopped = undefined;
	}

	public receive(from: ReadableStore<T>) {
		return from.subscribe((v) => {
			this.set(v);
		});
	}

	public derive<R>(fn: (v: T) => R, onStarted?: Store<R>['onStarted']) {
		const store = new Store(fn(this.get()), onStarted);

		this.subscribeLazy((v) => {
			store.set(fn(v));
		});

		return store;
	}

	private invoke(subscriber: Subscriber<T>) {
		const invalidator = subscriber(this.get());
		if (typeof invalidator === 'function') {
			this.invalidators.add(invalidator);
		}
	}
}
