import { VecN } from './VecN.js';

const size = 4;

export class Vec4 extends VecN(size, Float32Array) {
	public static from(v: Float32Array) {
		this.assertSize(v);
		return new Vec4(v[0], v[1], v[2], v[3]);
	}

	public static assertSize(v: Float32Array): asserts v is Vec4 {
		if (v.length !== size) {
			throw new Error(
				`Expected ${size} or more elements, got ${v.length}`,
			);
		}
	}

	public constructor(x: number, y: number, z: number, w: number) {
		super();
		this[0] = x;
		this[1] = y;
		this[2] = z;
		this[3] = w;
	}

	public copy(v: Float32Array) {
		Vec4.assertSize(v);
		this[0] = v[0];
		this[1] = v[1];
		this[2] = v[2];
		this[3] = v[3];
	}

	public add(x: number, y: number, z: number, w: number) {
		this[0] += x;
		this[1] += y;
		this[2] += z;
		this[3] += w;
	}

	public sub(x: number, y: number, z: number, w: number) {
		this[0] -= x;
		this[1] -= y;
		this[2] -= z;
		this[3] -= w;
	}

	public mul(x: number, y: number, z: number, w: number) {
		this[0] *= x;
		this[1] *= y;
		this[2] *= z;
		this[3] *= w;
	}

	public div(x: number, y: number, z: number, w: number) {
		this[0] /= x;
		this[1] /= y;
		this[2] /= z;
		this[3] /= w;
	}

	public dot(x: number, y: number, z: number, w: number) {
		return this[0] * x + this[1] * y + this[2] * z + this[3] * w;
	}
}
