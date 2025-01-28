import { type Array0ToN } from './Array0ToN.js';

export type VecN<Size extends number, T extends Record<number, unknown>> = {
	[k in keyof T as number extends k ? never : k]: T[k];
} & {
	[k in Array0ToN<Size>]: k extends keyof T ? NonNullable<T[k]> : never;
} & {
	length: Size;
} & T;

export function VecN<
	Size extends number,
	Ctor extends new (size: number) => ArrayLike<number>,
>(size: Size, ctor: Ctor) {
	type Instance = VecN<Size, InstanceType<Ctor>>;
	const Class = ctor.bind(undefined, size) as new () => Instance;

	return Class;
}
