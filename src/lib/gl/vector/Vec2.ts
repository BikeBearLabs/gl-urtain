import { VecN } from './VecN.js';

const size = 2;

export class Vec2 extends VecN(size, Float32Array) {
	public static from(v: Float32Array) {
		this.assertSize(v);
		return new Vec2(v[0], v[1]);
	}

	public static assertSize(v: Float32Array): asserts v is Vec2 {
		if (v.length !== size) {
			throw new Error(
				`Expected ${size} or more elements, got ${v.length}`,
			);
		}
	}

	public constructor(x: number, y: number) {
		super();
		this[0] = x;
		this[1] = y;
	}

	public copy(v: Float32Array) {
		Vec2.assertSize(v);
		this[0] = v[0];
		this[1] = v[1];
	}

	public add(x: number, y: number) {
		this[0] += x;
		this[1] += y;
	}

	public sub(x: number, y: number) {
		this[0] -= x;
		this[1] -= y;
	}

	public mul(x: number, y: number) {
		this[0] *= x;
		this[1] *= y;
	}

	public div(x: number, y: number) {
		this[0] /= x;
		this[1] /= y;
	}

	public dot(x: number, y: number) {
		return this[0] * x + this[1] * y;
	}
}
