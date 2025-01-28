import { VecN } from './VecN.js';

const size = 3;

export class Vec3 extends VecN(size, Float32Array) {
	public static from(v: Float32Array) {
		this.assertSize(v);
		return new Vec3(v[0], v[1], v[2]);
	}

	public static assertSize(v: Float32Array): asserts v is Vec3 {
		if (v.length !== size) {
			throw new Error(
				`Expected ${size} or more elements, got ${v.length}`,
			);
		}
	}

	public constructor(x: number, y: number, z: number) {
		super();
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}

	public copy(v: Float32Array) {
		Vec3.assertSize(v);
		this[0] = v[0];
		this[1] = v[1];
		this[2] = v[2];
	}

	public add(x: number, y: number, z: number) {
		this[0] += x;
		this[1] += y;
		this[2] += z;
	}

	public sub(x: number, y: number, z: number) {
		this[0] -= x;
		this[1] -= y;
		this[2] -= z;
	}

	public mul(x: number, y: number, z: number) {
		this[0] *= x;
		this[1] *= y;
		this[2] *= z;
	}

	public div(x: number, y: number, z: number) {
		this[0] /= x;
		this[1] /= y;
		this[2] /= z;
	}

	public dot(x: number, y: number, z: number) {
		return this[0] * x + this[1] * y + this[2] * z;
	}
}
