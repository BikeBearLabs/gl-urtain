export function defer(
	target:
		| { destroy: () => void; [Symbol.dispose]?: () => void }
		| {
				destroy?: () => void;
				[Symbol.dispose]: () => void;
		  },
	/** @type {() => void} */ callback: () => void,
) {
	const { destroy: rawDestroy, [Symbol.dispose]: rawDispose } = target;
	let destroyed = false;

	if (rawDestroy) {
		target.destroy = () => {
			rawDestroy.call(target);
			if (!destroyed) {
				callback();
			}
			destroyed = true;
		};
	}

	if (rawDispose) {
		target[Symbol.dispose] = () => {
			rawDispose.call(target);
			if (!destroyed) {
				callback();
			}
			destroyed = true;
		};
	}

	return target;
}
