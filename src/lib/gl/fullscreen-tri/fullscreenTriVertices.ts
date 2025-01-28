import { type VecN } from '../vector/VecN.js';

export const fullscreenTriVertices = new Float32Array([
	// bottom left
	-1, -1,
	// bottom right
	3, -1,
	// top left
	-1, 3,
]) as VecN<6, Float32Array>;
